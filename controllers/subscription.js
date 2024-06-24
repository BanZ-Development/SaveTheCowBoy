const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const User = require('../model/User');

exports.checkIfExpired = async (subscription) => {
	console.log(subscription);
	return Date.now() > subscription.renewalDate;
};

exports.checkIfSubscribed = async (subscription) => {
	return subscription.checkIfSubscribed;
};
