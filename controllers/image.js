exports.getImage = async (image) => {
	const base64Image = image.data.toString('base64');
	const contentType = image.contentType;
	const imageSrc = `data:${contentType};base64,${base64Image}`;
	return imageSrc;
};
