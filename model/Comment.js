const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	content: { type: String, required: true },
	authorID: { type: String, required: true },
	author: { type: String, required: true },
	postID: { type: String, required: true },
	postDate: { type: Date, default: Date.now },
	comments: [Object],
	commentsCount: {
		type: Number,
		default: 0
	},
	likes: [String],
	likesCount: {
		type: Number,
		default: 0
	},
	reports: {
		type: Array,
		required: false
	}
});

module.exports = mongoose.model('Comment', commentSchema);
