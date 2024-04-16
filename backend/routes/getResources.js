const fs = require('fs');
const express = require('express');
const router = express.Router();

router.post('/get-resources', (req, res) => {
    const { workspaceName } = req.body;
    const filePath = `./workspaces/${workspaceName}/terraform/Highly Available/terraform.tfstate`;

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist or cannot be accessed, count = 0, no resource is deployed
            return res.json({ count: 0 });
        }

        // File exists, read its content
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            try {
                const tfState = JSON.parse(data);

                // Check if resources array is empty
                const count = tfState.resources ? tfState.resources.length : 0;
                return res.json({ count });
            } catch (parseError) {
                console.error('Error parsing file content:', parseError);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    });
});

module.exports = router;
