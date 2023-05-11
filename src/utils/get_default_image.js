const defaultImageModal = require('@/database/modals/others/model_default_images');
const testDefaultImageModal = require('@/database/modals/others/test_model_default_images');

const getDefaultImage = async (name) => {
	// let str = name.replace(" ", "_").toString().toLowerCase();
	name = name.toLowerCase().replace('+', 'plus');
	try {
		// const defaultImage = await defaultImageModal.findOne({
		//     name: name,
		// });
		const defaultImage = await testDefaultImageModal.findOne({
			name: name,
		});
		let image = '';
		if (defaultImage) {
			image = defaultImage.img;
		}
		return image;
	} catch (error) {
		console.log(error);
	}
};

module.exports = getDefaultImage;
