require('dotenv').config();
const router = require('express').Router();
const User = require('../model/User');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const passport = require('passport');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const axios = require('axios');
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
			uid: req.user.id,
			admin: req.user.admin
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
	try {
		await validate.Authenticate(validate.register(req, res), Passed, Failed);

		async function Passed() {
			try {
				const { username, password, email, firstName, lastName, phoneNumber, address, city, state, zip } = req.body;
				if (isUniqueUsernameAndEmail(username, email)) {
					const { hash, salt } = await hasher.returnHashAndSalt(password);
					let subscription = null;

					const { status, customerID } = await isReturningUser(email);
					if (status) {
						const sub = await getSubscriptionByCustomer(customerID);
						console.log('Subscription: \n');
						console.log(sub);
						subscription = {
							isSubscribed: true,
							tier: sub.plan.id,
							customer: customerID,
							renewalDate: sub.current_period_end
						};
					}

					await User.create({
						meta: {
							username: username,
							password: hash,
							email: email,
							salt: salt,
							firstName: firstName,
							lastName: lastName,
							phoneNumber: phoneNumber,
							shipping: {
								address: address,
								city: city,
								state: state,
								zip: zip
							}
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

		async function Failed(result) {
			res.send({
				status: false,
				message: 'Input validation failed',
				errors: result
			});
		}
	} catch (error) {
		res.send({
			status: false,
			message: 'Input validation failed',
			error: error
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
	try {
		const query = User.where({
			'meta.email': email
		});
		const user = await query.findOne();
		if (user) {
			res.send({
				status: false,
				message: 'Please choose a unique email'
			});
		}
	} catch (e) {}
	try {
		const { status, customerID } = await isReturningUser(email);
		if (status) {
			res.send({
				status: true,
				returningUser: true,
				message: 'Unique username and is a returning user'
			});
		} else {
			res.send({
				status: true,
				returningUser: false,
				message: 'User has a unique email'
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
		const response = await axios.get('https://api.stripe.com/v1/customers', {
			headers: {
				Authorization: `Bearer ${process.env.STRIPE_PRIVATE_KEY}`,
				'Content-Type': 'application/json'
			},
			params: {
				email: email
			}
		});

		const customer = response.data.data[0];
		const isReturning = response.data.data.length !== 0;
		if (customer) {
			console.log(`[${email}] -> Customer found: ${customer.id}`);
			return {
				status: isReturning,
				customerID: customer.id,
				email: email
			};
		} else {
			console.log(`[${email}] -> Customer not found.`);
			return {
				status: false,
				email: email
			};
		}
	} catch (error) {
		console.error('Error:', error.message);
		return false;
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
