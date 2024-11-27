require('dotenv').config();
const router = require('express').Router();
const User = require('../model/User');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const passport = require('passport');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const axios = require('axios');
const analytics = require('../controllers/analytics');
const mailchimp = require('../controllers/mailchimp');
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

async function isSubscribed(customerID) {
	try {
		const subscriptions = await stripe.subscriptions.list({
			customer: customerID,
			status: 'all' // Retrieve all subscriptions (active, past_due, etc.)
		});
		// Check if any subscription is still active
		const activeSubscription = subscriptions.data.find((sub) => sub.status === 'active' || sub.status === 'trialing');
		return activeSubscription;
	} catch (error) {
		console.error('Error retrieving subscriptions:', error);
		return false;
	}
}

router.post('/isLoggedIn', async (req, res) => {
	try {
		if (req.user) {
			let subscribed = await isSubscribed(req.user.subscription.customer);
			let params = {
				status: true,
				message: 'User is logged in',
				username: req.user.meta.username,
				uid: req.user.id,
				admin: req.user.admin,
				subscribed: subscribed,
				isVerified: req.user.meta.verify.isVerified
			};
			if (req.user.meta.pfp) params['pfp'] = req.user.meta.pfp.name;
			let date = new Date();
			let update = {
				activeDate: date
			};
			let pastDate = new Date(req.user.activeDate);
			if (date.toDateString() != pastDate.toDateString()) {
				//add to daily user
				console.log('add to daily active users');
				let user = await User.findByIdAndUpdate(req.user.id, update);
				let a = analytics.addDailyActiveUser(date);
			} else {
				//same day
			}
			let b = analytics.addTodayToUsersCalendar(date);
			let c = analytics.addTodayToPostsCalendar(date);
			res.send(params);
		} else {
			res.send({
				status: false,
				message: 'User is not logged in'
			});
		}
	} catch (err) {
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/signup', async (req, res) => {
	try {
		await validate.Authenticate(validate.register(req, res), Passed, Failed);

		async function Passed() {
			try {
				const { username, password, email, firstName, lastName, phoneNumber, address, city, state, zip } = req.body;
				if (await isUniqueUsernameAndEmail(username, email)) {
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

					let user = await User.create({
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
							},
							verify: {
								isVerified: false,
								code: crypto.randomBytes(10).toString('hex')
							}
						},
						admin: false,
						subscription: subscription
					});
					let created = await mailchimp.addUser(user);
					let tagged = await mailchimp.addTag(user.meta.email, 'newUser', 'active');
					console.log('User successfully added:', created);
					console.log('Tag successfully added:', tagged);
					if (created != undefined && tagged != undefined) {
						res.send({
							status: true,
							message: 'User account created and activation email is outgoing.',
							id: user.id,
							isReturningUser: status
						});
					} else {
						console.log('User failed to add:', created.errors);
						console.log('Tag failed to add:', tagged.errors);
						res.send({
							status: false,
							message: 'There was an error while processing your user activation code request.',
							errors: [created.errors, tagged.errors]
						});
					}
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
	try {
		const { username } = req.body;
		let status = true;
		let message = 'User has a unique username.';

		const query = User.where({
			'meta.username': username
		});
		const user = await query.findOne();
		if (user) {
			status = false;
			message = 'Please choose a unique username!';
		}

		res.send({
			status: status,
			message: message
		});
	} catch (e) {
		res.send({
			status: false,
			err: e.message
		});
	}
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

router.post('/get-reset-code', async (req, res) => {
	try {
		const { email } = req.body;
		const token = crypto.randomBytes(4).toString('hex');
		const expirationDate = Date.now() + 3600000;
		const update = {
			['meta.forgotPassword']: {
				token: token,
				expirationDate: expirationDate
			}
		};
		const query = User.where({
			'meta.email': email
		});
		const user = await query.findOne();
		if (user) {
			user.updateOne(update).then(async () => {
				//send email
				try {
					console.log(token, expirationDate);
					let merged = await mailchimp.updateMerge(user.meta.email, token);
					let untagged = await mailchimp.addTag(user.meta.email, 'forgotPassword', 'inactive');
					let tagged = await mailchimp.addTag(user.meta.email, 'forgotPassword', 'active');
					console.log('Merge successfully updated:', merged.merge_fields);
					console.log('Tag successfully added:', tagged);
					if (merged.errors == null && tagged.errors == null && untagged) {
						res.send({
							status: true,
							message: 'Password verification code updated internally and email is outgoing.'
						});
					} else {
						res.send({
							status: false,
							message: 'There was an error while processing your reset password request.',
							errors: [merged.errors, tagged.errors]
						});
					}
				} catch (error) {
					console.error('Failed to add tag:', error);
				}
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

router.post('/verify-reset-code', async (req, res) => {
	try {
		const { email, code } = req.body;
		const query = User.where({
			'meta.email': email
		});
		let user = await query.findOne();
		if (user) {
			if (user.meta.forgotPassword) {
				let { expirationDate, token } = user.meta.forgotPassword;
				if (Date.now() < expirationDate.getTime()) {
					console.log(code);
					console.log(token);
					if (code === token) {
						res.send({
							status: true,
							message: 'Password reset code verified.'
						});
					} else {
						res.send({
							status: false,
							message: 'Incorrect code.'
						});
					}
				} else {
					res.send({
						status: false,
						message: 'This code is expired. Try again.'
					});
				}
			} else {
				res.send({
					status: false,
					message: 'Incorrect email'
				});
			}
		} else {
			res.send({
				status: false,
				message: 'There is no account associated with this email.'
			});
		}
	} catch (error) {
		console.log(error);
		res.send({ status: false });
	}
});

router.post('/reset-password', async (req, res) => {
	try {
		const { email, code, password } = req.body;
		const query = User.where({
			'meta.email': email
		});
		let user = await query.findOne();
		let { expirationDate, token } = user.meta.forgotPassword;
		async function Passed() {
			const { hash, salt } = await hasher.returnHashAndSalt(password);
			user.meta.password = hash;
			user.meta.salt = salt;
			let save = await user.save();
			if (save) {
				res.send({
					status: true,
					message: 'Password has been reset'
				});
			} else {
				res.send({
					status: false,
					message: 'Error while resetting'
				});
			}
		}
		async function Failed(result) {
			res.send({
				status: false,
				message: 'Input validation failed',
				errors: result
			});
		}
		if (Date.now() < expirationDate.getTime() && code === token) {
			req.body.username = user.meta.username;
			await validate.Authenticate(validate.register(req, res), Passed, Failed);
		}
	} catch (error) {
		console.log(error);
		res.send({ status: false, error: error.message });
	}
});

router.post('/verify-account', async (req, res) => {
	try {
		let { uid, code } = req.body;
		console.log(uid, code);
		if (!uid || !code) {
			return res.send({
				status: false,
				message: 'You must supply a user ID and verification code!'
			});
		}
		let user = await User.findById(uid);
		console.log(user);
		if (!user) {
			return res.send({
				status: false,
				message: 'No account under this ID!'
			});
		}
		if (user.meta.verify.isVerified) {
			return res.send({
				status: true,
				message: 'Already verified'
			});
		} else {
			if (user.meta.verify.code === code) {
				user.meta.verify.isVerified = true;
				await user.save();
				return res.send({
					status: true,
					message: 'Account veriifed'
				});
			} else {
				return res.send({
					status: false,
					message: 'Incorrect verification code!'
				});
			}
		}
	} catch (error) {
		res.send({
			status: false,
			message: error.message
		});
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
