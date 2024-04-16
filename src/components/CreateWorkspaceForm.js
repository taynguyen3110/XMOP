// CreateWorkspaceForm.js
import React, { useState } from 'react';

const CreateWorkspaceForm = ({ onUpdate }) => {
  const [workspaceName, setWorkspaceName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (workspaceName.match("^[a-z0-9-]{5,18}$") != null) {
      try {
        const response = await fetch('/workspaces', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: workspaceName }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error('Failed to create workspace');
        }
        if (data.error == "Workspace with this name already exists") {
          window.alert(data.error);
        }
        onUpdate(data);
        setWorkspaceName('');

      } catch (error) {
        console.error('Error creating workspace:', error);
      }
    } else {
      window.alert("Only lowercase alphanumeric characters and hyphens allowed (min. 5, max. 18 characters)");
    }


    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Workspace</h3>
      <input
        type="text"
        value={workspaceName}
        onChange={(e) => setWorkspaceName(e.target.value)}
        placeholder="Enter Workspace name"
        title="Only lowercase alphanumeric characters and hyphens allowed (min. 5, max. 18 characters)"
        required
      />
      <button type="submit">Create Workspace</button>
    </form>
  );
};

export default CreateWorkspaceForm;
