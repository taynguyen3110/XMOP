import React, { useEffect, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { TableContainer, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import userpool from '../userpool';
import { logout } from '../services/authenticate';
import deploymentsData from '../deployment.json';

const Dashboard = () => {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    const user = userpool.getCurrentUser();
    if (!user) {
      navigate('/login');
    }

    setDeployments(Object.entries(deploymentsData).map(([key, value]) => ({
      id: key,
      ...value,
    })));
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  console.log(deployments);
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(parseInt(timestamp, 10)).toLocaleString();
  };

  return (
    <div className='Dashboard' style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Deployment History Overview</h1>
        <Button variant='contained' onClick={handleLogout}>Logout</Button>
      </header>

      {/* <section style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button variant='contained' onClick={() => navigate('/workspace')}>Go to Workspace</Button>
      </section> <br/> */}

      <h2>Ongoing Deployments</h2>
      <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
        <Table aria-label="Ongoing Deployments">
          <TableHead>
            <TableRow>
              <TableCell>Workspace</TableCell> 
              <TableCell>User ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deployments.filter(deployment => deployment.status === 'ongoing').map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell>{deployment['workspace']}</TableCell> 
                <TableCell>{deployment['user-id']}</TableCell>
                <TableCell>{deployment.status}</TableCell>
                <TableCell>{formatDate(deployment['deployment-time'])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h2>Completed Deployments</h2>
      <TableContainer component={Paper}>
        <Table aria-label="Completed Deployments">
          <TableHead>
            <TableRow>
              <TableCell>Workspace</TableCell> 
              <TableCell>User ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Deployment Time</TableCell>
              <TableCell>Destroy Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deployments.filter(deployment => deployment.status !== 'ongoing').map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell>{deployment['workspace']}</TableCell> 
                <TableCell>{deployment['user-id']}</TableCell>
                <TableCell>{deployment.status}</TableCell>
                <TableCell>{formatDate(deployment['deployment-time'])}</TableCell>
                <TableCell>{formatDate(deployment['destroy-time'])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Dashboard;
