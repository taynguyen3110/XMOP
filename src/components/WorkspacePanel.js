// AnotherPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userpool from '../userpool';
import { Button } from '@mui/material';
import CreateWorkspaceForm from './CreateWorkspaceForm';
import DeleteWorkspaceForm from './DeleteWorkspaceForm';
import SelectWorkspaceDropdown from './SelectWorkspaceDropdown';
import WorkspaceList from './WorkspaceList';
import { logout } from '../services/authenticate';
import logo from '../logo.svg';

const WorkspacePanel = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fetch the list of workspaces from the server
    useEffect(() => {
        const user = userpool.getCurrentUser();
        if (!user) {
            navigate('/login');
        }
    });

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

    // Function to handle deletion of a workspace
    const handleDeleteWorkspace = async (workspaceId) => {
        try {
            const response = await fetch(`/workspaces/${workspaceId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete workspace');
            }
            // Remove the deleted workspace from the local state
            setWorkspaces(prevWorkspaces => prevWorkspaces.filter(workspace => workspace.id !== workspaceId));
        } catch (error) {
            console.error('Error deleting workspace:', error);
        }
    };
    return (
        <div className='workspace' style={{ padding: '20px' }}>
		<header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <nav className="App-nav">
                    <a href="/workspace">Workspaces</a>
                    <a href="/deploy-form">Deployment Form</a>
                    <a href="/dashboard">Deployment History</a>
                    <Button variant='contained' onClick={handleLogout}>Logout</Button>
                </nav>
            </header>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                <h1>Workspaces</h1>
            </header>
            <p><em>You need to choose a workspace for deployment or for monitoring</em></p>
            <CreateWorkspaceForm onUpdate={() => setWorkspaces([...workspaces])} />
            <SelectWorkspaceDropdown workspaces={workspaces} onSelect={(selectedWorkspaceId) => console.log(selectedWorkspaceId)} />
            <DeleteWorkspaceForm workspaces={workspaces} onDelete={handleDeleteWorkspace} />
            {<WorkspaceList />}
<footer className="App-footer">
                <p>© 2024 Swinburne TIP X-MOP Team. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default WorkspacePanel;
