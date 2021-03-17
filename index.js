const express = require('express');
const { fork } = require('child_process')
const path = require('path')
const connectDB = require('./config/db')
const crawlerPath = path.join(__dirname, 'task', 'crawler')
const crawlerWorker = fork(crawlerPath)
crawlerWorker.on('message', msg => console.log(msg.data))
const app = express();
// Connect Database
// connectDB();
// app.use(express.json())
// // Define Routes
// app.use('/api/movie', require('./routes/movie'));

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log('server started'));
