const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
	reports: {
		type: Number,
		required: false
	}
});

module.exports = mongoose.model('Post', postSchema);
