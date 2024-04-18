import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userpool from '../userpool';
import LineGraph from './LineGraph';
import logo from '../logo.svg';
import { Button } from '@mui/material';
import { logout } from '../services/authenticate';

const Monitoring = () => {
  const [isDestroying, setIsDestroying] = useState(false);
  const [isPlanningDestroy, setIsPlanningDestroy] = useState(false);
  const [workspace, setWorkspace] = useState(localStorage.getItem('workspace'));
  const [lbDNS, setLbDNS] = useState("");
  const [lbMetric1Data, setlbMetric1Data] = useState([]);
  const [lbMetric2Data, setlbMetric2Data] = useState([]);
  const [count, setCount] = useState(null);
  const navigate = useNavigate();

  // Fetch the list of workspaces from the server
  useEffect(() => {
    const user = userpool.getCurrentUser();
    if (!user) {
      navigate('/login');
    }
  });

  useEffect(() => {
    fetch('/check-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ workspaceName: workspace })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error checking state file, status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const { notDeployed } = data;
        if (notDeployed) {
          navigate('/deploy-form'); // Navigate to deploy form
        } else {
          navigate('/monitor'); // Navigate to monitor
        }
      })
      .catch(error => {
        console.error('Error check state file:', error);
      });
  }, []);

const handleLogout = () => {
        logout();
        navigate('/login');
    };

  // Get metrics data
  useEffect(() => {
    // Get lb ARN and tg ARN
    fetch('/get-arn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workspaceName: workspace // Provide the actual workspace name
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const { lbArnSuffix, tgArnSuffix, lbDns } = data;
        setLbDNS(lbDns);
        // Get region of current workspace
        fetch(`/workspaces/${workspace}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            const { region } = data;
            // Get metrics data
            fetch('/get-metrics', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                lbArnSuffix,
                tgArnSuffix,
                region
              })
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                const { lbMetric1Data, lbMetric2Data } = data;
                setlbMetric1Data(lbMetric1Data);
                setlbMetric2Data(lbMetric2Data);
              })
              .catch(error => {
                console.error('Error fetching metric data:', error);
              });
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching ARN:', error);
      });
  }, []);

  const handleOpenFile = async (file) => {
    const workspace = localStorage.getItem('workspace');
    try {
      const response = await fetch('/open-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workspace, file })
      });
      if (!response.ok) {
        throw new Error('Failed to open file');
      }
      // Handle success response if needed
      document.getElementById('logContainer').style.display = 'block';
      const text = await response.text();
      const logContent = text ? text : "(There is no content in this file)";
      document.getElementById('logContent').value = logContent;

    } catch (error) {
      console.error('Error opening file:', error);
      // Handle error if needed
    }
  };

  const hideLogContainer = () => {
    document.getElementById('logContainer').style.display = 'none';
  };

  const handleDestroy = async (e) => {
    setIsPlanningDestroy(true);
    const workspace = localStorage.getItem('workspace');
    const destroyReqBody = { workspace: workspace };
    try {
      // Make POST request to backend API
      const response = await fetch('/destroy-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(destroyReqBody)
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error('Error occurred while processing request');
      }

      // Get response data
      const responseData = await response.text();
      const destroyLine = responseData.replace(/\[\d+m/g, '').match(/Plan:.*/); // Output: Plan: 0 to add, 0 to change, 36 to destroy.

      // Handle response data (if needed)
      setIsPlanningDestroy(false);
      const confirmation = window.confirm(destroyLine);

      // Terraform destroy -auto-approve
      // If user confirms, make a request to apply the changes
      if (confirmation) {
        setIsDestroying(true);
        const destroyResponse = await fetch('/confirm-destroy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(destroyReqBody)
        });

        // Check if apply request was successful
        if (!destroyResponse.ok) {
          throw new Error('Error occurred while applying changes');
        }

        // Get apply response data
        const destroyData = await destroyResponse.text();
        const destroyLine = destroyData.replace(/\[\d+m/g, '').match(/Destroy complete! Resources:.*/); // Destroy complete! Resources: 36 added, 0 changed, 0 destroyed.
        sendDestroyLog(workspace, "destroyed");
        setIsDestroying(false);
        if (window.confirm(destroyLine)) {
          window.location.reload();
        }
      }
      setIsDestroying(false);
    } catch (error) {
      console.log(error); // Log any errors to console
    } finally {
    }
  };

  async function sendDestroyLog(workspaceName, status) {
    const destroyTime = Date.now().toString();
    const logData = {
      "workspace": workspaceName,
      "destroyTime": destroyTime,
      "status": status
    };

    try {
      const response = await fetch('/log-deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        throw new Error('Failed to send deployment log');
      }

      console.log('Destroy log sent successfully');
    } catch (error) {
      console.error('Error sending destroy log:', error.message);
    }
  }

  const handleGetCount = () => {
    const workspace = localStorage.getItem("workspace");
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceName: workspace })
    };

    fetch('/get-resources', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setCount(data.count);
      })
      .catch(error => {
        console.error('Error fetching resources:', error);
      });
  };

  return (
    <div>
	     <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <nav className="App-nav">
                    <a href="/workspace">Workspaces</a>
                    <a href="/deploy-form">Deployment Form</a>
                    <a href="/dashboard">Deployment History</a>
                    <Button variant='contained' onClick={handleLogout}>Logout</Button>
                </nav>
            </header>
      <div>
        <h2>Monitoring Workspace: {`${localStorage.getItem('workspace')}`}</h2>
        <a href={`http://${lbDNS}/wordpress`} target={"_blank"}><p>${lbDNS}</p></a>


        <div>
          <button onClick={handleGetCount}>
            {count !== null ? `Resources Count: ${count}` : 'Fetch Resources'}
          </button>
          <button id="showLogBtn" onClick={() => handleOpenFile('stdout.txt')}>Output Log File</button>
          <button id="showLogBtn" onClick={() => handleOpenFile('stderr.txt')}>Error Log File</button>
        </div>
        <div id="logContainer" style={{ display: 'none' }}>
          <textarea id="logContent" rows="20" cols="100" readOnly></textarea>
          <button id="hideLogBtn" onClick={() => hideLogContainer()}>Close</button>
        </div>
        <h3>Healthy Host Count Metrics</h3>
        <div style={{ backgroundColor: 'white', width: '50%', margin: 'auto', marginBottom: '10px' }}>
          <LineGraph data={lbMetric1Data} />
        </div>
      </div>
      <div>
        <h3>Target Response Time Metrics</h3>
        <div style={{ backgroundColor: 'white', width: '50%', margin: 'auto', marginBottom: '10px' }}>
          <LineGraph data={lbMetric2Data} />
        </div>
      </div>

      <button className="destroy-button" onClick={handleDestroy} disabled={isPlanningDestroy || isDestroying}>
        {isPlanningDestroy ? 'Planning Destroy' : (isDestroying ? 'Destroying' : 'Destroy')}
      </button>
      <footer className="App-footer">
        <p>© 2024 Swinburne TIP X-MOP Team. All rights reserved.</p>
      </footer>
    </div>
  );


};

export default Monitoring;