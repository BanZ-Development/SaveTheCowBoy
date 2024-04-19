const User = require('../model/User');
const register = require('../validators/register');
const login = require('../validators/login');

exports.register = async (req, res) => {
	const result = register(req.body);
	console.log('Result: \n' + result);
	return result;
};

exports.login = async (req) => {
	const result = login(req.body);
	console.log('Result: \n' + result);
	return result;
};
