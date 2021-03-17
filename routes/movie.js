const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const movies = await Movie.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // get total documents in the Posts collection 
    const count = await Movie.countDocuments();

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