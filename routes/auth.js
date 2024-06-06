const router = require('express').Router();
const User = require('../model/User');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const passport = require('passport');
require('../controllers/local');

router.post('/login', passport.authenticate('local'), (req, res) => {
	res.send({
		status: true,
		message: 'Logged in'
	});
});

router.post('/signup', async (req, res) => {
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
		});
		res.send({
			status: true,
			message: 'User created'
		});
	}

	function Failed(result) {
		res.send({
			status: true,
			message: 'Input validation failed',
			errors: result
		});
	}
});

router.get('/logout', function (req, res) {
	req.session.destroy(function (err) {
		res.send({
			status: true,
			message: 'Successfully logged out'
		});
		res.redirect('/'); //Inside a callback… bulletproof!
	});
});

module.exports = router;
