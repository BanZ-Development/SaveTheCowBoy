const bcrypt = require('bcrypt');

exports.compareHash = async (password, user) => {
	try {
		const newHash = bcrypt.hashSync(password, user.meta.salt);
		return newHash === user.meta.password;
	} catch (err) {
		console.log(err);
		return null;
	}
};

exports.returnHashAndSalt = async (password) => {
	try {
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);
		return { hash, salt };
	} catch (err) {
		console.log(err);
		return null;
	}
};
