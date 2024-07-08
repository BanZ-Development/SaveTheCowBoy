const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Image = require('../model/Image');

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
		firstName: String,
		lastName: String,
		phoneNumber: String,
		address: String,
		salt: {
			type: String,
			required: true
		},
		pfp: Object
	},
	admin: {
		type: Boolean,
		required: true,
		default: false
	},
	subscription: {
		sessionID: {
			type: String
		},
		customer: {
			type: String
		}
	},
	forgotPassword: {
		token: String,
		expirationDate: Date
	},
	posts: [String]
});

module.exports = mongoose.model('User', userSchema);
