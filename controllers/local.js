const passport = require('passport');
const { Strategy } = require('passport-local');
const User = require('../model/User');
const hasher = require('../controllers/hasher');

passport.serializeUser((user, done) => {
	console.log('Serializing: ' + user.id);
	console.log(user);
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	const queryOptions = { timeout: true, maxTimeMS: 10000 }; // Set maxTimeMS to 10 seconds

	User.findOne({ _id: id }, null, queryOptions)
		.then((user) => {
			if (user) {
				console.log('User found:', user);
				done(null, user);
			} else {
				console.log('User not found');
				done(err, null);
			}
		})
		.catch((error) => {
			console.error('Error finding user:', error);
		});
});

passport.use(
	new Strategy(
		{
			usernameField: 'email'
		},
		async (email, password, done) => {
			console.log(email);

			try {
				if (!email || password == '') {
					done(new Error('Missing credentials.'), null);
				}
				const query = User.where({
					'meta.email': email
				});
				console.log(query);
				const user = await query.findOne();
				const isValid = await hasher.compareHash(password, user);
				if (isValid) {
					console.log('Auth successful');
					done(null, user);
				} else {
					console.log('Wrong password');
					done(null, null);
				}
			} catch (err) {
				done(null, null);
			}
		}
	)
);
