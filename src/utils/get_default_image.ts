import testDefaultImageModel from '@/database/modals/others/test_model_default_images'

const getDefaultImage = async (name: string) => {
	name = name.toLowerCase().replace('+', 'plus');
	try {
		const defaultImage = await testDefaultImageModel.findOne({
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

export default getDefaultImage;
module.exports = getDefaultImage;
