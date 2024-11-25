const router = require('express').Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const { GridFsStorage } = require('multer-gridfs-storage');
const User = require('../model/User');
const Post = require('../model/Post');
const Comment = require('../model/Comment');
const Image = require('../model/Image');
const crypto = require('crypto');
const path = require('path');
const cookie = require('../controllers/cookie');
require('dotenv').config();
router.use(bodyParser.json());

const storage = new GridFsStorage({
	url: process.env.MONGODB_URI,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (err, buf) => {
				if (err) {
					console.log(error);
					return reject(err);
				}
				const filename = buf.toString('hex') + path.extname(file.originalname);
				const fileInfo = {
					filename: filename,
					bucketName: 'uploads'
				};
				resolve(fileInfo);
			});
		}).catch((error) => {
			console.log(error);
		});
	}
});
const upload = multer({ storage });

router.post('/load', async (req, res) => {
	try {
		let { uid } = req.body;
		if (!uid) uid = req.user.id;
		const user = await User.findById(uid);
		let pfp = null;
		if (user.meta.pfp) pfp = user.meta.pfp.name;
		let filteredPosts = user.posts.filter((post) => post.type != 'comment');
		const profile = {
			username: user.meta.username,
			bio: user.meta.bio,
			uid: user.id,
			posts: filteredPosts,
			isSubscribed: user.subscription.isSubscribed,
			pfp: pfp,
			city: user.meta.shipping.city,
			state: user.meta.shipping.state
		};
		res.send({
			status: true,
			profile: profile
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: 'User is not logged in',
			error: err.message
		});
	}
});

router.post('/upload-pfp', upload.single('file'), async (req, res) => {
	try {
		const uid = req.user.id;
		const file = req.file;
		const { originalname, filename, size, uploadDate, contentType, id } = file;
		if (!contentType.includes('image')) throw Error('Image not provided.');
		const image = new Image({
			name: filename,
			contentType: contentType,
			uploadDate: uploadDate,
			fileID: id
		});
		const user = await User.findById(uid);
		user.meta.pfp = image;
		await user.save();
		cookie.set(res, 'pfp', filename);
		res.send({
			status: true,
			message: 'Profile picture updated!',
			filename: filename
		});
	} catch (error) {
		console.log(error);
		res.send({
			status: false,
			error: error.message
		});
	}
});

router.get('/getPfp', async (req, res) => {
	try {
		if (!req.user) return res.send({ status: false, message: 'No user' });
		const user = await User.findById(req.user.id);
		if (!user.meta.pfp) return res.send({ status: false, message: 'No pfp' });
		else {
			cookie.set(res, 'pfp', user.meta.pfp.name);
			res.send({
				status: true,
				pfp: user.meta.pfp.name
			});
		}
	} catch (err) {
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/getPfp', async (req, res) => {
	try {
		const { userID } = req.body;
		if (!userID) return res.send({ status: false });
		const user = await User.findById(userID);
		if (!user.meta.pfp) return res.send({ status: false });
		else {
			cookie.set(res, 'pfp', user.meta.pfp.name);
			res.send({
				status: true,
				pfp: user.meta.pfp.name
			});
		}
	} catch (err) {
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/update-bio', async (req, res) => {
	try {
		const { bio } = req.body;
		if (bio.length < 500) {
			let user = await User.findById(req.user.id);
			user.meta.bio = bio;
			user = await user.save();
			if (user) {
				res.send({
					status: true,
					message: 'Your bio has been updated!',
					bio: bio
				});
			} else throw Error('User not found!');
		} else {
			res.send({
				status: false,
				message: 'Cannot set bio because yours is over 500 characters!'
			});
		}
	} catch (err) {
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/update-username', async (req, res) => {
	try {
		const { username } = req.body;
		const query = User.where({
			'meta.username': username
		});
		let user = await query.findOne();
		if (user) {
			res.send({
				status: false,
				message: 'Please choose a unique username!'
			});
		} else {
			user = await User.findById(req.user.id);
			console.log(user);
			user.meta.username = username;
			await user.save();
			res.send({
				status: true,
				message: 'Username has been updated!',
				username: username
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

router.post('/return-comments', async (req, res) => {
	try {
		let { uid } = req.body;
		const user = await User.findById(uid);
		Promise.all(user.comments.map((commentID) => Comment.findById(commentID)))
			.then((commentList) => {
				// Filter out null or undefined comments in case `findById` didn't find any.
				let comments = commentList.filter((comment) => comment);

				res.send({
					status: true,
					comments: comments,
					currentUserID: req.user.id
				});
			})
			.catch((error) => {
				console.error('Error fetching comments:', error);
				res.status(500).send({
					status: false,
					message: 'Failed to fetch comments'
				});
			});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

router.post('/return-posts', async (req, res) => {
	try {
		let { uid } = req.body;
		const user = await User.findById(uid);
		Promise.all(user.posts.map((postID) => Post.findById(postID)))
			.then((postList) => {
				// Filter out null or undefined comments in case `findById` didn't find any.
				let posts = postList.filter((post) => post);

				res.send({
					status: true,
					posts: posts,
					currentUserID: req.user.id
				});
			})
			.catch((error) => {
				console.error('Error fetching posts:', error);
				res.status(500).send({
					status: false,
					message: 'Failed to fetch posts'
				});
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
