require('dotenv').config();
const router = require('express').Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const User = require('../model/User');
const Post = require('../model/Post');
const Report = require('../model/Report');
const BiblePlan = require('../model/BiblePlan');
const Devotion = require('../model/Devotion');
const Image = require('../model/Image');
const hasher = require('../controllers/hasher');
const validate = require('../controllers/validate');
const analytics = require('../controllers/analytics');
const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
require('../controllers/local');
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

const DateText = (date) => {
	const options = { month: 'long' };
	const month = new Intl.DateTimeFormat('en-US', options).format(date);
	const day = date.getDate();
	const year = date.getFullYear();
	return `${month} ${day}, ${year}`;
};

router.get('/isAdmin', async (req, res) => {
	try {
		console.log(req.user.admin);
		if (req.user.admin) {
			res.send({
				status: true
			});
		} else {
			res.send({
				status: false
			});
		}
	} catch (err) {
		res.send({ status: false });
	}
});

router.use((req, res, next) => {
	if (req.user) next();
	else res.sendStatus(401);
});

router.use((req, res, next) => {
	if (req.user.admin) next();
	else res.sendStatus(401);
});

router.post('/get-members', async (req, res) => {
	try {
		let { filter } = req.body;
		let users;
		filter = JSON.parse(filter);
		if (Object.entries(filter).length === 0) users = await User.find();
		else users = await User.find(filter);
		let members = [];
		users.forEach((user) => {
			members.push({
				uid: user.id,
				username: user.meta.username,
				firstName: user.meta.firstName,
				lastName: user.meta.lastName,
				email: user.meta.email,
				phoneNumber: user.meta.phoneNumber,
				address: user.meta.shipping.address,
				city: user.meta.shipping.city,
				state: user.meta.shipping.state,
				zip: user.meta.shipping.zip,
				pfp: user.meta.pfp,
				admin: user.admin,
				customer: user.subscription.customer
			});
		});
		res.send({
			status: true,
			members: members
		});
	} catch (err) {
		console.log(err);
		res.send({ status: false, error: err.message });
	}
});

