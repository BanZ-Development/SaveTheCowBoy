const Analytic = require('../model/Analytic');

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
		dailyActiveUsers: {}
	};
	let analytics = await Analytic.create(options);
};

exports.addDailyActiveUser = async (date) => {
	let year = date.getFullYear();
	let month = date.getMonth();
	let day = date.getDate();
	checkForDateAndCreate(year, month + 1, day);
};

function addProps(obj, arr, val) {
	if (typeof arr == 'string') arr = arr.split('.');

	obj[arr[0]] = obj[arr[0]] || {};

	var tmpObj = obj[arr[0]];

	if (arr.length > 1) {
		arr.shift();
		addProps(tmpObj, arr, val);
	} else {
		if (typeof obj[arr[0]] != 'number') obj[arr[0]] = 0;
		obj[arr[0]] += val;
	}
	return obj;
}

async function checkForDateAndCreate(year, month, day) {
	let dateString = `${year}.${month}.${day}`;
	console.log(dateString);
	let analytics = await Analytic.find();
	let doc = analytics[0];
	let id = doc.id;
	console.log('Doc:', doc);
	let dau = doc.dailyActiveUsers;
	let newDAU = addProps(dau, dateString, 1);
	console.log('New DAU:', newDAU);
	await Analytic.findByIdAndUpdate(id, {
		dailyActiveUsers: newDAU
	});
	/*if (!analytics[`${year}`] || !analytics[`${year}.${month}`] || !analytics[`${year}.${month}.${day}`]) {
		await Analytic.findByIdAndUpdate(id, {
			[`${year}`]: {
				[`${month}`]: {
					[`${day}`]: 1
				}
			}
		});
	}*/
}
