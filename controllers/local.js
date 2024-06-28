const passport = require('passport');
const { Strategy } = require('passport-local');
const User = require('../model/User');
const hasher = require('../controllers/hasher');

passport.serializeUser((user, done) => {
	console.log('Serializing: ' + user.id);
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id).exec();
		if (user) {
			done(null, user);
		} else {
			console.log('User not found');
			done(null, null);
		}
	} catch (error) {
		console.error('Error finding user:', error);
		done(error, null);
	}
});

passport.use(
	new Strategy(
		{
			usernameField: 'email'
		},
		async (email, password, done) => {
			console.log(email);
			if (!email || password == '') {
				done(new Error('Missing credentials.'), null);
			}
			const query = User.where({
				'meta.email': email
			});
			const user = await query.findOne();
			if (user) {
				const isValid = await hasher.compareHash(password, user);
				if (!isValid) done(null, false, { message: 'Incorrect password' });
				else {
					console.log('Auth successful');
					done(null, user);
				}
			} else {
				done(null, false, { message: 'Incorrect email' });
			}
		}
	)
);
