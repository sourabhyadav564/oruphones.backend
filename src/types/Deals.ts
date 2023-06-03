export type TDeals = {
	listingId: string; //B
	charger: string;
	color: string;
	deviceCondition: string;
	deviceCosmeticGrade: string;
	deviceFinalGrade: string;
	deviceFunctionalGrade: string;
	listedBy: string; //C
	deviceStorage: string;
	earphone: string;
	images: {
		thumbImage: string;
		fullImage: string;
		isVarified: string;
	}[];
	defaultImage: {
		fullImage: string;
	};
	imei: string;
	listingLocation: string;
	listingPrice: string;
	make: string;
	marketingName: string;
	model: string;
	mobileNumber: string | number;
	originalBox: string;
	platform: string;
	recommendedPriceRange: string;
	userUniqueId: string; //C
	verified: boolean;
	deviceUniqueId: string; //B
	status: string;
	deviceImageAvailable: boolean;
	verifiedDate: string;
	listingDate: string; //A
	deviceRam: string;
	isOtherVendor: string;
	warranty: string;
	questionnaireResults: {
		question: string;
		questionId: string;
		result: string;
		childQuestions: string[];
		childAnswers: string[];
	}[];
	functionalTestResults: {
		commandName: string;
		startDateTime: string;
		displayName: string;
		testStatus: string;
		endDateTime: string;
	}[];
	notionalPercentage: number;
	imagePath: string;
	createdAt: string; //A
	cosmetic: {
		0: string;
		1: string;
		2: string;
	};
	associatedWith: string;
};
