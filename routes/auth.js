const router = require('express').Router();
const User = require('../model/User');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const passport = require('passport');
const crypto = require('crypto');
require('../controllers/local');

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
	res.send({
		status: true,
		message: 'Logged in'
	});
});

router.post('/isLoggedIn', (req, res) => {
	if (req.user) {
		res.send({
			status: true,
			message: 'User is logged in',
			username: req.user.meta.username
		});
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
		const { username, password, email } = req.body;
		const { hash, salt } = await hasher.returnHashAndSalt(password);

		await User.create({
			meta: {
				username: username,
				password: hash,
				email: email,
				salt: salt
			},
			admin: false
		})
			.then((user) => {
				console.log(user._id);
				res.send({
					status: true,
					message: 'User created',
					id: user._id
				});
			})
			.catch((error) => {
				res.send({
					status: false,
					error: error
				});
			});
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

	res.send({
		status: status,
		message: message
	});
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

module.exports = router;
