const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const analyticSchema = new Schema({
	dailyActiveUsers: Object
});

module.exports = mongoose.model('Analytic', analyticSchema);
