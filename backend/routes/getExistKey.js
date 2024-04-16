const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

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

// Define route to get available key pairs in a region
router.get('/key-pairs', (req, res) => {
    const region = req.query.region;

    if (!region) {
        return res.status(400).json({ error: 'Region not provided' });
    }

    const ec2 = new AWS.EC2({ region });

    ec2.describeKeyPairs({}, (err, data) => {
        if (err) {
            return handleAWSError(res, err);
        }

        try {
            const keyPairs = data.KeyPairs.map(pair => pair.KeyName);
            return res.json({ keyPairs });
        } catch (error) {
            return handleAWSError(res, error);
        }
    });
});

module.exports = router;
