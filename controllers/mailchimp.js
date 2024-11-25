require('dotenv').config();
const crypto = require('crypto');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const Mailchimp = require('mailchimp-api-v3');
let client;
if (process.env.MAILCHIMP_API_KEY) {
	client = new Mailchimp(process.env.MAILCHIMP_API_KEY);
}
mailchimp.setConfig({
	apiKey: process.env.MAILCHIMP_API_KEY,
	server: process.env.MAILCHIMP_DATA_CENTER
});

const hash = (email) => {
	return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
};

exports.addTag = async (email, tagName, tagValue) => {
	try {
		let emailHash = hash(email);
		return client
			.post(`lists/${process.env.MAILCHIMP_LIST_ID}/members/${emailHash}/tags`, {
				tags: [{ name: tagName, status: tagValue }]
			})
			.then((m) => {
				if (m && m.errors && Object.keys(m.errors).length > 0) {
					console.log('Error adding tag to subscriber', m.errors);
				}
				return m;
			})
			.catch((err) => {
				console.warn('Failed to tag subscriber', email, err);
			});
	} catch (err) {
		return err;
	}
};

exports.addUser = async (user) => {
	try {
		console.log('Mailchimp User:', user);
		// Construct the request body
		return client
			.post(`lists/${process.env.MAILCHIMP_LIST_ID}/members/`, {
				email_address: user.meta.email,
				status: 'subscribed',
				merge_fields: {
					FNAME: user.meta.firstName, // Provide first name
					LNAME: user.meta.lastName, // Provide last name
					ADDRESS: {
						addr1: user.meta.shipping.address,
						city: user.meta.shipping.city,
						state: user.meta.shipping.state,
						zip: user.meta.shipping.zip
					},
					PHONE: user.meta.phoneNumber,
					VA_CODE: `${process.env.URL}/verify?uid=${user.id}&code=${user.meta.verify.code}`
				}
			})
			.then((m) => {
				if (m && m.errors && Object.keys(m.errors).length > 0) {
					console.log('Error adding subscriber to list', m.errors);
				}
				return m;
			})
			.catch((err) => {
				console.warn('Failed to add subscriber', user.meta.email, err);
			});
	} catch (err) {
		return err;
	}
};

exports.updateMerge = async (email, code, expirationDate) => {
	try {
		let hashedEmail = hash(email);
		return client.patch(`lists/${process.env.MAILCHIMP_LIST_ID}/members/${hashedEmail}`, {
			merge_fields: {
				FP_CODE: code
			}
		});
	} catch (err) {
		return err;
	}
};
