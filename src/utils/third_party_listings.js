require('@/database/connection');

const scrappedModal = require('@/database/modals/others/scrapped_models');
const testDefaultImageModal = require('@/database/modals/others/test_model_default_images');
const testScrappedModal = require('@/database/modals/others/test_scrapped_models');
const allImageUrls = [];

const getThirdPartyVendors = async (model_name, make, page) => {
	if (allImageUrls.length == 0) {
		const modalImageData = await testDefaultImageModal.find({}, { _id: 0 });
		modalImageData.forEach((element) => {
			allImageUrls.push(element);
		});
	}
	let dataLength = 0;
	const VENDORS = {
		6: 'Amazon',
		7: 'Quikr',
		8: 'Cashify',
		9: '2Gud',
		10: 'Budli',
		11: 'Paytm',
		12: 'Yaantra',
		13: 'Sahivalue',
		14: 'Shopcluse',
		15: 'Xtracover',
		16: 'Mobigarage',
		17: 'Instacash',
		18: 'Cashforphone',
		19: 'Recycledevice',
		20: 'Quickmobile',
		21: 'mbr_Buyblynk',
		22: 'mbr_Electronicbazaar',
		23: 'Flipkart',
	};

	let filterd = [];
	if (make != '') {
		dataLength = await testScrappedModal
			.find({
				type: 'buy',
				model_name: { $regex: make.toLowerCase(), $options: 'i' },
			})
			.countDocuments();
		filterd = await testScrappedModal.find({
			type: 'buy',
			model_name: { $regex: make },
		});
		// .skip(parseInt(page) * 20)
		// .limit(20);
	} else if (model_name != '') {
		dataLength = await testScrappedModal
			.find({
				type: 'buy',
				model_name: model_name,
			})
			.countDocuments();

		filterd = await testScrappedModal.find({
			type: 'buy',
			model_name: model_name,
		});
		// .skip(parseInt(page) * 20)
		// .limit(20);
	} else {
		dataLength = await testScrappedModal.find({ type: 'buy' }).countDocuments();
		filterd = await testScrappedModal.find({ type: 'buy' });
		// .skip(parseInt(page) * 20)
		// .limit(20);
	}

	let dataObject = {};
	let dataArray = [];
	filterd.forEach(async (element) => {
		let vendorName = VENDORS[element.vendor_id];
		let vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/vendors/${vendorName
			.toString()
			.toLowerCase()}_logo.png`;

		// let imagePath = await getDefaultImage(element.model_name);
		// let imagePath = getImage(element.model_name);
		let imagePath = '';
		let tempModel = element.model_name.toLowerCase().replace('+', 'plus');
		allImageUrls.find((item) => {
			if (item.name == tempModel) {
				imagePath = item.img;
			}
		});
		// let imagePath = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/allModelsImg/${element.model_name
		//   .toString()
		//   .toLowerCase()
		//   .repalce(/+/g, "plus")}.jpg`;
		let condition = element.mobiru_condition;

		dataObject = {
			//   marketingName: element.marketing_name,
			marketingName: element.model_name == null ? '--' : element.model_name,
			make:
				element.model_name == null ? '--' : element.model_name.split(' ')[0],
			listingPrice: element.price == null ? '--' : element.price.toString(),
			deviceStorage:
				element.storage === '0 GB' ||
				element.storage === '--' ||
				element.storage == null
					? '--'
					: `${element.storage} GB`,
			deviceRam:
				element.ram === '0 GB' ||
				element.storage === '--' ||
				element.storage == null
					? '--'
					: `${element.ram} GB`,
			warranty: element.warranty,
			vendorLogo: vendorImage,
			vendorLink: element.link ? element.link : '',
			vendorId: element.vendor_id,
			isOtherVendor: 'Y',
			imagePath: imagePath,
			verified: false,
			favourite: false,
			listingLocation: 'India',
			deviceFinalGrade: ' ',
			deviceCosmeticGrade: ' ',
			deviceFunctionalGrade: ' ',
			imei: ' ',
			model: element.model_name == null ? '--' : element.model_name,
			deviceCondition: condition,
			listingId: element._id,
			listingDate: element.created_at,
			modifiedDate: '',
			verifiedDate: ' ',
			charger: 'Y',
			earphone: 'Y',
			originalbox: 'Y',
			defaultImage: {
				// fullImage: "",
				fullImage: imagePath,
			},
			images: [
				{
					fullImage: imagePath,
					thumbnailImage: imagePath,
				},
			],
			// images: [],
			status: 'Active',
			createdAt: element.created_at,
		};

		dataArray.push(dataObject);
	});

	return { dataArray, dataLength };
};

module.exports = getThirdPartyVendors;
