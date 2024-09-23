require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BiblePlan = require('../model/BiblePlan');

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

router.post('/get-bible-plan', async (req, res) => {
	try {
		let { id } = req.body;
		let biblePlan = await BiblePlan.findById(id);
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
