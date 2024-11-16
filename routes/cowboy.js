const router = require('express').Router();
const User = require('../model/User');
const Post = require('../model/Post');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');

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

router.post('/create-story', upload.array('files'), async (req, res) => {
	try {
		let body = { ...req.body };
		console.log(body);
		const { title, message, description } = body;
		let params = {
			title: title,
			message: message,
			description: description,
			uID: req.user.id,
			username: req.user.meta.username,
			type: 'story',
			postDate: new Date(),
			images: []
		};

		const files = req.files;
		let tooLarge = false;
		if (files && files.length > 0) {
			let customerID = req.user.subscription.customer;
			let maxSize;
			await returnSubscription(customerID).then((subscription) => {
				try {
					let planID = subscription.plan.id;
					maxSize = planToSize[planID];
					console.log('Max Size:', maxSize);
				} catch (err) {
					maxSize = null;
				}
			});
			files.forEach((file) => {
				const { originalname, filename, size, uploadDate, contentType, id } = file;
				if (!contentType.includes('image')) return;
				if (!req.user.admin && bytesToMB(size) > maxSize) {
					tooLarge = true;
					return res.send({
						status: false,
						message: 'Upload failed because file size too large!',
						maxSize: maxSize,
						filename: filename,
						uploadedSize: bytesToMB(size)
					});
				} else {
					const image = new Image({
						name: filename,
						contentType: contentType,
						uploadDate: uploadDate,
						fileID: id
					});
					params['images'].push(image);
				}
			});
		}
		if (!tooLarge) {
			const cowboyStory = await Post.create(params);
			let user = await User.findById(req.user.id);
			user.posts.push(cowboyStory.id);
			await user.save();
			if (cowboyStory) {
				res.send({
					status: true,
					message: 'Cowboy story created',
					id: cowboyStory.id,
					uID: req.user._id,
					username: req.user.meta.username
				});
			} else {
				res.send({
					status: false,
					message: 'Error while creating cowboy story!'
				});
			}
		}
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.get('/get-stories', async (req, res) => {
	try {
		let stories = await Post.find({ type: 'story' }).sort({ postDate: -1 });
		if (stories.length > 0) {
			res.send({
				status: true,
				cowboyStories: stories,
				message: `${stories.length} Stories loaded`
			});
		} else {
			res.send({
				status: false,
				message: 'No stories found!'
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

module.exports = router;
