// WorkspaceList.js
import React, { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { TableContainer, Paper } from '@mui/material';

const WorkspaceList = () => {
  const [workspaces, setWorkspaces] = useState([]);

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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(parseInt(timestamp, 10)).toLocaleString();
  };
  return (
    <div>
      {/* <h3>Available Workspaces</h3>
      <ul>
        {workspaces.map(workspace => (
          <li key={workspace.id}>{workspace.name}</li>
        ))}
      </ul> */}

      <h2>Deployed Workspaces</h2>
      <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
        <Table aria-label="Ongoing Deployments">
          <TableHead>
            <TableRow>
              <TableCell>Workspace</TableCell>
              <TableCell>Time created</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Deployment time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workspaces.filter(workspace => workspace.ongoingDeploy !== "").map((workspace) => (
              <TableRow key={workspace.id}>
                <TableCell>{workspace['name']}</TableCell>
                <TableCell>{formatDate(workspace['id'])}</TableCell>
                <TableCell>{workspace['region']}</TableCell>
                <TableCell>{formatDate(workspace['ongoingDeploy'])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h2>Undeployed Workspaces</h2>
      <TableContainer component={Paper}>
        <Table aria-label="Completed Deployments">
          <TableHead>
            <TableRow>
              <TableCell>Workspace</TableCell>
              <TableCell>Time created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workspaces.filter(workspace => workspace.ongoingDeploy === "").map((workspace) => (
              <TableRow key={workspace.id}>
                <TableCell>{workspace['name']}</TableCell>
                <TableCell>{formatDate(workspace['id'])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default WorkspaceList;
