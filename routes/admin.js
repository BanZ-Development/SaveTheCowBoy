const router = require('express').Router();
const multer = require('multer');
const User = require('../model/User');
const Post = require('../model/Post');
const Report = require('../model/Report');
const BiblePlan = require('../model/BiblePlan');
const Devotion = require('../model/Devotion');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const analytics = require('../controllers/analytics');
const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();
require('../controllers/local');

const DateText = (date) => {
	const options = { month: 'long' };
	const month = new Intl.DateTimeFormat('en-US', options).format(date);
	const day = date.getDate();
	const year = date.getFullYear();
	return `${month} ${day}, ${year}`;
};

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
				username: user.meta.username,
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
		let { id } = req.body;
		let filter = {};
		if (id == 'currentReportsBtn') filter.ignored = false;
		else if (id == 'ignoredReportsBtn') filter.ignored = true;
		else filter.ignored = false;
		let reports = await Report.find(filter);
		let type = filter.ignored ? 'Ignored' : 'Current';
		res.send({ status: true, reports: reports, type: type });
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/delete-report', async (req, res) => {
	try {
		let { reportID } = req.body;
		let report = await Report.findByIdAndDelete(reportID);
		let { postID } = report;
		let post = await Post.findByIdAndDelete(postID);
		if (report) {
			if (post) {
				res.send({
					status: true,
					message: 'Report and post deleted'
				});
			} else {
				let comment = await Comment.findByIdAndDelete(postID);
				if (comment) {
					res.send({
						status: true,
						message: 'Report and comment deleted'
					});
				} else {
					res.send({
						status: false,
						message: 'No post or comment found with that ID'
					});
				}
			}
		} else {
			res.send({
				status: false,
				message: 'No report found with that ID'
			});
		}
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/ignore-report', async (req, res) => {
	try {
		let { reportID } = req.body;
		let report = await Report.findById(reportID);
		report.ignored = !report.ignored;
		report.save();
		res.send({
			status: true,
			message: 'Report has switched its visibility setting'
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/create-devotion', async (req, res) => {
	try {
		console.log(req.body);
		const { title, message, releaseDate } = req.body;
		let date = new Date(new Date(Date.parse(releaseDate)).setHours(24, 59, 59, 999));
		let today = new Date(new Date().setHours(0, 0, 0, 0));
		console.log(date);
		console.log(today);
		if (date < today) {
			return res.send({
				status: false,
				message: 'Release date cannot be in the past!'
			});
		}
		let devotion = await Post.create({
			title: title,
			message: message,
			releaseDate: date,
			uID: req.user.id,
			username: req.user.meta.username,
			type: 'devotion',
			postDate: new Date()
		});
		console.log(devotion);
		if (devotion) {
			res.send({
				status: true,
				message: `Daily devotion has been scheduled for ${releaseDate}`
			});
		}
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/get-devotions', async (req, res) => {
	try {
		let devotions = await Post.find({ type: 'devotion' }).sort({ releaseDate: -1 });
		if (devotions) {
			res.send({
				status: true,
				devotions: devotions,
				message: `${devotions.length} Devotions loaded`
			});
		} else {
			res.send({
				status: false,
				message: 'No devotions found!'
			});
		}
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/create-bible-plan', async (req, res) => {
	try {
		const { title, description, icon, books } = req.body;
		let newBooks = new Function('return [' + books + '];')();
		let options = {
			title: title,
			description: description,
			icon: icon,
			books: newBooks[0]
		};
		let biblePlan = await BiblePlan.create(options);
		res.send({
			status: true,
			biblePlan: biblePlan
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/update-user', async (req, res) => {
	try {
		const { updateFirstName, updateLastName, updateEmail, updatePhoneNumber, updateState, updateCity, updateAddress, updateZip, updateAdmin } = req.body;
		let user = await User.findById(req.user.id);
		if (updateEmail) user.meta.email = updateEmail;
		if (updateFirstName) user.meta.firstName = updateFirstName;
		if (updateLastName) user.meta.lastName = updateLastName;
		if (updatePhoneNumber) user.meta.phoneNumber = updatePhoneNumber;
		if (updateAddress) user.meta.shipping.address = updateAddress;
		if (updateCity) user.meta.shipping.city = updateCity;
		if (updateState) user.meta.shipping.state = updateState;
		if (updateZip) user.meta.shipping.zip = updateZip;
		if (updateAdmin) user.admin = updateAdmin;
		let update = await user.save();
		if (update) {
			res.send({
				status: true,
				message: 'User found and updated!'
			});
		} else {
			res.send({
				status: false,
				message: 'User not found and update failed.'
			});
		}
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			err: err.message
		});
	}
});

router.post('/delete-user', async (req, res) => {
	try {
		const { uid } = req.body;
		let user = await User.findByIdAndDelete(uid);
		if (user) {
			res.send({
				status: true,
				message: 'User found and deleted'
			});
		} else {
			res.send({
				status: false,
				message: 'Termination failed. User not found!'
			});
		}
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

module.exports = router;
