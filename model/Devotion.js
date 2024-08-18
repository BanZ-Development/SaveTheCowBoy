const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const devotionSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	uID: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	releaseDate: {
		type: Date,
		required: true
	},
	likes: [String],
	likesCount: {
		type: Number,
		default: 0
	},
	comments: [Object],
	commentsCount: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('Devotion', devotionSchema);
