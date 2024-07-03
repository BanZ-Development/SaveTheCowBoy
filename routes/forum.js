const router = require('express').Router();
const Post = require('../model/Post');
const User = require('../model/User');
const Report = require('../model/Report');
const Comment = require('../model/Comment');

router.post('/loadPosts', async function (req, res) {
	const { loadedPosts } = req.body;
	try {
		let posts;
		const count = await Post.countDocuments();
		const difference = count - loadedPosts;
		console.log('Count: ' + count);
		console.log('Difference: ' + difference);
		if (count < 10) {
			posts = await Post.find();
		} else if (difference < 10) {
			console.log(await Post.find());
			posts = await Post.find()
				.skip(10 - difference)
				.limit(difference);
		} else {
			posts = await Post.find()
				.skip(difference - 10)
				.limit(10);
		}
		if (posts) {
			res.send({
				status: true,
				message: `${posts.length} Posts loaded`,
				posts: posts,
				currentUserID: req.user.id
			});
		}
	} catch (error) {
		console.log(error);
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
				post: post,
				currentUserID: req.user.id
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
		let user = await User.findById(req.user.id);
		user.posts.push(post.id);
		await user.save();
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
		console.log(postID);
		let post = await Post.findById(postID);
		let user = req.user;
		if (post && user) {
			try {
				if (post.likes.includes(user.id)) {
					post.likes.pull(user.id);
					post.likesCount -= 1;
					await post.save();
					res.send({
						status: true,
						type: 'unlike',
						likes: post.likesCount
					});
				} else {
					post.likes.push(user.id);
					post.likesCount += 1;
					await post.save();
					res.send({
						status: true,
						type: 'like',
						likes: post.likesCount
					});
				}
			} catch (error) {
				console.log(error);
				res.send({
					status: false,
					error: error.message
				});
			}
		} else {
			res.send({
				status: false,
				message: 'No post found with that ID'
			});
		}
	} catch (error) {
		console.log(error);
		res.send({
			status: false,
			message: 'No post found with that ID'
		});
	}
});

router.post('/comment', async (req, res) => {
	try {
		const { content, postID } = req.body;
		let post = await Post.findById(postID);
		let user = req.user;

		if (post && user) {
			try {
				const newComment = new Comment({
					content: content,
					author: user.meta.username,
					authorID: user.id
				});
				post.comments.push(newComment);
				await post.save();
				res.send({
					status: true,
					message: 'Comment posted!',
					postID: postID,
					commentID: newComment.id
				});
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
			error: error.message
		});
	}
});

router.post('/report', async (req, res) => {
	try {
		const { reasons, message, postID } = req.body;
		const uid = req.user.id;

		await Report.create({
			reasons: reasons,
			message: message,
			postID: postID,
			reporterID: uid
		})
			.then((report) => {
				console.log(report._id);
				res.send({
					status: true,
					message: 'Report sent'
				});
			})
			.catch((error) => {
				console.log(error);
				res.send({
					status: false,
					error: error
				});
			});
	} catch (error) {
		console.log(error);
		res.send({
			status: false,
			error: error
		});
	}
});

module.exports = router;
