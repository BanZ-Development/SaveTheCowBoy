const bcrypt = require('bcrypt');

exports.compareHash = async (password, user) => {
	const newHash = bcrypt.hashSync(password, user.meta.salt);
	return newHash === user.meta.password;
};

exports.returnHashAndSalt = async (password) => {
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	return { hash, salt };
};