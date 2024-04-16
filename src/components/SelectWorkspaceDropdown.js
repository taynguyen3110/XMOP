import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SelectWorkspaceDropdown = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [isIniting, setIsIniting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/workspaces')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch workspaces');
        }
        return response.json();
      })
      .then(data => setWorkspaces(data))
      .catch(error => console.error('Error fetching workspaces:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsIniting(true);
    localStorage.setItem("workspace", selectedWorkspace);


    try {
      const response = await fetch('/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workspaceName: selectedWorkspace })
      });

      if (!response.ok) {
        throw new Error('Failed to init terraform');
      }
      try {
        const response = await fetch('/check-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ workspaceName: selectedWorkspace })
        });

        if (!response.ok) {
          throw new Error('Failed to init terraform');
        }
        const { notDeployed } = await response.json();
        if (notDeployed) {
          navigate('/deploy-form'); // Navigate to deploy form
        } else {
          navigate('/monitor'); // Navigate to monitor
        }
      } catch (error) {
        console.error('Error check state file:', error);
      }
    } catch (error) {
      console.error('Error init terraform:', error);
    }
  };

  return (

    <form onSubmit={handleSubmit}>
      <h3>Select Workspace</h3>
      <select value={selectedWorkspace} onChange={(e) => setSelectedWorkspace(e.target.value)}>
        <option value="">Select a workspace</option>
        {workspaces.map(workspace => (
          <option key={workspace.name} value={workspace.name}>{workspace.name}</option>
        ))}
      </select>
      <button type="submit" disabled={!selectedWorkspace || isIniting}>
        {isIniting ? 'Initializing workspace' : 'Go to Workspace'}
      </button>
    </form>
  );
};

export default SelectWorkspaceDropdown;
