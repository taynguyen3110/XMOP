const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router(); // 'router' 인스턴스 생성

// Set AWS credentials
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION
});

// Define a function to handle AWS errors
function handleAWSError(res, e) {
    const error_message = `An error occurred while communicating with AWS: ${e}`;
    return res.status(500).json({ error: error_message });
}

// Define route for getting engine versions
router.post('/engine_versions', (req, res) => {
    const { engine_type, region } = req.body;

    if (!engine_type) {
        return res.status(400).json({ error: 'Engine type not provided' });
    }

    const rds = new AWS.RDS({region});

    rds.describeDBEngineVersions({ Engine: engine_type }, (err, data) => {
        if (err) {
            return handleAWSError(res, err);
        }

        const engine_versions = data.DBEngineVersions.map(version => version.EngineVersion);
        return res.json({ engine_versions });
    });
});

module.exports = router;
