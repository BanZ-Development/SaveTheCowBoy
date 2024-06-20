require('dotenv').config();
const router = require('express').Router();
const User = require('../model/User');
const passport = require('passport');
require('../controllers/local');

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

router.post('/create-checkout-session', async (req, res) => {
	console.log(req.body);
	try {
		const uid = req.body.uid;
		const session = await stripe.checkout.sessions.create({
			success_url: `http://localhost:5000/success?uid=${uid}`,
			cancel_url: 'http://localhost:5000/signup',
			line_items: [
				{
					price: process.env.STRIPE_DAY_WORKER,
					quantity: 1
				}
			],
			mode: 'subscription'
		});
		console.log('User ID: ' + uid);
		console.log('Session ID: ' + session.id);
		//save session id to user in db
		const filter = { _id: uid };
		const update = {
			subscription: {
				sessionID: session.id
			}
		};

		User.findOneAndUpdate(filter, update).then(() => {
			res.send({
				status: true,
				url: session.url
			});
		});
	} catch (error) {
		console.log(error);
		res.send({
			status: false,
			error: error.message
		});
	}
});

router.post('/start', function (req, res) {
	const { tier, username, email, password } = req.body;
	if (tier == undefined) {
		res.send({
			status: false,
			message: 'Please select a tier.'
		});
	} else if (username == undefined || email == undefined || password == undefined) {
		res.send({
			status: false,
			message: 'Please complete all sign-up fields'
		});
	} else {
		res.send({
			status: true,
			message: 'Begin checkout.'
		});
	}
});

router.post('/stripe-session', async (req, res) => {
	const uid = req.body.uid;
	const filter = { _id: uid };

	User.findOne(filter)
		.then(async (user) => {
			if (user) {
				console.log('User found:', user);
				//check if already subscribed
				if (!user.subscription.sessionID || user.subscription.isSubscribed) {
					res.send({ status: false });
					return;
				} else {
					try {
						const session = await stripe.checkout.sessions.retrieve(user.subscription.sessionID);
						const update = {
							subscription: {
								isSubscribed: true,
								tier: {
									id: session.subscription
								},
								customer: session.customer
							}
						};
						if (session && session.status === 'complete') {
							User.findOneAndUpdate(filter, update)
								.then((user) => {
									try {
										//login
									} catch (err) {
										console.log(err);
									}
									res.send({
										status: true,
										message: 'Payment succeeded.'
									});
								})
								.catch((error) => {
									res.send({
										status: false,
										error: error
									});
								});
						} else {
							res.send({ status: false });
						}
					} catch (error) {
						res.send({
							status: false
						});
					}
				}
			} else {
				res.send({
					status: false,
					message: 'User not found with that ID'
				});
			}
		})
		.catch((error) => {
			console.error('Error finding user:', error);
			res.send({ status: false });
		});
});

module.exports = router;
