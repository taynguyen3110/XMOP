const fs = require('fs');
const express = require('express');
const router = express.Router();

router.post('/get-arn', (req, res) => {
    const { workspaceName } = req.body;
    const filePath = `./workspaces/${workspaceName}/terraform/Highly Available/terraform.tfstate`;

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist or cannot be accessed
            return res.status(500).json({ error: 'Internal server error' });
        }

        // File exists, read its content
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            try {
                const tfState = JSON.parse(data);
                
                let lbArnSuffix, tgArnSuffix, lbDns;
                
                const lbResource = tfState.resources.find(resource => resource.name === `wordpress_lb`);
                if (lbResource && lbResource.instances && lbResource.instances.length > 0) {
                    // Get the first instance (assuming there is only one)
                    const instance = lbResource.instances[0];
                    // Check if instance has attributes
                    if (instance.attributes) {
                        // Get the value of arn_suffix attribute
                        lbArnSuffix = instance.attributes.arn_suffix;
                        lbDns = instance.attributes.dns_name;
                    }
                }

                const tgResource = tfState.resources.find(resource => resource.name === `wordpress_tg`);
                if (tgResource && tgResource.instances && tgResource.instances.length > 0) {
                    // Get the first instance (assuming there is only one)
                    const instance = tgResource.instances[0];
                    // Check if instance has attributes
                    if (instance.attributes) {
                        // Get the value of arn_suffix attribute
                        tgArnSuffix = instance.attributes.arn_suffix;
                    }
                }

                return res.json({ lbArnSuffix, tgArnSuffix, lbDns });
            } catch (parseError) {
                console.error('Error parsing file content:', parseError);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    });
});

module.exports = router;
