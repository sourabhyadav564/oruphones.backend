const mailIds = {
	dev: 'nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp',
	prod: 'nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp, anish@zenro.co.jp, shubham@oruphones.com',
	listings:
		'nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp, nakul.khandelwal007@gmail.com, anish@zenro.co.jp, shubham@oruphones.com',
};

exports.mailIds = mailIds;

const externalSellSourceFigures = {
	chargerPercentage: 2.8,
	earphonePercentage: 1.52,
	originalBoxPercentage: 1.65,
	zeroToThreeAgePercentage: 0,
	fourToSixAgePercentage: 11.17,
	sevenToElevenAgePercentage: 13.98,
	moreThanElevenAgePercentage: 24.26,
};

exports.externalSellSourceFigures = externalSellSourceFigures;

const recommendedPriceFigures = {
	lowerRangeMatrix: 0.7,
	upperRangeMatrix: 0.8,
	isAppleCharger: 1.5,
	isNonAppleCharger: 1.5,
	isAppleEarphone: 1,
	isNonAppleEarphone: 1,
	isOriginalBox: 0.5,
	zeroToThreeAgePercentage: 10,
	fourToSixAgePercentage: 8,
	sevenToElevenAgePercentage: 5,
	moreThanElevenAgePercentage: 0,
	varified: 0,
};

exports.recommendedPriceFigures = recommendedPriceFigures;

const bestDealFigures = {
	verified_percentage: 2,
	warranty_percentage1: 21,
	warranty_percentage2: 14,
	warranty_percentage3: 6,
	has_apple_charger_percentage: 1.5,
	has_non_apple_charger_percentage: 1.5,
	has_apple_earphone_percentage: 1,
	has_non_apple_earphone_percentage: 1,
	has_original_box_percentage: 0.5,
	third_party_warranty_percentage: 8,
	daily_removed_percentage: 0.1,
};

exports.bestDealFigures = bestDealFigures;

const neededKeysForDeals = {
	listingPrice: 1,
	marketingName: 1,
	deviceStorage: 1,
	deviceRam: 1,
	deviceCondition: 1,
	listingDate: 1,
	listedBy: 1,
	listingLocation: 1,
	listingId: 1,
	images: 1,
	verified: 1,
	isOtherVendor: 1,
	imagePath: 1,
	defaultImage: 1,
	status: 1,
	verifiedDate: 1,
};

exports.neededKeysForDeals = neededKeysForDeals;

const unwantedKeysForTables = {
	_id: 0,
	storeId: 0,
	color: 0,
	deviceCosmeticGrade: 0,
	deviceFinalGrade: 0,
	deviceFunctionalGrade: 0,
	images: 0,
	imei: 0,
	model: 0,
	platform: 0,
	agent: 0,
	recommendedPriceRange: 0,
	cosmetic: 0,
	questionnaireResults: 0,
	functionalTestResults: 0,
	createdAt: 0,
	updatedAt: 0,
	__v: 0,
	prodLink: 0,
};

exports.unwantedKeysForTables = unwantedKeysForTables;

const oruMitraCons = {
	earningPerListing: 10,
};

exports.oruMitraCons = oruMitraCons;
