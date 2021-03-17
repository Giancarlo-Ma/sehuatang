const express = require('express')
const router = express.router()
const Movie = require('../models/movie')

router.get('/', async(req, res) => {
  try {
    const movies = Movie.find()
    res.json(movies)
  } catch(err) {
    console.error(err)
    return res.status(500).send('SERVER ERROR')
  }
})

module.exports = router