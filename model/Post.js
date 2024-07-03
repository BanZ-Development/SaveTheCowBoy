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
		type: Number,
		required: false
	},
	comments: [Object],
	tags: [String]
});

module.exports = mongoose.model('Post', postSchema);
