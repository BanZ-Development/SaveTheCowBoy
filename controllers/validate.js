const User = require('../model/User');
const register = require('../validators/register');
const login = require('../validators/login');
const post = require('../validators/post');

exports.Authenticate = async (authAPI, Passed, Failed) => {
	const result = await Promise.resolve(
		new Promise(function (resolve) {
			setTimeout(() => {
				resolve(authAPI);
			}, 100);
		})
	);
	typeof result === 'object' && result !== null ? Failed(result) : Passed();
};

async function Authenticate(authAPI) {
	return new Promise(function (resolve) {
		setTimeout(() => {
			resolve(authAPI);
		}, 100);
	});
}

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

exports.post = async (req, res) => {
	const result = post(req.body);
	console.log('Result: \n' + result);
	return result;
};
