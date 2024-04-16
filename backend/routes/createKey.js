const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const fs = require('fs');

const router = express.Router();
router.use(bodyParser.json());

// Set AWS credentials
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Define a function to handle AWS errors
function handleAWSError(res, e) {
    const error_message = `An error occurred while communicating with AWS: ${e.message}`;
    console.error(error_message);
    return res.status(500).json({ error: error_message });
}

// Define route to create a key pair and allow user to download it
router.post('/download-keypair', (req, res) => {
    // Generate a unique key pair name
    const { region, keyName } = req.body;

    // Create an EC2 client
    const ec2 = new AWS.EC2({ region });

    // Create key pair
    ec2.createKeyPair({ KeyName: keyName }, (err, data) => {
        if (err) {
            return handleAWSError(res, err);
        }

        try {
            // Extract private key from response
            const privateKey = data.KeyMaterial;

            // Save private key to a file
            const filename = `${keyName}.pem`;
            fs.writeFileSync(filename, privateKey);

            // Provide the file for download
            res.download(filename, filename, (err) => {
                if (err) {
                    console.error(`Error downloading file: ${err.message}`);
                }

                // Cleanup: Delete the private key file
                fs.unlinkSync(filename);
            });
        } catch (error) {
            return handleAWSError(res, error);
        }
    });
});

module.exports = router;
