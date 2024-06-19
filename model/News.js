const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema = new Schema({
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
	expireDate: {
		type: Date,
		required: false
	}
});

module.exports = mongoose.model('News', newsSchema);
