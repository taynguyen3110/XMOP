const express = require('express');
const AWS = require('aws-sdk');

const router = express.Router();

// Initialize AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION
});



// Define a route to fetch metrics data
router.post('/get-metrics', (req, res) => {
    const { lbArnSuffix, tgArnSuffix, region } = req.body;

    // Create an AWS CloudWatch client
    const cloudwatch = new AWS.CloudWatch({region});
    // Load Balancer Metrics
    const lbParams1 = {
        EndTime: new Date(),
        MetricName: 'HealthyHostCount', // Change this to the metric you want to retrieve
        Namespace: 'AWS/ApplicationELB',
        Period: 300,
        StartTime: new Date(new Date().getTime() - 3600 * 1000),
        Dimensions: [
            {
                Name: 'LoadBalancer',
                Value: lbArnSuffix
            },
            {
                Name: 'TargetGroup',
                Value: tgArnSuffix
            }
        ],
        Statistics: ['Average']
    };

    // Auto Scaling Group Metrics
    const lbParams2 = {
        EndTime: new Date(),
        MetricName: 'TargetResponseTime', // Change this to the metric you want to retrieve
        Namespace: 'AWS/ApplicationELB',
        Period: 300,
        StartTime: new Date(new Date().getTime() - 3600 * 1000),
        Dimensions: [
            {
                Name: 'LoadBalancer',
                Value: lbArnSuffix
            }
        ],
        Statistics: ['Average']
    };

    // Fetch metrics data for Load Balancer
    cloudwatch.getMetricStatistics(lbParams1, (err1, data1) => {
        if (err1) {
            console.error(err1);
            res.status(500).json({ error: 'Failed to fetch Load Balancer metrics data' });
        } else {
            const sortedData1 = data1.Datapoints.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

            // Fetch metrics data for Auto Scaling Group
            cloudwatch.getMetricStatistics(lbParams2, (err2, data2) => {
                if (err2) {
                    console.error(err2);
                    res.status(500).json({ error: 'Failed to fetch Auto Scaling Group metrics data' });
                } else {
                    const sortedData2 = data2.Datapoints.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

                    res.json({
                        lbMetric1Data: sortedData1,
                        lbMetric2Data: sortedData2
                    });
                }
            });
        }
    });
});

module.exports = router;
