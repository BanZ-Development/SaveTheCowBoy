require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BiblePlan = require('../model/BiblePlan');
const User = require('../model/User');

router.get('/get-bible-plans', async (req, res) => {
	try {
		let biblePlans = await BiblePlan.find();
		let user = await User.findById(req.user.id);
		let userPlans = user.biblePlans;
		res.send({
			status: true,
			message: `${biblePlans.length} Bible Plans loaded!`,
			biblePlans: biblePlans,
			userPlans: userPlans
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

async function trackBiblePlan(biblePlanID, userID) {
	try {
		let hasBiblePlan = false;
		let user = await User.findById(userID);
		user.biblePlans.forEach((plan) => {
			if (plan.id == biblePlanID) hasBiblePlan = true;
		});
		if (!hasBiblePlan) {
			let plan = {
				id: biblePlanID,
				chaptersFinished: [],
				notes: {}
			};
			user.biblePlans.push(plan);
			await user.save();
		}
	} catch (err) {}
}

router.post('/get-bible-plan', async (req, res) => {
	try {
		let { id } = req.body;
		let biblePlan = await BiblePlan.findById(id);
		await trackBiblePlan(id, req.user.id);
		res.send({
			status: true,
			message: `Bible Plan ${id} loaded!`,
			biblePlan: biblePlan
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

router.post('/check-plan-completion', async (req, res) => {
	try {
		let { id } = req.body;
		console.log('ID:', id);
		let user = await User.findById(req.user.id);
		let biblePlan = null;
		user.biblePlans.forEach((plan) => {
			if (plan.id == id) biblePlan = plan;
		});
		if (biblePlan) {
			res.send({
				status: true,
				message: `Bible Plan ${id} completion saved.`,
				biblePlan: biblePlan
			});
		} else {
			res.send({
				status: false,
				message: `No bible plan found with ID: ${id} under this account!`
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

router.post('/update-plan-completion', async (req, res) => {
	try {
		let { id, chaptersFinished } = req.body;
		console.log(id, chaptersFinished);
		let user = await User.findById(req.user.id);
		for (let i = 0; i < user.biblePlans.length; i++) {
			let plan = user.biblePlans[i];
			if (plan.id == id) {
				console.log('Before:', user.biblePlans);
				user.biblePlans[i].chaptersFinished = chaptersFinished.split(',');
				console.log('After:', user.biblePlans);
				await User.findByIdAndUpdate(req.user.id, {
					biblePlans: user.biblePlans
				});
				return res.send({
					status: true,
					message: 'Chapters finished has been updated'
				});
			}
		}
		res.send({
			status: false,
			message: `No bible plan found with ID: ${id} under this account!`
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

router.post('/create-comment', async (req, res) => {
	try {
		let { id, bookID, chapterID, location, comment } = req.body;
		if (comment.length == 0 || comment.length > 500) {
			return res.send({
				status: false,
				message: 'Comment either does not exist or comment is too long (500+ chars).'
			});
		}
		let biblePlan = await BiblePlan.findById(id);
		let book = biblePlan.books.find((item) => item.book == bookID);
		let chapter = book.chapters.find((item) => item.number == chapterID);
		let update = {
			location: location,
			comment: comment,
			uID: req.user.id,
			postDate: new Date()
		};
		chapter.comments.push(update);
		biblePlan.markModified('books');
		await biblePlan.save();
		res.send({
			status: true,
			chapter: chapter,
			update: update
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

router.post('/get-comments', async (req, res) => {
	try {
		let { id, bookID, chapterID } = req.body;
		let biblePlan = await BiblePlan.findById(id);
		let book = biblePlan.books.find((item) => item.book == bookID);
		let chapter = book.chapters.find((item) => item.number == chapterID);
		let comments = chapter.comments;
		res.send({
			status: true,
			comments: comments,
			message: `${comments.length} comments loaded!`
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

module.exports = router;
