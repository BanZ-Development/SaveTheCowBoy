require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../controllers/local');

mongoose.connection.once('open', () => {
	console.log('Connected to MongoDB');
});

router.use((req, res, next) => {
	console.log('Auth Middleware');
	console.log(req.user);
	if (req.user) next();
	else res.sendStatus(401);
});

router.post('/isLoggedIn', async (req, res) => {
	console.log(req.user);
	if (req.user) {
		res.send({
			status: true,
			message: 'User is logged in.'
		});
	} else {
		res.send({
			status: false,
			message: 'User is not logged in.'
		});
	}
});

module.exports = router;
