const router = require('express').Router();
const User = require('../model/User');
const Post = require('../model/Post');

router.post('/create-story', async (req, res) => {
	try {
		console.log(req.body);
		const { title, message } = req.body;
		let cowboyStory = await Post.create({
			title: title,
			message: message,
			uID: req.user.id,
			username: req.user.meta.username,
			type: 'story',
			postDate: new Date()
		});
		console.log(cowboyStory);
		if (cowboyStory) {
			res.send({
				status: true,
				message: `Cowboy story has been created.`,
				cowboyStory: cowboyStory
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
