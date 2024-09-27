require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BiblePlan = require('../model/BiblePlan');
const User = require('../model/User');

router.get('/get-bible-plans', async (req, res) => {
	try {
		let biblePlans = await BiblePlan.find();
		res.send({
			status: true,
			message: `${biblePlans.length} Bible Plans loaded!`,
			biblePlans: biblePlans
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
				chaptersFinished: {},
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
		let { id, bookID, chapterID } = req.body;
		let user = await User.findById(req.user.id);
		user.biblePlans.forEach((plan) => {
			if (plan.id == id) {
			}
		});
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

module.exports = router;
