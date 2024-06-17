const router = require('express').Router();
const User = require('../model/User');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');

router.post('/start', function (req, res) {
	const { index, username, email, password } = req.body;
	if (index == undefined) {
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

module.exports = router;
