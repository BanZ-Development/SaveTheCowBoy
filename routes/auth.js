require('dotenv').config();
const router = require('express').Router();
const User = require('../model/User');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const passport = require('passport');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
require('../controllers/local');

router.post('/login', async (req, res) => {
	passport.authenticate('local', { keepSessionInfo: true }, function (err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.send({ status: false, message: info.message }); // Return the custom message
		}
		req.logIn(user, function (err) {
			if (err) {
				return next(err);
			}
			return res.send({ status: true, message: 'Login successful' });
		});
	})(req, res);
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
	res.send({
		status: true,
		message: 'Logged in'
	});
});

router.post('/isLoggedIn', (req, res) => {
	if (req.user) {
		let params = {
			status: true,
			message: 'User is logged in',
			username: req.user.meta.username,
			uid: req.user.id
		};
		if (req.user.meta.pfp) params['pfp'] = req.user.meta.pfp.name;
		res.send(params);
	} else {
		res.send({
			status: false,
			message: 'User is not logged in'
		});
	}
});

router.post('/signup', async (req, res) => {
	console.log(req.body);
	validate.Authenticate(validate.register(req, res), Passed, Failed);

	async function Passed() {
		try {
			const { username, password, email } = req.body;
			if (isUniqueUsernameAndEmail(username, email)) {
				const { hash, salt } = await hasher.returnHashAndSalt(password);
				let subscription = null;

				const { status, customerID } = await isReturningUser(email);
				if (status) {
					const sub = await getSubscriptionByCustomer(customerID);
					subscription = {
						isSubscribed: true,
						tier: {
							id: sub.id
						},
						customer: customerID,
						renewalDate: sub.current_period_end
					};
				}

				await User.create({
					meta: {
						username: username,
						password: hash,
						email: email,
						salt: salt
					},
					admin: false,
					subscription: subscription
				})
					.then((user) => {
						console.log(user._id);
						res.send({
							status: true,
							message: 'User created',
							id: user._id,
							isReturningUser: status
						});
					})
					.catch((error) => {
						res.send({
							status: false,
							error: error
						});
					});
			} else {
				res.send({
					status: false,
					message: 'Cannot sign up because either username or email is not unique!'
				});
			}
		} catch (err) {
			console.log(err);
		}
	}

	function Failed(result) {
		res.send({
			status: false,
			message: 'Input validation failed',
			errors: result
		});
	}
});

router.get('/logout', function (req, res) {
	try {
		res.cookie('pfp', '', { expires: new Date(0), path: '/' });
	} catch (err) {}
	req.session.destroy(function (err) {
		res.send({
			status: true,
			message: 'User logged out.'
		});
	});
});

router.post('/check-unique-username', async (req, res) => {
	const { username } = req.body;
	let status = true;
	let message = 'User has a unique username.';
	try {
		const query = User.where({
			'meta.username': username
		});
		const user = await query.findOne();
		if (user) {
			status = false;
			message = 'Please choose a unique username!';
		}
	} catch (e) {}

	res.send({
		status: status,
		message: message
	});
});

router.post('/check-unique-email', async (req, res) => {
	const { email } = req.body;
	let status = true;
	let message = 'User has a unique email.';
	try {
		const query = User.where({
			'meta.email': email
		});
		const user = await query.findOne();
		if (user) {
			status = false;
			message = 'Please choose a unique email!';
		}
	} catch (e) {}
	try {
		const returningUser = await isReturningUser(email);
		console.log(returningUser);
		if (returningUser.status) {
			res.send({
				status: status,
				returningUser: true,
				message: 'Unique username and is a returning user'
			});
		} else {
			res.send({
				status: status,
				returningUser: false,
				message: message
			});
		}
	} catch (e) {
		console.log(e.message);
	}
});

router.post('/forgot-password', async (req, res) => {
	const { email } = req.body;
	const token = crypto.randomBytes(20).toString('hex');
	const update = {
		forgotPassword: {
			token: token,
			expirationDate: Date.now() + 3600000
		}
	};

	try {
		const query = User.where({
			'meta.email': email
		});
		const user = await query.findOne();
		if (user) {
			user.updateOne(update).then(async () => {
				//send email
			});
		} else {
			res.send({
				status: false,
				message: 'No user found with that email'
			});
		}
	} catch (error) {
		console.log(error);
		res.send({ status: false });
	}
});

const isUniqueUsernameAndEmail = async (username, email) => {
	try {
		let status = true;
		let query = User.where({
			'meta.email': email
		});
		let user = await query.findOne();
		if (user) status = false;
		query = User.where({
			'meta.username': username
		});
		user = await query.findOne();
		if (user) status = false;
		return status;
	} catch (e) {}
};

const isReturningUser = async (email) => {
	try {
		let customer = null;
		let hasMore = true;
		let startingAfter = null;

		while (hasMore) {
			const options = {
				limit: 100 // Stripe allows a max of 100 per request
			};
			if (startingAfter) {
				options.starting_after = startingAfter;
			}

			const customers = await stripe.customers.list(options);
			customer = customers.data.find((c) => c.email === email);

			if (customer) {
				break;
			}

			hasMore = customers.has_more;
			startingAfter = customers.data.length > 0 ? customers.data[customers.data.length - 1].id : null;
		}

		if (customer) {
			console.log(`[${email}] -> Customer found: ${customer.id}`);
			return {
				status: true,
				customerID: customer.id,
				email: email
			};
		} else {
			console.log('[${email}] -> Customer not found.');
			return {
				status: false,
				email: email
			};
		}
	} catch (error) {
		console.log(error);
	}
};

const getSubscriptionByCustomer = async (customerID) => {
	try {
		const subscriptions = await stripe.subscriptions.list({
			customer: customerID,
			limit: 100 // Adjust the limit as needed
		});
		return subscriptions.data[0];
	} catch (error) {
		console.error('Error retrieving subscriptions:', error);
		return null;
	}
};

module.exports = router;
