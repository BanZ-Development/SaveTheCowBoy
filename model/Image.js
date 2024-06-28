const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	contentType: {
		type: String,
		required: true
	},
	uploadDate: {
		type: Date,
		required: true
	},
	fileID: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Image', imageSchema);
