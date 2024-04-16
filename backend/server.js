const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

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

// 'getEngineVer.js' 라우터 추가
const getEngineVerRouter = require('./routes/getEngineVer');
app.use('/', getEngineVerRouter); // '/' 경로에 라우터를 추가합니다.

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


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
