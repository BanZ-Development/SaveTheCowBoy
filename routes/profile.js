const router = require('express').Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const { GridFsStorage } = require('multer-gridfs-storage');
const User = require('../model/User');
const Image = require('../model/Image');
const crypto = require('crypto');
const path = require('path');
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
				console.log('hello');
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
	const { uid } = req.body;
	const user = await User.findById(uid);
	const profile = {
		username: user.meta.username,
		uid: user.id,
		posts: null,
		isSubscribed: user.subscription.isSubscribed
	};
	res.send({
		status: true,
		profile: profile
	});
});

router.post('/upload-pfp', upload.single('file'), async (req, res) => {
	try {
		const uid = req.user.id;
		const file = req.file;
		const { originalname, filename, size, uploadDate, contentType, id } = file;
		if (!contentType.includes('image')) return;
		const image = new Image({
			name: filename,
			contentType: contentType,
			uploadDate: uploadDate,
			fileID: id
		});
		const user = await User.findById(uid);
		console.log(user.meta.username);
		user.meta.pfp = image;
		await user.save();
		console.log('uploaded');
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
	if (!req.user) return res.send({ status: false });
	const user = await User.findById(req.user.id);
	const pfp = user.meta.pfp.name;
	if (!pfp) return res.send({ status: false });
	res.send({
		status: true,
		pfp: pfp
	});
});

module.exports = router;
