const passport = require('passport');
const { Strategy } = require('passport-local');
const User = require('../model/User');
const hasher = require('../controllers/hasher');

passport.serializeUser((user, done) => {
	console.log(user);
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	console.log('Deserializing: ' + id);
	try {
		const user = await User.findById(id);
		if (!user) throw new Error('User not found');
		done(null, user);
	} catch (err) {
		console.log(err);
		done(err, null);
	}
});

passport.use(
	new Strategy(
		{
			usernameField: 'email'
		},
		async (email, password, done) => {
			try {
				if (!email || password == '') {
					done(new Error('Missing credentials.'), null);
				}
				const query = User.where({
					'meta.email': email
				});
				const user = await query.findOne();
				if (!user) throw new Error('User not found');
				const isValid = await hasher.compareHash(password, user);
				if (isValid) {
					console.log('Auth successful');
					done(null, user);
				} else {
					console.log('Wrong password');
					done(null, null);
				}
			} catch (err) {
				done(err, null);
			}
		}
	)
);
