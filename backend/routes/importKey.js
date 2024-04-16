const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const fs = require('fs');
const multer = require('multer');

// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

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

// Define route to handle file upload and import key to AWS
router.post('/upload-key', upload.single('file'), (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check if awsRegion is provided in the request body
        const { awsRegion } = req.body;
        if (!awsRegion) {
            return res.status(400).json({ error: 'AWS region is required' });
        }

        // Read uploaded file
        const fileContent = fs.readFileSync(req.file.path);

        // Create an EC2 client for the specified region
        const ec2 = new AWS.EC2({ region: awsRegion });

        // Import key pair to AWS
        ec2.importKeyPair({
            KeyName: req.file.originalname, // Use original filename as key name
            PublicKeyMaterial: fileContent.toString() // Convert buffer to string
        }, (err, data) => {
            if (err) {
                return handleAWSError(res, err);
            }

            // Delete temporary file
            fs.unlinkSync(req.file.path);

            // Return success response
            return res.status(200).json({ message: 'Key imported to AWS successfully', keyData: data });
        });
    } catch (error) {
        return handleAWSError(res, error);
    }
});

module.exports = router;
