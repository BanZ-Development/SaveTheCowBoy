const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	content: { type: String, required: true },
	authorID: { type: String, required: true },
	author: { type: String, required: true },
	postDate: { type: Date, default: Date.now },
	comments: [Object]
});

module.exports = mongoose.model('Comment', commentSchema);
