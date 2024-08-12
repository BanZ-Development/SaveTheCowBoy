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
		if (!post) {
			let comment = await Comment.findById(req.body.id);
			let author = await User.findById(comment.authorID);
			if (comment) {
				return res.send({
					status: true,
					message: '1 comment loaded',
					post: comment,
					currentUserID: req.user.id,
					pfp: author.meta.pfp
				});
			}
		}
		let author = await User.findById(post.uID);
		if (post) {
			return res.send({
				status: true,
				message: '1 post loaded',
				post: post,
				currentUserID: req.user.id,
				pfp: author.meta.pfp
			});
		}
	} catch (error) {
		res.send({
			status: false,
			message: 'No post found with that ID'
		});
	}
});

router.post('/loadComment', async function (req, res) {
	try {
		console.log('Comment ID:', req.body.commentID);
		let comment = await Comment.findById(req.body.commentID);
		let author = await User.findById(comment.authorID);
		if (comment) {
			res.send({
				status: true,
				message: 'Comment loaded',
				currentUserID: req.user.id,
				pfp: author.meta.pfp,
				comment: comment
			});
		}
	} catch (error) {
		res.send({
			status: false,
			message: 'No comment found with that ID'
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

router.post('/reply', async (req, res) => {
	try {
		const { commentID, content, postID } = req.body;
		let comment = await Comment.findById(commentID);
		let user = req.user;
		if (comment && user) {
			try {
				const newComment = new Comment({
					content: content,
					author: user.meta.username,
					authorID: user.id,
					postID: postID
				});
				let post = await Post.findById(postID);
				post.commentsCount += 1;
				await Comment.create(newComment);
				comment.comments.push(newComment.id);
				comment.commentsCount += 1;
				await post.save();
				await comment.save();
				res.send({
					status: true,
					message: 'Reply created'
				});
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
				message: 'No comment found with that ID'
			});
		}
	} catch (error) {
		console.log(error);
		res.send({
			status: false,
			message: 'No comment found with that ID'
		});
	}
});

router.post('/get-replies', async (req, res) => {
	try {
		const { commentID } = req.body;
		let comment = await Comment.findById(commentID);
		let replyIDs = comment.comments;
		let replies = [];
		for (let i = 0; i < replyIDs.length; i++) {
			let reply = await Comment.findById(replyIDs[i]);
			let user = await User.findById(reply.authorID);
			if (reply && user) {
				let contents = {
					reply: reply,
					pfp: user.meta.pfp
				};
				replies.push(contents);
			}
		}
		if (replies.length > 0) {
			res.send({
				status: true,
				replies: replies,
				uid: req.user.id
			});
		} else {
			res.send({
				status: false,
				message: 'No replies found under that comment ID'
			});
		}
	} catch (error) {
		console.log(error);
		res.send({
			status: false,
			message: 'No comment found with that ID'
		});
	}
});

router.post('/likeComment', async function (req, res) {
	try {
		const { commentID } = req.body;
		let comment = await Comment.findById(commentID);
		let user = req.user;
		if (comment && user) {
			try {
				if (comment.likes.includes(user.id)) {
					comment.likes.pull(user.id);
					comment.likesCount -= 1;
					await comment.save();
					res.send({
						status: true,
						type: 'unlike',
						likes: comment.likesCount
					});
				} else {
					comment.likes.push(user.id);
					comment.likesCount += 1;
					await comment.save();
					res.send({
						status: true,
						type: 'like',
						likes: comment.likesCount
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
				message: 'No comment found with that ID'
			});
		}
	} catch (error) {
		console.log(error);
		res.send({
			status: false,
			message: 'No comment found with that ID'
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
					authorID: user.id,
					postID: postID
				});
				await Comment.create(newComment);
				post.comments.push(newComment.id);
				post.commentsCount += 1;
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
			reporterID: uid,
			ignored: false
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

router.post('/delete-post', async (req, res) => {
	try {
		const { postID } = req.body;
		let post = await Post.findById(postID);
		if (req.user.id == post.uID) {
			await Post.findByIdAndDelete(postID);
			res.send({
				status: true,
				message: 'Post deleted'
			});
		} else {
			res.send({
				status: true,
				message: 'You do not own this post'
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

router.post('/delete-comment', async (req, res) => {
	try {
		const { commentID } = req.body;
		let comment = await Comment.findById(commentID);
		//find a way to recursively delete
		res.send({
			status: true,
			message: 'Comment deleted'
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

module.exports = router;
