const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const biblePlanSchema = new Schema({
	title: {
		required: true,
		type: String
	},
	description: {
		required: true,
		type: String
	},
	icon: {
		required: true,
		type: String
	},
	books: {
		required: true,
		type: Object
	}
});

module.exports = mongoose.model('Bible Plan', biblePlanSchema);