router.post('/get-analytics', async (req, res) => {
	try {
		analytics.setupAnalyticsInstance();
		let users = await User.find();
		let posts = await Post.find();
		let analytic = await analytics.getAnalytics();

		const db = mongoose.connection.db;
		const stats = await db.command({ dbStats: 1 });

		console.log('Storage Size (allocated by MongoDB):', stats.storageSize, 'bytes');
		console.log('Index Size:', stats.indexSize, 'bytes');
		res.send({
			status: true,
			totalUsers: users.length,
			totalPosts: posts.length,
			dailyActiveUsers: analytic.dailyActiveUsers,
			usersCalendar: analytic.usersCalendar,
			postsCalendar: analytic.postsCalendar,
			usedStorage: stats.indexSize,
			totalStorage: stats.storageSize
		});
	} catch (err) {
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/get-reports', async (req, res) => {
	try {
		let { id } = req.body;
		let filter = {};
		if (id == 'currentReportsBtn') filter.ignored = false;
		else if (id == 'ignoredReportsBtn') filter.ignored = true;
		else filter.ignored = false;
		let reports = await Report.find(filter);
		let type = filter.ignored ? 'Ignored' : 'Current';
		res.send({ status: true, reports: reports, type: type });
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

function deleteImages(post) {
	post.images.forEach((image) => {
		deleteImage(image.fileID);
	});
}

function deleteImage(fileID) {
	mongoose.connection.db.collection('uploads.chunks').deleteMany({ files_id: mongoose.Types.ObjectId(fileId) }, (err, result) => {
		if (err) {
			console.error('Error deleting chunks:', err);
			return;
		}

		console.log(`Deleted ${result.deletedCount} chunk(s) for file ID ${fileId}`);
	});
}

router.post('/delete-report', async (req, res) => {
	try {
		let { reportID } = req.body;
		let report = await Report.findByIdAndDelete(reportID);
		let { postID } = report;
		let post = await Post.findByIdAndDelete(postID);
		deleteImages(post);
		if (report) {
			if (post) {
				res.send({
					status: true,
					message: 'Report and post deleted'
				});
			} else {
				let comment = await Comment.findByIdAndDelete(postID);
				if (comment) {
					res.send({
						status: true,
						message: 'Report and comment deleted'
					});
				} else {
					res.send({
						status: false,
						message: 'No post or comment found with that ID'
					});
				}
			}
		} else {
			res.send({
				status: false,
				message: 'No report found with that ID'
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

router.post('/ignore-report', async (req, res) => {
	try {
		let { reportID } = req.body;
		let report = await Report.findById(reportID);
		report.ignored = !report.ignored;
		report.save();
		res.send({
			status: true,
			message: 'Report has switched its visibility setting'
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/remove-report', async (req, res) => {
	try {
		let { reportID } = req.body;
		let report = await Report.findByIdAndDelete(reportID);
		if (report) {
			res.send({
				status: true,
				message: 'Report has been removed'
			});
		} else {
			res.send({
				status: false,
				message: 'No report found!'
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

router.post('/create-devotion', async (req, res) => {
	try {
		console.log(req.body);
		const { title, message, releaseDate } = req.body;
		let date = new Date(new Date(Date.parse(releaseDate)).setHours(24, 59, 59, 999));
		let today = new Date(new Date().setHours(0, 0, 0, 0));
		console.log(date);
		console.log(today);
		if (date < today) {
			return res.send({
				status: false,
				message: 'Release date cannot be in the past!'
			});
		}
		let devotion = await Post.create({
			title: title,
			message: message,
			releaseDate: date,
			uID: req.user.id,
			username: req.user.meta.username,
			type: 'devotion',
			postDate: new Date()
		});
		console.log(devotion);
		if (devotion) {
			res.send({
				status: true,
				message: `Daily devotion has been scheduled for ${releaseDate}`
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

router.post('/get-devotions', async (req, res) => {
	try {
		let devotions = await Post.find({ type: 'devotion' }).sort({ releaseDate: -1 });
		if (devotions) {
			res.send({
				status: true,
				devotions: devotions,
				message: `${devotions.length} Devotions loaded`
			});
		} else {
			res.send({
				status: false,
				message: 'No devotions found!'
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

router.post('/create-bible-plan', upload.single('file'), async (req, res) => {
	try {
		const { title, description, books } = req.body;
		const file = req.file;
		console.log(file);
		if (!file) {
			return res.send({
				status: false,
				message: 'No icon uploaded'
			});
		}
		const { originalname, filename, size, uploadDate, contentType, id } = file;
		if (!contentType.includes('image')) throw Error('Image not provided.');
		const image = new Image({
			name: filename,
			contentType: contentType,
			uploadDate: uploadDate,
			fileID: id
		});
		let newBooks = new Function('return [' + books + '];')();
		let options = {
			title: title,
			description: description,
			icon: image,
			books: newBooks[0]
		};
		let biblePlan = await BiblePlan.create(options);
		res.send({
			status: true,
			biblePlan: biblePlan
		});
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			error: err.message
		});
	}
});

router.post('/update-user', async (req, res) => {
	try {
		const uid = req.body.uid;
		const { updateFirstName, updateLastName, updateEmail, updatePhoneNumber, updateState, updateCity, updateAddress, updateZip, updateAdmin } = req.body;
		let user = await User.findById(uid);
		if (updateEmail) user.meta.email = updateEmail;
		if (updateFirstName) user.meta.firstName = updateFirstName;
		if (updateLastName) user.meta.lastName = updateLastName;
		if (updatePhoneNumber) user.meta.phoneNumber = updatePhoneNumber;
		if (updateAddress) user.meta.shipping.address = updateAddress;
		if (updateCity) user.meta.shipping.city = updateCity;
		if (updateState) user.meta.shipping.state = updateState;
		if (updateZip) user.meta.shipping.zip = updateZip;
		if (updateAdmin) user.admin = updateAdmin;
		let update = await user.save();
		if (update) {
			res.send({
				status: true,
				message: 'User found and updated!'
			});
		} else {
			res.send({
				status: false,
				message: 'User not found and update failed.'
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

router.post('/delete-user', async (req, res) => {
	try {
		const { uid } = req.body;
		let user = await User.findByIdAndDelete(uid);
		cancelCustomersSubscriptions(user.subscription.customer)
			.then((res)=>console.log('Subscriptions canceled:',res))
			.catch((err)=>console.error('Error:',err));
		if (user) {
			res.send({
				status: true,
				message: 'User found and deleted'
			});
		} else {
			res.send({
				status: false,
				message: 'Termination failed. User not found!'
			});
		}
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

async function cancelCustomersSubscriptions(customerID) {
	try {
		const subscriptions = await stripe.subscriptions.list({
			customer: customerID,
			status: 'all', 
		  });
		  console.log(subscriptions.data.length);
		  for(let i=0;i<subscriptions.data.length;i++) {
			  let subscription = subscriptions.data[i];
			  if(subscription.cancel_at_period_end) continue;
			  let subscriptionID = subscription.id;
			  const updatedSubscription = await stripe.subscriptions.update(subscriptionID, {
				  cancel_at_period_end: true,
			  });
			  console.log(`Subscription ${subscriptionID} will not renew: ${updatedSubscription}`);
		  }
		  return true;
	} catch(err) {
		console.error(err);
		return false;
	}
}

router.post('/cancel-subscription', async (req, res) => {
	try {
		const { uid } = req.body;
		
		let user = await User.findById(uid);
		if(!user) {
			return res.send({
				status: false,
				message: 'No user found under user ID'
			})
		}
		
		cancelCustomersSubscriptions(req.user.subscription.customer)
			.then((res)=>console.log('Subscriptions canceled:',res))
			.catch((err)=>console.error('Error:',err));
		

		/*
		ONLY TO CANCEL SUBS ON MULTIPLE CUSTOMERS W/ SAME NAME

		const customers = await stripe.customers.list({ limit: 1000 });
		const matchingCustomers = customers.data.filter((customer) => {
		return customer.name && customer.name.toLowerCase() === `${req.user.meta.firstName.toLowerCase()} ${req.user.meta.lastName.toLowerCase()}`;
		});

		if (matchingCustomers.length === 0) {
		console.log(`No customers found with the name: ${firstName} ${lastName}`);
		}

		console.log(matchingCustomers);
		for(const customer of matchingCustomers) {
			let customerID = customer.id;
			const subscriptions = await stripe.subscriptions.list({
				customer: customerID,
				status: 'all', // Fetch all statuses, we'll filter manually
			});
			console.log(subscriptions.data.length);
			for(let i=0;i<subscriptions.data.length;i++) {
				let subscription = subscriptions.data[i];
				if(subscription.cancel_at_period_end) continue;
				let subscriptionID = subscription.id;
				const updatedSubscription = await stripe.subscriptions.update(subscriptionID, {
					cancel_at_period_end: true,
				});
    			console.log(`Subscription ${subscriptionID} will not renew: ${updatedSubscription}`);
			}
		}*/
		
		res.send({
			status: true,
			message: 'Canceled all.'
		})
	} catch(err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

router.post('/delete-devotion', async (req, res) => {
	try {
		const { devotionID } = req.body;
		let devotion = await Post.findByIdAndDelete(devotionID);
		if (devotion && devotion.type == 'devotion') {
			res.send({
				status: true,
				message: 'Devotion found and deleted'
			});
		} else {
			res.send({
				status: false,
				message: 'Termination failed. Devotion not found!'
			});
		}
	} catch (err) {
		console.log(err);
		res.send({
			status: false,
			message: err.message
		});
	}
});

module.exports = router;
