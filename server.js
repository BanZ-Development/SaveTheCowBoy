const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const bodyParser = require('body-parser');
const authRoute = require('./routes/auth');
const indexRoute = require('./routes/index');
const adminRoute = require('./routes/admin');
const checkoutRoute = require('./routes/checkout');
const forumRoute = require('./routes/forum');
const User = require('./model/User');
const passport = require('passport');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const app = express();
const port = 5000;
const host = '0.0.0.0';
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 1000
});

app.use(async (req, res, next) => {
	try {
		await mongoose.connect(process.env.MONGODB_URI, {});
	} catch (err) {
		console.log('Hello!');
		console.error(err);
	}
	next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			mongoUrl: process.env.MONGODB_URI,
			ttl: 14 * 24 * 60 * 60, // 14 days
			autoRemove: 'native'
		}),
		cookie: {
			path: '/',
			maxAge: 3600000, // 1 hour
			httpOnly: false,
			secure: false // TODO: Update this on production
		}
	})
);

app.use((req, res, next) => {
	req.session.save((err) => {
		if (err) {
			console.error('Session save error:', err);
		}
		next();
	});
});

app.use(limiter);
app.use(cors());
app.use(express.static('public'));

app.use((req, res, next) => {
	console.log(`${req.method}:${req.url}`);
	next();
});

app.use((req, res, next) => {
	console.log(`Session: ${req.session.id}`);
	next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
	if (req.baseUrl.includes('.')) {
		next();
	} else {
		next();
		app.use(passport.session());
	}
});

mongoose.connection.once('error', () => {
	console.log('Failed to connect to MongoDB');
});

mongoose.connection.once('open', () => {
	console.log('Connected to MongoDB');
});

app.use('/api/auth', authRoute);
app.use('/api/index', indexRoute);
app.use('/api/admin', adminRoute);
app.use('/api/checkout', checkoutRoute);
app.use('/api/forum', forumRoute);

app.get('/', async (req, res) => {
	res.sendFile('index.html', { root: __dirname + '/public/pages/' });
});
app.get('*', async (req, res) => {
	if (req.path.includes('.')) return;
	let args = req.path.split('/');
	let route = args.pop();
	let dir = args.join().replace(',', '');
	res.sendFile(req.baseUrl + route + '.html', {
		root: __dirname + '/public/pages/' + dir
	});
});

app.listen(process.env.PORT || port, host, () => console.log(`Server running on port ${port}`));
