const router = require('express').Router();
const multer = require('multer');
const User = require('../model/User');
const Post = require('../model/Post');
const Report = require('../model/Report');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const analytics = require('../controllers/analytics');
const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();
require('../controllers/local');

router.get('/isAdmin', async (req, res) => {
	try {
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
	} catch (err) {
		res.send({ status: false });
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

router.post('/get-members', async (req, res) => {
	try {
		let { filter } = req.body;
		let users;
		filter = JSON.parse(filter);
		if (Object.entries(filter).length === 0) users = await User.find();
		else users = await User.find(filter);
		let members = [];
		users.forEach((user) => {
			members.push({
				uid: user.id,
				firstName: user.meta.firstName,
				lastName: user.meta.lastName,
				email: user.meta.email,
				phoneNumber: user.meta.phoneNumber,
				address: user.meta.shipping.address,
				city: user.meta.shipping.city,
				state: user.meta.shipping.state,
				zip: user.meta.shipping.zip,
				pfp: user.meta.pfp,
				admin: user.admin,
				customer: user.subscription.customer
			});
		});
		res.send({
			status: true,
			members: members
		});
	} catch (err) {
		console.log(err);
		res.send({ status: false, error: err.message });
	}
});

router.post('/get-analytics', async (req, res) => {
	try {
		analytics.setupAnalyticsInstance();
		let users = await User.find();
		let posts = await Post.find();
		let analytic = await analytics.getAnalytics();
		res.send({
			status: true,
			totalUsers: users.length,
			totalPosts: posts.length,
			dailyActiveUsers: analytic.dailyActiveUsers,
			usersCalendar: analytic.usersCalendar,
			postsCalendar: analytic.postsCalendar
		});
	} catch (err) {
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/get-reports', async (req, res) => {
	try {
		let response = [];
		let reports = await Report.find();
		res.send({ status: true, reports: reports });
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

module.exports = router;
