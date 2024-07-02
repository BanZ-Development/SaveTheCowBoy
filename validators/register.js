const Validator = require('fastest-validator');

const v = new Validator({
	useNewCustomCheckerFunction: true, // using new version
	messages: {
		// Register our new error message text
		atLeastOneLetter: 'The pass value must contain at least one letter from a-z and A-Z ranges!',
		atLeastOneDigit: 'The pass value must contain at least one digit from 0 to 9!'
	}
});

const schema = {
	username: { type: 'string', min: 3, max: 20 },
	password: {
		type: 'string',
		custom: (v, errors) => {
			if (!/[0-9]/.test(v)) errors.push({ type: 'atLeastOneDigit' });
			if (!/[a-zA-Z]/.test(v)) errors.push({ type: 'atLeastOneLetter' });
			return v;
		},
		min: 8,
		messages: {
			stringPattern: 'pass value must contain a digit',
			stringMin: 'Your pass value is too short'
		}
	},
	email: { type: 'email' }
};

const check = v.compile(schema);

module.exports = check;
