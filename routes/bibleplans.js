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
				annotations: []
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

function returnCompletionArray(chaptersFinished) {
	let chapters = chaptersFinished.map((str) => str.split(':')[0]);
	const occurrences = chapters.reduce((acc, term) => {
		acc[term] = (acc[term] || 0) + 1;
		return acc;
	}, {});

	return occurrences;
}

router.post('/check-plan-completion', async (req, res) => {
	try {
		let { id, bookID, chapterID } = req.body;
		console.log('ID:', id);
		let user = await User.findById(req.user.id);
		let biblePlan = user.biblePlans.find((item) => item.id == id);
		console.log(biblePlan);
		if (biblePlan) {
			let chaptersFinished = biblePlan.chaptersFinished;
			let found = chaptersFinished.find((finished) => finished == `${bookID}:${chapterID}`);
			if (!found) {
				chaptersFinished.push(`${bookID}:${chapterID}`);
				console.log(chaptersFinished);
				user.markModified('biblePlans');
				await user.save();
				res.send({
					status: true,
					completion: returnCompletionArray(chaptersFinished),
					message: 'Completion has been updated!'
				});
			} else {
				res.send({
					status: true,
					completion: returnCompletionArray(chaptersFinished),
					message: 'Completion has not been updated.'
				});
			}
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

async function updateCompletion(res, biblePlan, bookID, chapterID) {
	console.log(bookID, chapterID);
}

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

router.post('/create-annotation', async (req, res) => {
	try {
		let { id, bookID, chapterID, location, annotation } = req.body;
		if (annotation.length == 0 || annotation.length > 500) {
			return res.send({
				status: false,
				message: 'Annotation either does not exist or annotation is too long (500+ chars).'
			});
		}
		let user = await User.findById(req.user.id);
		let plan = user.biblePlans.find((item) => item.id == id);
		let update = {
			location: location,
			bookID: bookID,
			chapterID: chapterID,
			annotation: annotation,
			uID: req.user.id,
			postDate: new Date()
		};
		plan.annotations.push(update);
		user.markModified('biblePlans');
		await user.save();
		res.send({
			status: true,
			message: 'Annotation has been created',
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

router.post('/delete-annotation', async (req, res) => {
	try {
		let { planID, annotationID } = req.body;
		let uid = req.user.id;
		let user = await User.findById(uid);
		let biblePlan = user.biblePlans.filter((plan) => plan.id === planID);
		biblePlan = biblePlan.length > 0 ? biblePlan[0] : null;
		res.send({
			status: true
		});
	} catch (err) {
		console.log(err.message);
		res.send({
			status: false,
			message: err.message
		});
	}
});

router.post('/get-annotations', async (req, res) => {
	try {
		let { id } = req.body;
		let user = await User.findById(req.user.id);
		let plan = user.biblePlans.find((item) => item.id == id);
		let annotations = plan.annotations;
		if (annotations.length > 0) {
			res.send({
				status: true,
				annotations: annotations,
				message: `${annotations.length} comments loaded!`
			});
		} else {
			res.send({
				status: true,
				annotations: null,
				message: `No comments loaded!`
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

router.post('/get-completed-chapters', async (req, res) => {
	try {
		let { id } = req.body;
		let user = await User.findById(req.user.id);
		let plan = user.biblePlans.find((item) => item.id == id);
		let chaptersFinished = plan.chaptersFinished;
		res.send({
			status: true,
			chaptersFinished: chaptersFinished,
			message: `${chaptersFinished.length} chapters received!`
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
