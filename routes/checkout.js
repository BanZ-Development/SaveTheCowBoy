require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../model/User');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const tierToPriceID = (tier) => {
	switch (tier) {
		case '0':
			return process.env.STRIPE_DAY_WORKER;
		case '1':
			return process.env.STRIPE_RANCH_COWBOY;
		case '2':
			return process.env.STRIPE_JIGGER_BOSS;
		case '3':
			return process.env.STRIPE_TOP_HAND;
		case '4':
			return process.env.STRIPE_COW_BOSS;
		case '5':
			return process.env.STRIPE_CATTLE_BARON;
	}
};

router.post('/create-checkout-session', async (req, res) => {
	try {
		let uid;
		try {
			uid = req.user.id;
		} catch (e) {
			uid = req.body.uid;
		}
		if (uid == null || uid == '' || uid == 'undefined') {
			res.send({
				status: false,
				message: 'Could not create checkout session'
			});
		}
		const { tier } = req.body;
		const priceID = tierToPriceID(tier);
		console.log('Price: ' + priceID);
		const session = await stripe.checkout.sessions.create({
			success_url: `${process.env.URL}/success?uid=${uid}`,
			cancel_url: `${process.env.URL}/signup`,
			line_items: [
				{
					price: priceID,
					quantity: 1
				}
			],
			mode: 'subscription',
			subscription_data: {
				trial_period_days: 14
			}
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
				//check if already subscribed
				if (user.subscription.customer) {
					res.send({ status: false });
					return;
				} else {
					try {
						const session = await stripe.checkout.sessions.retrieve(user.subscription.sessionID);
						console.log(session);
						const subscription = await stripe.subscriptions.retrieve(session.subscription);
						const currentPeriodEnd = subscription.current_period_end; // Unix timestamp
						const date = new Date(currentPeriodEnd * 1000); // Convert to JavaScr
						console.log(date);
						const update = {
							subscription: {
								customer: session.customer
							}
						};
						if (session && session.status === 'complete') {
							User.findOneAndUpdate(filter, update)
								.then((user) => {
									res.send({
										status: true,
										message: 'Payment succeeded.'
									});
								})
								.catch((error) => {
									console.log(error);
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

router.post('/cancel-subscription', async (req, res) => {
	try {
		const customerID = req.user.subscription.customer;
		if (customerID) {
			const subscriptions = await stripe.subscriptions.list({
				customer: customerID,
				limit: 1
			});
			const firstSubscription = subscriptions.data[0];

			// Update the subscription to cancel at the end of the period
			const updatedSubscription = await stripe.subscriptions.update(firstSubscription.id, {
				cancel_at_period_end: true
			});

			res.send({
				status: true,
				message: 'Subscription cancelled.',
				subscription: updatedSubscription
			});
		} else {
			res.send({
				status: false,
				message: 'Subscription required to cancel'
			});
		}
	} catch (error) {
		res.send({ status: false, error: error.message });
	}
});

router.post('/renew-subscription', async (req, res) => {
	try {
		const customerID = req.user.subscription.customer;
		if (customerID) {
			const subscriptions = await stripe.subscriptions.list({
				customer: customerID,
				limit: 1
			});
			const firstSubscription = subscriptions.data[0];

			// Update the subscription to cancel at the end of the period
			const updatedSubscription = await stripe.subscriptions.update(firstSubscription.id, {
				cancel_at_period_end: false
			});

			res.send({
				status: true,
				message: 'Subscription renewed.',
				subscription: updatedSubscription
			});
		} else {
			res.send({
				status: false,
				message: 'Subscription required to renew'
			});
		}
	} catch (error) {
		res.send({ status: false, error: error.message });
	}
});

async function changeSubscription(customerId, newPriceId) {
	try {
		// Retrieve the customer's subscriptions
		const [activeSubscriptions, trialingSubscriptions] = await Promise.all([
			stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 }),
			stripe.subscriptions.list({ customer: customerId, status: 'trialing', limit: 1 })
		]);

		const subscriptions = [...activeSubscriptions.data, ...trialingSubscriptions.data];
		if (subscriptions.length === 0) {
			throw new Error('No active subscription found for this customer.');
		}
		const subscriptionId = subscriptions[0].id;

		// Update the subscription to the new price
		const changedSubscription = await stripe.subscriptions.update(subscriptionId, {
			items: [
				{
					id: subscriptions[0].items.data[0].id,
					price: newPriceId
				}
			],
			cancel_at_period_end: false,
			proration_behavior: 'none' // Ensure changes take effect from the next billing period
		});

		console.log('Subscription updated successfully:', changedSubscription);
		return changedSubscription;
	} catch (error) {
		console.error('Error updating subscription:', error);
		throw error;
	}
}

router.post('/change-subscription', async (req, res) => {
	try {
		const { priceID } = req.body;
		const customerID = req.user.subscription.customer;
		console.log(customerID, priceID);
		await changeSubscription(customerID, priceID)
			.then((subscription) => {
				res.send({
					status: true,
					message: 'Subscription changed!',
					subscription: subscription
				});
			})
			.catch((error) => {
				console.log(error);
				res.send({
					status: false,
					error: error.message
				});
			});
	} catch (error) {
		console.log(error);
		res.send({ status: false, error: error.message });
	}
});

router.post('/get-subscription', async (req, res) => {
	try {
		let admin = req.user.admin;
		let customerID = req.user.subscription.customer;
		if (customerID) {
			const subscriptions = await stripe.subscriptions.list({
				customer: customerID,
				limit: 1
			});
			const subscription = subscriptions.data[0];
			if (subscription) {
				res.send({
					status: true,
					subscription: subscription,
					admin: admin,
					message: 'Customer and subscription found.'
				});
			} else {
				res.send({
					status: true,
					subscription: null,
					admin: admin,
					message: 'No subscription found. Customer found, however.'
				});
			}
		} else {
			res.send({
				status: true,
				subscription: null,
				admin: admin,
				message: 'No customer account found!'
			});
		}
	} catch (error) {
		console.log(error);
		res.send({
			status: false,
			subscription: null,
			admin: req.user.admin,
			error: 'Error in get-subscription request'
		});
	}
});

const endpointSecret = process.env.STRIPE_WEBHOOK_KEY;
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
	const sig = request.headers['stripe-signature'];

	let event;

	try {
		event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
	} catch (err) {
		response.status(400).send(`Webhook Error: ${err.message}`);
		return;
	}

	console.log(event.type);
	// Handle the event
	switch (event.type) {
		case 'payment_intent.succeeded':
			const paymentIntentSucceeded = event.data.object;
			console.log(paymentIntentSucceeded);
			// Then define and call a function to handle the event payment_intent.succeeded
			break;
		// ... handle other event types
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	// Return a 200 response to acknowledge receipt of the event
	response.send();
});

module.exports = router;
