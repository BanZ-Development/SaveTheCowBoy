const User = require('../model/User');
const register = require('../validators/register');
const login = require('../validators/login');
const news = require('../validators/news');

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
	console.log('Register Validated:' + result);
	return result;
};

exports.login = async (req) => {
	const result = login(req.body);
	console.log('Login Validated: ' + result);
	return result;
};

exports.news = async (req, res) => {
	const result = news(req.body);
	console.log('Post Validated: ' + result);
	return result;
};
