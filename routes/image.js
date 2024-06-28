const router = require('express').Router();
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { GridFSBucket } = require('mongodb');

let gfs, gfsBucket;
mongoose.connection.once('open', () => {
	try {
		gfs = Grid(mongoose.connection.db, mongoose.mongo);
		gfs.collection('uploads');
		gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
	} catch (error) {
		console.log(error);
	}
});

router.get('/:filename', async (req, res) => {
	const file = await gfs.files.findOne({ filename: req.params.filename });
	if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
		const readstream = gfsBucket.openDownloadStreamByName(file.filename);
		readstream.on('error', (err) => {
			res.status(500).json({ err: err.message });
		});
		readstream.pipe(res);
	} else {
		res.status(404).json({ err: 'Not an image' });
	}
});

module.exports = router;
