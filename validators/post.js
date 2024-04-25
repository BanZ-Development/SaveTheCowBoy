const Validator = require('fastest-validator');

const v = new Validator();

const schema = {
	title: {
		type: 'string',
		max: 100,
		messages: {
			stringMax: 'Your title is too long!'
		}
	},
	message: {
		type: 'string',
		max: 1000,
		messages: {
			stringMax: 'Your message is too long!'
		}
	}
};

const check = v.compile(schema);

module.exports = check;
