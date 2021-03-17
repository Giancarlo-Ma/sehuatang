const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
	title: String,
	actor: String,
	mosaic: Boolean,
	imgs: [String],
	magnet: String,
	size: String,
  section: String
});

module.exports = mongoose.model('movie', movieSchema);