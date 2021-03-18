const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, section } = req.query;
    let movies = await Movie.find(section ? {section} : {})
    const count = movies.length
    movies = await Movie.find(section ? {section} : {})
              .limit(limit * 1)
              .skip((page - 1) * limit)
              .sort({date: -1})
              .exec();


    // return response with posts, total pages, and current page
    res.json({
      movies,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err)
    return res.status(500).send('SERVER ERROR')
  }
})

module.exports = router