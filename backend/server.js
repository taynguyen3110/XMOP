const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
require('dotenv').config();


app.use(bodyParser.json());
app.use(cors());

const regionsRouter = require('./routes/getRegion');
app.use('/', regionsRouter);

const keyPairsRouter = require('./routes/getExistKey');
app.use('/', keyPairsRouter);

const createKeyRouter = require('./routes/createKey');
app.use('/', createKeyRouter);

const importKeyRouter = require('./routes/importKey');
app.use('/', importKeyRouter);

const getEngineVerRouter = require('./routes/getEngineVer');
app.use('/', getEngineVerRouter);

const deployAWSRouter = require('./routes/deployAWS');
app.use('/', deployAWSRouter);

const workspacesRouter = require('./routes/workspaces');
app.use('/workspaces', workspacesRouter);

const checkStateRouter = require('./routes/checkState');
app.use('/', checkStateRouter);

const logDeployRouter = require('./routes/logDeploy');
app.use('/', logDeployRouter);

const openFileRouter = require('./routes/openFile');
app.use('/', openFileRouter);

const getResourcesRouter = require('./routes/getResources');
app.use('/', getResourcesRouter);

const getResourceARNRouter = require('./routes/getResourceARN');
app.use('/', getResourceARNRouter);

const getMetricRouter = require('./routes/getMetricData');
app.use('/', getMetricRouter);


const port = 5000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
