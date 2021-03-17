const express = require('express');
const { fork } = require('child_process')
const path = require('path')
const connectDB = require('./config/db')
const mongoose = require('mongoose')
require('./models/movie')
const crawlerPath = path.join(__dirname, 'task', 'crawler')
  ; (async () => {
    await connectDB()
    const crawlerWorker = fork(crawlerPath)
    let data;
    crawlerWorker.on('message', async msg => {
      console.log(msg.data)
      data = msg.data
      const Movie = mongoose.model('movie')
      data.forEach(async item => {
        let movie = await Movie.findOne({
          magnet: item.magnet
        })
        console.log(movie)
        if (!movie) {
          movie = new Movie(item)
          await movie.save()
        }
      })
    })

    const app = express();
    // Connect Database

    app.use(express.json())
    // Define Routes
    app.use('/api/movie', require('./routes/movie'));

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => console.log('server started'));
  })()
