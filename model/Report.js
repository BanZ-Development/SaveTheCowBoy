const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
	reasons: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: false
	},
	postID: {
		type: String,
		required: true
	},
	reporterID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Report', reportSchema);
