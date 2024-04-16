const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router(); // Use express Router

// Set AWS credentials (이 부분은 실제 프로덕션 코드에 넣지 마세요. 환경 변수 등 보안이 강화된 방식을 사용하세요.)
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

router.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
});
  
// Define route for getting available regions
router.get('/available_regions', (req, res) => {
    const region = req.query.region || 'ap-southeast-2';
    const ec2 = new AWS.EC2({ region });

    ec2.describeRegions((err, data) => {
        if (err) {
            return handleAWSError(res, err);
        }
        const available_regions = data.Regions.map(region => region.RegionName);
        return res.json({ available_regions });
    });
});

module.exports = router; // Export the router
