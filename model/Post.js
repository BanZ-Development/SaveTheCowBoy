const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = require('../model/Comment');

const postSchema = new Schema({
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
	images: {
		type: Array,
		required: false
	},
	postDate: {
		type: Date,
		required: true
	},
	likes: [String],
	likesCount: {
		type: Number,
		default: 0
	},
	reports: {
		type: Array,
		required: false
	},
	comments: [Object],
	commentsCount: {
		type: Number,
		default: 0
	},
	tags: [String],
	type: {
		type: String,
		default: 'post'
	},
	releaseDate: {
		type: Date,
		default: new Date(),
		required: false
	}
});

module.exports = mongoose.model('Post', postSchema);
