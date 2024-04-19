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

async function Authenticate(authAPI) {
	return new Promise(function (resolve) {
		setTimeout(() => {
			resolve(authAPI);
		}, 100);
	});
}

router.post('/signup', async (req, res) => {
	Authenticate(validate.register(req, res)).then((result) => (typeof result === 'object' && result !== null ? Failed(result) : Passed()));

	async function Passed() {
		let username = req.body.username;
		let password = req.body.password;
		let email = req.body.email;
		const { hash, salt } = hasher.returnHashAndSalt(password);
		const result = await User.create({
			meta: {
				username: username,
				password: hash,
				email: email,
				salt: salt
			}
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

module.exports = router;
