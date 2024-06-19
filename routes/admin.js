const router = require('express').Router();
const multer = require('multer');
const User = require('../model/User');
const Post = require('../model/News');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();
require('../controllers/local');

router.get('/isAdmin', async (req, res) => {
	console.log(req.user.admin);
	if (req.user.admin) {
		res.send({
			status: true
		});
	} else {
		res.send({
			status: false
		});
	}
});

router.use((req, res, next) => {
	if (req.user) next();
	else res.sendStatus(401);
});

router.use((req, res, next) => {
	if (req.user.admin) next();
	else res.sendStatus(401);
});

router.post('/news', async (req, res) => {
	validate.Authenticate(validate.news(req, res), Passed, Failed);

	async function Passed() {
		const { username } = req.user.meta.username;
		const { title, message, expireDate } = req.body;
		const postDate = new Date();

		let params = {
			title: title,
			message: message,
			postDate: postDate
		};
		if (expireDate) params['expireDate'] = expireDate;

		const result = await News.create(params);
		res.send({
			status: true,
			message: 'News has been created!',
			params: params
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
