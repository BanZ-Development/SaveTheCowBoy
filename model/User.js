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
	},
	subscription: {
		tier: {
			rank: Number,
			id: String
		},
		sessionID: {
			type: String
		},
		isSubscribed: {
			type: Boolean
		},
		customer: {
			type: String
		},
		renewalDate: Date
	},
	forgotPassword: {
		token: String,
		expirationDate: Date
	}
});

module.exports = mongoose.model('User', userSchema);
