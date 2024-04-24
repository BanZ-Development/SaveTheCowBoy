const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	meta: {
		username: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		salt: {
			type: String,
			required: true
		}
	},
	admin: {
		type: Boolean,
		required: true
	}
});

module.exports = mongoose.model('User', userSchema);
