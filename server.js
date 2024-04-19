const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');

const authRoute = require('./routes/auth');
const userRoute = require('./routes/index');
require('dotenv').config();
const app = express();
const port = 5000;
const host = '0.0.0.0';
const store = new session.MemoryStore();
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 1000
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
	session({
		secret: 'ASDFGHJKL',
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: process.env.MONGODB_URI
		})
	})
);
app.use(limiter);
app.use(cors());

app.use(express.static('public'));
app.use((req, res, next) => {
	console.log(`${req.method}:${req.url}`);
	next();
});

app.use((req, res, next) => {
	console.log(store);
	next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
	try {
		await mongoose.connect(process.env.MONGODB_URI, {}).then();
		next();
	} catch (err) {
		console.error(err);
	}
});

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);

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
