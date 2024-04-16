// routes/workspaces.js
const express = require('express');
const fs = require('fs-extra');
const { exec } = require('child_process');
const router = express.Router();

const WORKSPACES_FILE_PATH = './workspaces.json';


if (!fs.existsSync(WORKSPACES_FILE_PATH)) {
    // Create the file with an empty object if it doesn't exist
    fs.writeFileSync(WORKSPACES_FILE_PATH, JSON.stringify(workspaces), 'utf8');
}

// Route to create a new workspace
router.post('/', (req, res) => {
    let workspaces = {};
    if (fs.existsSync(WORKSPACES_FILE_PATH)) {
        const data = fs.readFileSync(WORKSPACES_FILE_PATH, 'utf8');
        workspaces = JSON.parse(data);
    }

    const { name } = req.body;

    // Check if workspace with the given name already exists
    if (workspaces.hasOwnProperty(name)) {
        return res.json({ error: 'Workspace with this name already exists' });
    }

    const id = Date.now().toString(); // Generate a unique ID
    const region = "";
    const ongoingDeploy = "";
    workspaces[name] = { id, name, region, ongoingDeploy };
    saveWorkspacesToFile(workspaces);
    // Create the parent directory if it doesn't exist
    fs.mkdir('./workspaces', { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating parent directory for workspace:', err);
            return res.status(500).send('Error creating workspace');
        }

        // Create a new directory for the workspace
        fs.mkdir(`./workspaces/${name}`, (err) => {
            if (err) {
                console.error('Error creating workspace directory:', err);
                return res.status(500).send('Error creating workspace');
            }

            // Copy Terraform folder to the new workspace directory
            fs.copy('./terraform', `./workspaces/${name}/terraform`);
        });
    });
    res.status(201).json({ id, name });
});

// Route to get a list of all workspaces
router.get('/', (req, res) => {
    let workspaces = {};
    if (fs.existsSync(WORKSPACES_FILE_PATH)) {
        const data = fs.readFileSync(WORKSPACES_FILE_PATH, 'utf8');
        workspaces = JSON.parse(data);
    }
    
    const workspaceList = Object.values(workspaces);
    res.json(workspaceList);
});

// Route to get details of a specific workspace
router.get('/:id', (req, res) => {
    let workspaces = {};
    if (fs.existsSync(WORKSPACES_FILE_PATH)) {
        const data = fs.readFileSync(WORKSPACES_FILE_PATH, 'utf8');
        workspaces = JSON.parse(data);
    }
    
    const { id } = req.params;
    const workspace = workspaces[id];
    if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
    }
    res.json(workspace);
});

// Route to delete a workspace
router.delete('/:name', (req, res) => {
    let workspaces = {};
    if (fs.existsSync(WORKSPACES_FILE_PATH)) {
        const data = fs.readFileSync(WORKSPACES_FILE_PATH, 'utf8');
        workspaces = JSON.parse(data);
    }
    
    const { name } = req.params;
    if (!workspaces[name]) {
        return res.status(404).json({ message: 'Workspace not found' });
    }
    try {
        // Remove the directory associated with the workspace
        fs.rm(`./workspaces/${name}`, { recursive: true });
        delete workspaces[name];
        saveWorkspacesToFile(workspaces);
        res.json({ message: 'Workspace deleted successfully' });
        // res.send('Workspace deleted successfully');
    } catch (err) {
        console.error('Error deleting workspace:', err);
        res.status(500).send('Error deleting workspace');
    }
});

// Function to save workspaces data to file
function saveWorkspacesToFile(workspaces) {
    const data = JSON.stringify(workspaces, null, 2);
    fs.writeFileSync(WORKSPACES_FILE_PATH, data, 'utf8');
}

module.exports = router;