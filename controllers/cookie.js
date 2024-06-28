require('dotenv').config();

exports.set = async (res, name, value) => {
	const test = {
		sameSite: 'Lax'
	};
	const prod = {
		httpOnly: true,
		secure: true,
		sameSite: 'Lax'
	};
	const params = /true/.test(process.env.IS_PRODUCTION) ? prod : test;
	res.cookie(name, value, params);
};

exports.get = async (req, name) => {
	try {
		const cookie = req.cookies[name];
		return cookie;
	} catch (err) {
		return null;
	}
};
