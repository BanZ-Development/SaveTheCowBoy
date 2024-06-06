const router = require('express').Router();
const multer = require('multer');
const User = require('../model/User');
const Post = require('../model/Post');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const passport = require('passport');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
require('dotenv').config();
require('../controllers/local');

let gfs;

mongoose.connection.once(() => {
	gfs = Grid(mongoose.connection.db, mongoose.mongo);
	gfs.collection('uploads');
});

const storage = new GridFSStorage({
	url: process.env.MONGODB_URI,
	file: (req, file) => {
		return new Promise((res, rej) => {
			crypto.randomBytes(16, (err, buf) => {
				if (err) return rej(err);
				const fileName = buf.toString('hex') + path.extname(file.originalname);
				const fileInfo = {
					fileName: fileName,
					bucketName: 'uploads'
				};
				res(fileInfo);
			});
		});
	}
});
const upload = multer({ storage });

router.use((req, res, next) => {
	if (req.user) next();
	else res.sendStatus(401);
});

router.use((req, res, next) => {
	if (req.user.admin) next();
	else res.sendStatus(401);
});

router.post('/post', async (req, res) => {
	validate.Authenticate(validate.post(req, res), Passed, Failed);

	async function Passed() {
		const { username } = req.user.meta.username;
		const { title, message, expireDate } = req.body;
		const postDate = new Date();

		let params = {
			title: title,
			message: message,
			postDate: postDate
		};
		if (expireDate) params['expireDate'] = expireDate;

		const result = await Post.create(params);
		res.send({
			status: true,
			message: 'Post has been created!',
			params: params
		});
	}

	function Failed(result) {
		res.send({
			status: true,
			message: 'Input validation failed',
			errors: result
		});
	}
});

module.exports = router;
