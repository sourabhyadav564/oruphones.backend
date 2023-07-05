import mongoose from 'mongoose';

const latLongSchema = new mongoose.Schema({
	type: {
		type: String,
		default: 'Point',
	},
	coordinates: {
		type: [Number],
		index: '2dsphere',
	},
});

const saveListingSchema = new mongoose.Schema(
	{
		charger: {
			type: String,
			required: true,
		},
		color: {
			type: String,
			default: ' ',
		},
		deviceCondition: {
			type: String,
			required: true,
		},
		deviceCosmeticGrade: {
			type: String,
			default: ' ',
		},
		deviceFinalGrade: {
			type: String,
			default: ' ',
		},
		deviceFunctionalGrade: {
			type: String,
			default: ' ',
		},
		listedBy: {
			type: String,
			required: true,
		},
		deviceStorage: {
			type: String,
			required: true,
		},
		earphone: {
			type: String,
			required: true,
		},
		images: {
			type: [
				{
					thumbImage: {
						type: String,
					},
					fullImage: {
						type: String,
					},
					isVarified: {
						type: String,
						default: 'accepted',
					},
				},
			],
		},
		defaultImage: {
			type: {
				fullImage: {
					type: String,
				},
			},
			default: {
				fullImage:
					'https://d1tl44nezj10jx.cloudfront.net/devImg/allModelsImg/apple_iphone_se_2022.jpg',
			},
		},
		imei: {
			type: String,
		},
		listingLocation: {
			type: String,
			default: 'Delhi',
		},
		listingState: {
			type: String,
		},
		listingLocality: {
			type: String,
		},
		listingPrice: {
			type: String,
			// required: true,
		},
		listingNumPrice: {
			type: Number,
		},
		make: {
			type: String,
			required: true,
		},
		marketingName: {
			type: String,
			required: true,
		},
		mobileNumber: {
			type: String || Number,
			// required: true,
		},
		model: {
			type: String,
			required: true,
		},
		originalbox: {
			type: String,
			required: true,
		},
		platform: {
			type: String,
			required: true,
		},
		recommendedPriceRange: {
			type: String,
			default: '--',
		},
		userUniqueId: {
			type: String,
			required: true,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		deviceUniqueId: {
			type: String,
			default: 'NA',
		},
		listingId: {
			type: String,
			// required: true,
		},
		status: {
			type: String,
			default: 'Active',
		},
		deviceImagesAvailable: {
			type: Boolean,
		},
		verifiedDate: {
			type: String,
			// default: Date.now(),
		},
		listingDate: {
			type: String,
			// default: Date.now(),
		},
		deviceRam: {
			type: String,
		},
		warranty: {
			type: String,
			default: 'None',
		},
		prodLink: {
			type: String,
			default: '',
		},
		storeId: {
			type: String,
			default: '000',
		},
		isOtherVendor: {
			type: String,
			default: 'N',
		},
		agent: {
			type: String,
		},
		location: {
			type: latLongSchema,
		},
		latLong: {
			type: {
				latitude: {
					type: Number,
				},
				longitude: {
					type: Number,
				},
			},
		},
		questionnaireResults: {
			type: [
				{
					question: {
						type: String,
					},
					questionId: {
						type: Number,
					},
					result: {
						type: String,
					},
					childQuestions: {
						type: [
							{
								type: String,
							},
						],
					},
					childAnswers: {
						type: {
							type: String,
						},
					},
				},
			],
		},
		functionalTestResults: {
			type: [
				{
					commandName: {
						type: String,
					},
					startDateTime: {
						type: String,
					},
					displayName: {
						type: String,
					},
					testStatus: {
						type: String,
					},
					endDateTime: {
						type: String,
					},
				},
			],
		},
		cosmetic: {
			type: {
				0: {
					type: String,
				},
				1: {
					type: String,
				},
				2: {
					type: String,
				},
			},
		},
		associatedWith: {
			type: String,
		},
	},
	{ timestamps: true }
);

saveListingSchema.pre('save', async function (next) {
	this.listingId = this._id.toString();
	next();
});

saveListingSchema.index({ location: '2dsphere' });

const saveListingModal = mongoose.model('saved_listings', saveListingSchema);

export = saveListingModal;