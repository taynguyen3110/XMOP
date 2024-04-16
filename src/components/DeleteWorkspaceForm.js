// DeleteWorkspaceForm.js
import React, { useState, useEffect } from 'react';

const DeleteWorkspaceForm = ({ onDelete }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');

  // Fetch the list of workspaces from the server
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = () => {
    fetch('/workspaces')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch workspaces');
        }
        return response.json();
      })
      .then(data => setWorkspaces(data))
      .catch(error => console.error('Error fetching workspaces:', error));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedWorkspace) {
      try {
        const response = await fetch('/check-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ workspaceName: selectedWorkspace })
        });
        if (!response.ok) {
          throw new Error(`Error checking state file, status: ${response.status}`);
        }
        const { notDeployed } = await response.json();
        if (notDeployed) {
          const confirmation = window.confirm(`Are you sure you want to delete workspace: ${selectedWorkspace}`);
          if (confirmation) {
            try {
              const response = await fetch(`/workspaces/${selectedWorkspace}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                throw new Error('Failed to delete workspace');
              }
              onDelete(selectedWorkspace);
              setSelectedWorkspace('');
              window.location.reload();
            } catch (error) {
              console.error('Error deleting workspace:', error);
            }
          }
        } else {
          // Show dialog box if workspace is deployed
          alert('There are some resources deployed within this workspace! please make sure you delete everything before deleting this workspace. Check tfstate file in workspace directory or go to AWS Management Console for more info!');
        }

      } catch (error) {
        console.error('Error checking state file:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Delete Workspace</h3>
      <select value={selectedWorkspace} onChange={(e) => setSelectedWorkspace(e.target.value)}>
        <option value="">Select workspace to delete</option>
        {workspaces.map(workspace => (
          <option key={workspace.name} value={workspace.name}>{workspace.name}</option>
        ))}
      </select>
      <button type="submit">Delete Workspace</button>
    </form>
  );
};

export default DeleteWorkspaceForm;
