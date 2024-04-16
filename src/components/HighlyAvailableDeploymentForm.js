import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import userpool from '../userpool';
import { logout } from '../services/authenticate';

const HighlyAvailableDeploymentForm = () => {
  /* EC2 Configuration Consts */
  const [awsRegions, setAwsRegions] = useState([]);
  const [awsRegion, setAwsRegion] = useState("ap-southeast-2");
  const [minInstances, setMinInstances] = useState(1);
  const [maxInstances, setMaxInstances] = useState(1);
  const [selectedAmiType, setSelectedAmiType] = useState(""); // 선택된 AMI 유형을 저장할 상태 (Linux 또는 Ubuntu)
  const [imageId, setImageId] = useState(""); // 사용자가 입력한 Image ID를 저장할 상태 추가
  const [instanceType, setInstanceType] = useState("t2.micro");
  const [keyPairOption, setKeyPairOption] = useState("");
  const [keyPairNames, setKeyPairNames] = useState([]); // Key Pair 이름 목록을 저장할 상태
  const [selectedKeyPairName, setSelectedKeyPairName] = useState("");
  const [keyPairName, setKeyPairName] = useState(""); // 새로운 Key Pair 이름을 저장할 상태
  const [selectedKeyFile, setSelectedKeyFile] = useState(null);
  const [storageConfiguration, setStorageConfiguration] = useState("");
  const [storageType, setStorageType] = useState("");
  const [storageSize, setStorageSize] = useState(8);
  const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지를 저장할 새로운 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = userpool.getCurrentUser();
    if (!user) {
      navigate('/login');
    } else if (localStorage.getItem('workspace') === null) {
      navigate('/workspace');
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (localStorage.getItem('workspace') !== null) {
      const selectedWorkspace = localStorage.getItem('workspace');
      fetch('/check-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workspaceName: selectedWorkspace })
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
    }
  }, []);

  // 인스턴스 타입 목록을 추가
  const instanceTypes = ["t2.micro", "t2.medium", "t3.medium"];

  /* RDS Configuration Consts */
  const [dbEngine, setDbEngine] = useState('');
  const [engineVersions, setEngineVersions] = useState([]);
  const [selectedEngineVersion, setSelectedEngineVersion] = useState("");
  const [environment, setEnvironment] = useState('');
  const [dbInstanceType, setDbInstanceType] = useState('');
  const [availability, setAvailability] = useState('multiAz'); // Defaulting to Multi-Az

  /* API Fetch code */
  // AWS 지역 정보를 가져오는 useEffect
  useEffect(() => {
    fetch('/available_regions')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setAwsRegions(data.available_regions))
      .catch(error => {
        console.error("Fetching AWS regions failed:", error);
      });
  }, []);

  // Key Pair 목록을 가져오는 useEffect
  useEffect(() => {
    if (keyPairOption === "selectExisting") {
      const url = `/key-pairs${awsRegion ? `?region=${awsRegion}` : ''}`;

      fetch(url)
        .then(response => response.json()) // 첫 번째 then에서 response.json() 호출
        .then(data => {
          if (data.error) { // 백엔드에서 오류 메시지가 반환된 경우
            setErrorMessage("You do not have permission to view key pairs in this region."); // 오류 메시지 설정
            setKeyPairNames([]); // keyPairNames를 빈 배열로 설정
          } else {
            setKeyPairNames(data.keyPairs); // 성공적인 응답 처리
            setErrorMessage(""); // 오류 메시지 초기화
          }
        })
        .catch(error => {
          console.error("Fetching key pairs failed:", error);
          setErrorMessage("An error occurred while fetching key pairs."); // catch 블록에서 오류 처리
        });
    }
  }, [keyPairOption, awsRegion]);

  // Add a useEffect hook to fetch engine versions when dbEngine changes
  useEffect(() => {
    if (dbEngine) {
      const fetchEngineVersions = async () => {
        try {
          const response = await fetch('/engine_versions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              engine_type: dbEngine,
              region: awsRegion
            })
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setEngineVersions(data.engine_versions);
        } catch (error) {
          console.error("Failed to fetch engine versions:", error);
          setErrorMessage("Failed to fetch engine versions");
        }
      };

      fetchEngineVersions();
    }
  }, [dbEngine]);

  // Get form data
  // Generate unique tag for Wordpress resources
  const wpId = localStorage.getItem('workspace');
  const staticData = {
    id: wpId,
    username: "wordpressuser",
    password: "password",
    db_name: "wordpress",
    lb_ingress: [
      { from_port: 80, to_port: 80, protocol: "tcp", cidr_blocks: ["0.0.0.0/0"] },
      { from_port: 443, to_port: 443, protocol: "tcp", cidr_blocks: ["0.0.0.0/0"] },
    ],
    lb_egress: [
      { from_port: 0, to_port: 0, protocol: "-1", cidr_blocks: ["0.0.0.0/0"] },
    ]
  };

  const formContent = {
    region: awsRegion,
    os_option: selectedAmiType.toLowerCase(),
    ami_id: imageId,
    instance_type: instanceType,
    key_name: keyPairOption === "createNew" ? keyPairName : selectedKeyPairName,
    instance_count: minInstances,
    min_instance_count: minInstances,
    max_instance_count: maxInstances,
    storage_type: storageConfiguration,
    allocated_storage: parseInt(storageSize),
    engine: dbEngine,
    engine_version: selectedEngineVersion,
    environment_type: environment,
    instance_class: dbInstanceType,
    multi_az: availability === 'multiAz'
  };

  const updatedFormData = {
    ...staticData, // 먼저 staticData를 전개하여 기본 키와 값을 설정
    ...formContent,  // 사용자 입력을 통해 업데이트된 formData 값으로 오버라이드
  };

  const createNewKey = async () => {
    try {
      const response = await fetch('/download-keypair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          region: awsRegion,
          keyName: keyPairName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download key pair');
      }

      // If the response is successful, initiate download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${keyPairName}.pem`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error:', error.message);
      // Handle error
    }
  };

  const handleKeyFileChange = (event) => {
    setSelectedKeyFile(event.target.files[0]);
  };

  const importKey = async () => {
    if (!selectedKeyFile || !awsRegion) {
      console.error('File and AWS region are required');
      return;
    }
    try {
      // Create a FormData object to send the file to the server
      const keyData = new FormData();
      keyData.append('file', selectedKeyFile);
      keyData.append('awsRegion', awsRegion);

      // Make a POST request to upload the file to the server
      const response = await fetch('/upload-key', {
        method: 'POST',
        body: keyData
      });

      if (!response.ok) {
        throw new Error('Failed to upload key, please make sure you upload public key or check if this key already existed in AWS!');
      }
      window.alert("Key uploaded successfully!");
    } catch (error) {
      console.error('Error:', error.message);
      window.alert(error.message);
      // Handle error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const completeData = updatedFormData;
    const workspace = localStorage.getItem('workspace');
    const user = userpool.getCurrentUser();
    const userId = user.username;
    const reqBody = {
      formData: completeData,
      workspace
    }
    try {
      // Make POST request to backend API
      const response = await fetch('/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error('Error occurred while processing request');
      }

      // Get response data
      const responseData = await response.text();
      const planLine = responseData.replace(/\[\d+m/g, '').match(/Plan:.*/); // Output: Plan: 36 to add, 0 to change, 0

      // Handle response data (if needed)
      const confirmation = window.confirm(planLine);
      setIsSubmitting(false);
      // Terraform apply -auto-approve
      // If user confirms, make a request to apply the changes
      if (confirmation) {
        setIsDeploying(true);
        const applyReqBody = {
          workspace: workspace
        };
        const applyResponse = await fetch('/apply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(applyReqBody)
        });

        const applyData = await applyResponse.text();
        // Check if apply request was successful
        if (!applyResponse.ok) {
          // Logging
          try {
            const resourceCount = await getCount();
            if (resourceCount == 0) {
              setIsDeploying(false);
              sendDeploymentLog(workspace, userId, awsRegion, "failed");
              if (window.confirm("Deploy failed, please see the log in stderr.txt file in your workspace for more details.")) {
                window.location.reload();
              }
            } else if (resourceCount > 0) {
              setIsDeploying(false);
              sendDeploymentLog(workspace, userId, awsRegion, "broken");
              if (window.alert("Deploy partially completed, please see the log in stderr.txt file in your workspace for more details.")) {
                window.location.reload();
              }
            }
          } catch (error) {
            // Handle errors
          }
          throw new Error('Error occurred while applying changes');
        }
        // Get apply response data
        const applyLine = applyData.replace(/\[\d+m/g, '').match(/Apply complete! Resources:.*/); // Apply complete! Resources: 36 added, 0 changed, 0 destroyed.
        // Logging
        setIsDeploying(false);
        sendDeploymentLog(workspace, userId, awsRegion, "ongoing");

        if (window.confirm(applyLine)) {
          window.location.reload();
        }
      }

    } catch (error) {
      console.log(error); // Log any errors to console
    } finally {
      setIsSubmitting(false);
    }
  };

  async function sendDeploymentLog(workspaceName, userId, region, status) {
    const deployTime = Date.now().toString();
    const logData = {
      "deployId": deployTime,
      "workspace": workspaceName,
      "region": region,
      "deploymentTime": deployTime,
      "userId": userId,
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

      console.log('Deployment log sent successfully');
    } catch (error) {
      console.error('Error sending deployment log:', error.message);
    }
  }

  const getCount = async () => {
    const workspace = localStorage.getItem("workspace");
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceName: workspace })
    };

    try {
      const response = await fetch('/get-resources', requestOptions);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching resources:', error);
      return null;
    }
  };

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

  const handleOptionChange = (env) => {
    if (env === "production") {
      setImageId("ami-0df5c32c4d4710802");
      setSelectedAmiType("linux");
      setInstanceType("t2.micro");
      setMinInstances(3);
      setMaxInstances(5);
      setStorageConfiguration("gp3");
      setStorageSize(20);
      setDbEngine("mariadb");
      setSelectedEngineVersion("10.11.5");
      setEnvironment("production");
      setDbInstanceType("db.t3.micro");
      setAvailability("multiAz");
    } else if (env === "dev-test") {
      setImageId("ami-09c8d5d747253fb7a");
      setSelectedAmiType("ubuntu");
      setInstanceType("t2.micro");
      setMinInstances(2);
      setMaxInstances(3);
      setStorageConfiguration("gp2");
      setStorageSize(8);
      setDbEngine("mysql");
      setSelectedEngineVersion("8.0.35");
      setEnvironment("dev-test");
      setDbInstanceType("db.t3.micro");
      setAvailability("noReplicas");
    }
  }

  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 'auto', marginBottom: '20px', width: '80%' }}>
        <h1>Highly Available Deployment Form</h1>
        <Button variant='contained' onClick={handleLogout}>Logout</Button>
      </header>
      <form className="deployment-form" onSubmit={handleSubmit}>
        <div className="ec2">
          <h3>Workspace: {localStorage.getItem('workspace')}</h3>
          <h2>EC2 Configuration</h2>
          <label className="form-label">
            AWS Region:
            <select value={awsRegion} onChange={e => setAwsRegion(e.target.value)} className="form-input">
              {awsRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Environment:
            <label>
              <input
                type="radio"
                name="environment"
                value="production"
                checked={environment === 'production'}
                onChange={() => handleOptionChange("production")}
              />
              Production
            </label>
            <label>
              <input
                type="radio"
                name="environment"
                value="dev-test"
                checked={environment === 'dev-test'}
                onChange={() => handleOptionChange("dev-test")}
              />
              Dev/Test
            </label>
          </label>

          <label className="form-label">
            Minimum Number of Instances:
            <input
              className="form-input"
              type="number"
              value={minInstances}
              onChange={e => {
                const newMinInstances = Math.max(1, parseInt(e.target.value, 10));
                setMinInstances(newMinInstances);
              }}
            />
          </label>

          <label className="form-label">
            Maximum Number of Instances:
            <input
              className="form-input"
              type="number"
              value={maxInstances}
              onChange={e => {
                const newMaxInstances = Math.max(minInstances, parseInt(e.target.value, 10));
                setMaxInstances(newMaxInstances);
              }}
            />
          </label>

          {/* AMI 부분 */}
          <div>
            <label className="form-label">
              <span>AMI: </span>
              <input
                type="radio"
                name="amiType"
                value="Linux"
                checked={selectedAmiType === "linux"}
                onChange={() => setSelectedAmiType("linux")}
              />
              Linux
            </label>
            <label className="form-label">
              <input
                type="radio"
                name="amiType"
                value="Ubuntu"
                checked={selectedAmiType === "ubuntu"}
                onChange={() => setSelectedAmiType("ubuntu")}
              />
              Ubuntu
            </label>
          </div>

          <label className="form-label sub-label">
            Image ID:
            <input
              className="form-input"
              type="text"
              value={imageId}
              onChange={e => setImageId(e.target.value)}
            />
          </label>

          <label className="form-label">
            Instance Type:
            <select
              value={instanceType}
              onChange={e => setInstanceType(e.target.value)}
              className="form-input"
            >
              {instanceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <div>
            <label className="form-label">
              <span>Key pair:</span>
              <input
                type="radio"
                name="keyPairOption"
                value="selectExisting"
                checked={keyPairOption === "selectExisting"}
                onChange={() => setKeyPairOption("selectExisting")}
              />
              Select key pair
            </label>
            <label className="form-label">
              <input
                type="radio"
                name="keyPairOption"
                value="createNew"
                checked={keyPairOption === "createNew"}
                onChange={() => setKeyPairOption("createNew")}
              />
              Create new
            </label>
            <label className="form-label">
              <input
                type="radio"
                name="keyPairOption"
                value="import"
                checked={keyPairOption === "import"}
                onChange={() => setKeyPairOption("import")}
              />
              Import
            </label>
          </div>
          {/* "Select existing" 옵션 선택 시 드롭다운 메뉴 표시 */}
          {
            keyPairOption === "selectExisting" && (
              <label className="form-label sub-label">
                {Array.isArray(keyPairNames) && keyPairNames.length > 0 ? (
                  <select
                    value={selectedKeyPairName}
                    onChange={e => setSelectedKeyPairName(e.target.value)}
                    className="form-input"
                  >
                    {keyPairNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="form-label sub-label" style={{ color: 'red' }}>There are no key pairs available in this region.</p>
                )}
              </label>
            )
          }
          {/* 추가된 로직: "Create new"를 선택했을 때 Key Name 입력 필드를 보여줌 */}
          {keyPairOption === "createNew" && (
            <div>
              <label className="form-label sub-label">
                Key Name:
                <input
                  className="form-input"
                  type="text"
                  value={keyPairName}
                  onChange={e => setKeyPairName(e.target.value)}
                />
                <button type='button' onClick={createNewKey}>Download Key</button>
              </label>
            </div>
          )}

          {keyPairOption === "import" && (
            <div>
              <label className="form-label sub-label">
                Choose public key to import:
                <input
                  className="form-input"
                  type="file"
                  onChange={handleKeyFileChange}
                />
                <button type='button' onClick={importKey}>Import Key</button>
              </label>
            </div>
          )}

          <label className="form-label">
            Storage configuration:
            <label>
              <input
                type="radio"
                name="storageType"
                value="gp2"
                checked={storageConfiguration === 'gp2'}
                onChange={e => setStorageConfiguration(e.target.value)}
              />
              GP2
            </label>
            <label>
              <input
                type="radio"
                name="storageType"
                value="gp3"
                checked={storageConfiguration === 'gp3'}
                onChange={e => setStorageConfiguration(e.target.value)}
              />
              GP3
            </label>
          </label>
          <label className="form-label sub-label">
            GB:
            <input
              className="form-input"
              type="number"
              min="8" // Ensures the number is bigger than 8 GB
              placeholder="number bigger than 8 GB"
              value={storageSize}
              onChange={e => setStorageSize(e.target.value)}
            />
          </label>
        </div>

        <div className="rds">
          <h2>RDS Configuration</h2>
          <label className="form-label">
            DB Engine type:
            <select
              value={dbEngine}
              onChange={e => setDbEngine(e.target.value)}
              className="form-input"
            >
              <option value="">Select Engine Options</option>
              <option value="aurora-mysql">Aurora MySQL</option>
              <option value="aurora-postgresql">Aurora PostgreSQL</option>
              <option value="mariadb">MariaDB</option>
              <option value="mysql">MySQL</option>
              <option value="postgres">PostgreSQL</option>
            </select>
          </label>

          {dbEngine && engineVersions.length > 0 && (
            <label className="form-label sub-label">
              Engine version:
              <select
                value={selectedEngineVersion}
                onChange={e => setSelectedEngineVersion(e.target.value)}
                className="form-input"
              >
                <option value="">Select version</option>
                {engineVersions.map(version => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </label>
          )}

          <label className="form-label">
            Specs:
            <input
              className="form-input"
              type="text"
              placeholder="Data Base instance type"
              value={dbInstanceType}
              onChange={e => setDbInstanceType(e.target.value)}
            />
          </label>

          <label className="form-label">
            Availability:
            <label>
              <input
                type="radio"
                name="availability"
                value="multiAz"
                checked={availability === 'multiAz'}
                onChange={() => setAvailability('multiAz')}
              />
              Multi-Az
            </label>
            <label>
              <input
                type="radio"
                name="availability"
                value="noReplicas"
                checked={availability === 'noReplicas'}
                onChange={() => setAvailability('noReplicas')}
              />
              No replicas
            </label>
          </label>
        </div>
        {/* Submit button */}
        <button type="submit" className="submit-button" disabled={isSubmitting || isDeploying}>
          {isSubmitting ? 'Planning, please wait!' : isDeploying ? 'Deploying, please wait!' : 'Deploy'}
        </button>
      </form>
      <div>
        <button id="showLogBtn" onClick={() => handleOpenFile('stdout.txt')}>Output Log File</button>
        <button id="showLogBtn" onClick={() => handleOpenFile('stderr.txt')}>Error Log File</button>
      </div>
      <div id="logContainer" style={{ display: 'none' }}>
        <textarea id="logContent" rows="20" cols="120" readOnly></textarea>
        <button id="hideLogBtn" onClick={() => hideLogContainer()}>Close</button>
      </div>
    </div>
  );
};

export default HighlyAvailableDeploymentForm;
