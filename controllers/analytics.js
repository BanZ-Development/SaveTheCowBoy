const Analytic = require('../model/Analytic');
const Post = require('../model/Post');
const User = require('../model/User');

exports.setupAnalyticsInstance = async () => {
	let analytics = Analytic.find();
	await analytics.countDocuments().then((num) => {
		if (num === 0) createInstance();
	});
};

exports.getAnalytics = async () => {
	let analytics = await Analytic.find();
	let doc = analytics[0];
	return doc;
};

const createInstance = async () => {
	let options = {
		dailyActiveUsers: {},
		usersCalendar: {}
	};
	let analytics = await Analytic.create(options);
};

exports.addDailyActiveUser = async (date) => {
	let year = date.getFullYear();
	let month = date.getMonth();
	let day = date.getDate();
	checkForDateAndCreate(year, month + 1, day);
};

exports.addTodayToUsersCalendar = async (date) => {
	let year = date.getFullYear();
	let month = date.getMonth();
	let day = date.getDate();
	initUsersCalendar(year, month + 1, day);
};

exports.addTodayToPostsCalendar = async (date) => {
	let year = date.getFullYear();
	let month = date.getMonth();
	let day = date.getDate();
	initPostsCalendar(year, month + 1, day);
};

async function initUsersCalendar(year, month, day) {
	let dateString = `${year}.${month}.${day}`;
	let analytics = await Analytic.find();
	let doc = analytics[0];
	let id = doc.id;
	let usersCalendar = doc.usersCalendar;
	let newUsersCalendar = await updateCalendar(usersCalendar, dateString, 'user');
	await Analytic.findByIdAndUpdate(id, { usersCalendar: newUsersCalendar });
}

async function initPostsCalendar(year, month, day) {
	let dateString = `${year}.${month}.${day}`;
	let analytics = await Analytic.find();
	let doc = analytics[0];
	let id = doc.id;
	let postsCalendar = doc.postsCalendar;
	let newPostsCalendar = await updateCalendar(postsCalendar, dateString, 'post');
	await Analytic.findByIdAndUpdate(id, { postsCalendar: newPostsCalendar });
}

async function updateCalendar(obj, arr, type) {
	if (typeof arr == 'string') arr = arr.split('.');
	obj[arr[0]] = obj[arr[0]] || {};

	var tmpObj = obj[arr[0]];

	if (arr.length > 1) {
		arr.shift();
		await updateCalendar(tmpObj, arr, type);
	} else {
		if (typeof obj[arr[0]] != 'number') {
			if (type == 'user') {
				let collection = await User.find();
				obj[arr[0]] = collection.length;
			} else if (type == 'post') {
				let collection = await Post.find();
				obj[arr[0]] = collection.length;
			}
		}
	}
	return obj;
}

function addDAU(obj, arr, val) {
	if (typeof arr == 'string') arr = arr.split('.');

	obj[arr[0]] = obj[arr[0]] || {};

	var tmpObj = obj[arr[0]];

	if (arr.length > 1) {
		arr.shift();
		addDAU(tmpObj, arr, val);
	} else {
		if (typeof obj[arr[0]] != 'number') obj[arr[0]] = 0;
		obj[arr[0]] += val;
	}
	return obj;
}

async function checkForDateAndCreate(year, month, day) {
	let dateString = `${year}.${month}.${day}`;
	let analytics = await Analytic.find();
	let doc = analytics[0];
	let id = doc.id;
	let dau = doc.dailyActiveUsers;
	let newDAU = addDAU(dau, dateString, 1);
	await Analytic.findByIdAndUpdate(id, { dailyActiveUsers: newDAU });
}
