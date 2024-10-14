const router = require('express').Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const { GridFsStorage } = require('multer-gridfs-storage');
const User = require('../model/User');
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
		const profile = {
			username: user.meta.username,
			uid: user.id,
			posts: user.posts,
			isSubscribed: user.subscription.isSubscribed,
			pfp: pfp
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

module.exports = router;
