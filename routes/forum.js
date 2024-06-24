const router = require('express').Router();
const Post = require('../model/Post');

router.get('/loadPosts', async function (req, res) {
	try {
		let posts = await Post.find();
		if (posts) {
			res.send({
				status: true,
				message: `${posts.length} Posts loaded`,
				posts: posts,
				currentUserID: req.user.id
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

router.post('/likePost', async function (req, res) {
	try {
		const { postID } = req.body;
		let post = await Post.findById(postID);
		let user = req.user;
		if (post && user) {
			try {
				if (post.likes.includes(user.id)) {
					post.likes.pull(user.id);
					await post.save();
					res.send({
						status: true,
						type: 'unlike',
						likes: post.likes.length
					});
				} else {
					post.likes.push(user.id);
					await post.save();
					res.send({
						status: true,
						type: 'like',
						likes: post.likes.length
					});
				}
			} catch (error) {
				console.log(error);
				res.send({
					status: false,
					error: error.message
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.send({
			status: false,
			message: 'No post found with that ID'
		});
	}
});

module.exports = router;
