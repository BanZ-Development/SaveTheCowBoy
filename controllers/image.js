const sharp = require('sharp');

exports.compress = async (buffer, width, quality) => {
	const compressedImageBuffer = await sharp(buffer)
		.resize(width) // Resize image to width 800px (adjust as needed)
		.jpeg({ quality: quality }) // Compress to JPEG format with 80% quality
		.toBuffer();
	return compressedImageBuffer;
};
