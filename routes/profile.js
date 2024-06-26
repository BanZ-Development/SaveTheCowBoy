const router = require('express').Router();
const User = require('../model/User');
const multer = require('multer');
const Image = require('../model/Image');
const { getImage } = require('../controllers/image');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '../uploads/'); // Specify the directory for storing uploads
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});
const upload = multer({ storage: storage });

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

router.post('/upload-pfp', upload.single('image'), async (req, res) => {
	try {
		const uid = req.user.id;
		const { fileInput, fileName, contentType } = req.body;
		if (!contentType.includes('image')) return;
		const image = new Image({
			name: fileName,
			image: {
				data: fileInput,
				contentType: contentType
			}
		});
		const user = await User.findById(uid);
		console.log(user.meta.username);
		user.meta.pfp = image;
		await user.save();
		console.log('uploaded');
		res.send({
			status: true,
			message: 'Profile picture updated!'
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
	const image = user.meta.pfp.image;
	const imageSrc = getImage(image);
	console.log(imageSrc);
	res.json({ imageSrc });
});

module.exports = router;
