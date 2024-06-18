const router = require('express').Router();
const Post = require('../model/Post');

router.get('/loadPosts', async function (req, res) {
	try {
		let posts = await Post.find();
		if (posts) {
			res.send({
				status: true,
				message: `${posts.length} Posts loaded`,
				posts: posts
			});
		}
	} catch (error) {
		res.send({
			status: false,
			message: 'No posts found'
		});
	}
});

router.post('/loadPost', async function (req, res) {
	try {
		let post = await Post.findById(req.body.id);
		if (post) {
			res.send({
				status: true,
				message: '1 post loaded',
				post: post
			});
		}
	} catch (error) {
		res.send({
			status: false,
			message: 'No post found with that ID'
		});
	}
});

router.post('/post', async function (req, res) {
	try {
		const { title, message } = req.body;
		let date = new Date();
		let params = {
			title: title,
			message: message,
			uID: req.user._id,
			username: req.user.meta.username,
			postDate: date
		};
		const post = await Post.create(params);
		if (post) {
			res.send({
				status: true,
				message: 'Post created',
				id: post.id,
				uID: req.user._id,
				username: req.user.meta.username
			});
		} else {
			res.send({
				status: false,
				message: 'Error while creating post'
			});
		}
	} catch (error) {
		res.send({
			status: false,
			message: 'Please make sure all the fields are filled in'
		});
	}
});

module.exports = router;
