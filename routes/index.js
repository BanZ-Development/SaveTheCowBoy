require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../model/Post');

router.get('/getPosts', async (req, res) => {
	const posts = await Post.find({});
	console.log(posts);
	res.send({
		result: true,
		message: 'Posts have been sent',
		posts: posts
	});
});

module.exports = router;
