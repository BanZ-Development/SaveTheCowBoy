const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Image = require('../model/Image');

function generateRandomCode() {
	return Math.random().toString(36).substring(2, 10).toUpperCase(); // Generates an 8-character alphanumeric code
}

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
		bio: String,
		firstName: String,
		lastName: String,
		phoneNumber: String,
		shipping: {
			address: String,
			city: String,
			state: String,
			zip: String
		},
		salt: {
			type: String,
			required: true
		},
		pfp: Object,
		verify: {
			code: {
				type: String,
				default: generateRandomCode
			},
			isVerified: {
				type: Boolean,
				default: false
			}
		},
		forgotPassword: {
			token: String,
			expirationDate: Date
		},
		dateCreated: {
			type: Date,
			default: new Date()
		}
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
	posts: [String],
	comments: [String],
	activeDate: Date,
	biblePlans: Array
});

module.exports = mongoose.model('User', userSchema);
