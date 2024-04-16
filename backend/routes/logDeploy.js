const fs = require('fs');
const express = require('express');
const router = express.Router();

router.post('/log-deploy', (req, res) => {
    const filePath = '../src/deployment.json';
    // Extract data from the request body
    const { deployId, workspace, region, deploymentTime, userId, status, destroyTime } = req.body;

    // Read the existing data or initialize as empty object
    fs.readFile(filePath, 'utf8', (err, data) => {
        let deploymentData = {};
        if (err && err.code !== 'ENOENT') { // File not found
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!err) { //File found, get file content
            try {
                deploymentData = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing file content:', parseError);
                return res.status(500).json({ error: 'Internal server error' });
            }
        }

        if (destroyTime === undefined) {
            // Update the deployment data with the provided values
            deploymentData[deployId] = {
                'workspace': workspace,
                'deployment-time': deploymentTime,
                'destroy-time': '', // Set destroy-time to empty string
                'user-id': userId,
                'status': status
            };
            // Update workspaces.json
            updateOngoingDeploy(workspace, region, deployId);
        }
        else {
            // Find the record with matching workspace and status: ongoing
            const ongoingRecord = Object.values(deploymentData).find(record => record.workspace === workspace && (record.status === 'ongoing' || record.status === 'broken'));
            if (!ongoingRecord) {
                console.error('No ongoing deployment found for workspace:', workspace);
                return res.status(404).json({ error: 'No ongoing deployment found for workspace' });
            }
            // Update destroyTime and status for the found record
            ongoingRecord['destroy-time'] = destroyTime;
            ongoingRecord['status'] = "destroyed";
            updateOngoingDeploy(workspace, "", "");
        }
        // Write the updated data back to the file
        fs.writeFile(filePath, JSON.stringify(deploymentData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            return res.json({ message: 'Deployment logged successfully' });
        });
    });
});

function updateOngoingDeploy(workspace, region, ongoingDeploy) {
    const filePath = './workspaces.json';

    // Read the existing workspaces data
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        try {
            // Parse the JSON data
            const workspaces = JSON.parse(data);

            // Check if the workspace exists
            if (workspaces[workspace]) {
                // Update the ongoingDeploy attribute
                workspaces[workspace].ongoingDeploy = ongoingDeploy;
                workspaces[workspace].region = region;

                // Write the updated data back to the file
                fs.writeFile(filePath, JSON.stringify(workspaces, null, 2), (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        return;
                    }
                    console.log(`Ongoing deploy for workspace "${workspace}" updated to "${ongoingDeploy}"`);
                });
            } else {
                console.error(`Workspace "${workspace}" not found`);
            }
        } catch (parseError) {
            console.error('Error parsing file content:', parseError);
            return;
        }
    });
}

module.exports = router;
