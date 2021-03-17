const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
	title: {
		type: String
	},
	actor: String,
	mosaic: Boolean,
	image: [String],
	magnet: String,
	size: String,
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('movie', MovieSchema);