const defaultImageModal = require("../src/database/modals/others/model_default_images");

const getDefaultImage = async (name) => {
    try {
        const defaultImage = await defaultImageModal.findOne({
            name: name,
        })
        const image = defaultImage.img;
        return image;
    } catch (error) {
        console.log(error);
    }
}

module.exports = getDefaultImage;