require('dotenv').config();
const router = require('express').Router();
const User = require('../model/User');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const tierToPriceID = (tier) => {
	switch (tier) {
		case 0:
			return process.env.STRIPE_DAY_WORKER;
		case 1:
			return process.env.STRIPE_RANCH_COWBOY;
		case 2:
			return process.env.STRIPE_JIGGER_BOSS;
		case 3:
			return process.env.STRIPE_TOP_HAND;
		case 4:
			return process.env.STRIPE_COW_BOSS;
		case 5:
			return process.env.STRIPE_CATTLE_BARON;
	}
};

router.post('/create-checkout-session', async (req, res) => {
	try {
		const { uid, tier } = req.body;
		const priceID = tierToPriceID(tier);
		const session = await stripe.checkout.sessions.create({
			success_url: `${process.env.URL}/success?uid=${uid}`,
			cancel_url: `${process.env.URL}/signup`,
			line_items: [
				{
					price: priceID,
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
				//check if already subscribed
				if (!user.subscription.sessionID || user.subscription.isSubscribed) {
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
								isSubscribed: true,
								tier: {
									id: session.subscription
								},
								customer: session.customer,
								renewalDate: date
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
	const id = req.user.id;
	const subscriptionID = req.user.subscription.tier.id;
	const update = {
		subscription: {
			tier: null,
			sessionID: null,
			isSubscribed: false,
			customer: null
		}
	};
	if (req.user.subscription.isSubscribed && subscriptionID) {
		try {
			const subscription = await stripe.subscriptions.update(subscriptionID, { cancel_at_period_end: true }).then(() => {
				res.send({
					status: true,
					message: 'Subscription cancelled successfully'
				});
			});
		} catch (error) {
			console.log(error);
			res.send({
				status: false,
				error: error.message
			});
		}
	} else {
		res.send({
			status: false,
			message: 'Subscription required to cancel'
		});
	}
});

async function changeSubscription(customerId, newPriceId) {
	try {
		// Retrieve the customer's subscriptions
		const subscriptions = await stripe.subscriptions.list({
			customer: customerId,
			status: 'active',
			limit: 1
		});

		if (subscriptions.data.length === 0) {
			throw new Error('No active subscription found for this customer.');
		}

		const subscriptionId = subscriptions.data[0].id;

		// Update the subscription to the new price
		const changedSubscription = await stripe.subscriptions.update(subscriptionId, {
			items: [
				{
					id: subscriptions.data[0].items.data[0].id,
					price: newPriceId
				}
			],
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
		const id = req.user.id;
		const user = await User.findById(id);
		console.log(user);
		const customerID = user.subscription.customer;
		const tier = req.body.tier;
		const priceID = tierToPriceID(tier);
		console.log(customerID, tier, priceID);
		changeSubscription(customerID, priceID)
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

module.exports = router;
