export type TUser = {
	userUniqueId: string;
	userName: string;
	userType: string;
	email: string;
	isaccountexpired: boolean;
	profilePicPath: string;
	mobileNumber: string;
	countryCode: string;
	address: {
		addressType: string;
		city: string;
		locationId: string;
	}[];
	city: string;
	state: string;
	createdDate: string;
	favListings: string[];
	userListings: string[];
	associatedWith: string;
};
