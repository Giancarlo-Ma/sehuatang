const express = require('express');
const bodyParser = require('body-parser');
const { fork } = require('child_process')
const path = require('path')
const crawlerPath = path.join(__dirname, 'task', 'crawler')
const crawlerWorker = fork(crawlerPath)
crawlerWorker.on('message', msg => console.log(msg.data))
const app = express();

app.use(bodyParser.json());

app.listen(3001, () => console.log('server started'));
