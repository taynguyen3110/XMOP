// Import necessary modules
const express = require('express');
const fs = require('fs');
const path = require('path');

// Create an instance of express router
const router = express.Router();

// Define the route to open a file
router.post('/open-file', (req, res) => {
    const { workspace, file } = req.body;

    if (!workspace || !file) {
        return res.status(400).json({ error: 'Workspace name or file path is missing' });
    }

    // Construct the full path to the file
    const fullPath = `./workspaces/${workspace}/terraform/Highly Available/${file}`;

    // Check if the file exists
    if (fs.existsSync(fullPath)) {
        // Read the file contents
        fs.readFile(fullPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Error reading file' });
            }
            // Send the file contents back to the client
            res.status(200).send(data);
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Export the router
module.exports = router;
