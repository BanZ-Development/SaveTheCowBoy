const router = require('express').Router();
const User = require('../model/User');
const Post = require('../model/Post');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const passport = require('passport');
require('../controllers/local');

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
