import { neededKeysForDeals } from './matrix_figures';
import bestDealsModal from '@/database/modals/others/best_deals_models';

// const applySortFilter = async (sortBy, type, page, location, findingData) => {
const applySortFilter = async (
	sortBy: string,
	page: string,
	findingData: any
) => {
	let totalProducts;
	let completeDeals = [];
	let bestDealsCountNumber = 0;

	totalProducts = await bestDealsModal.countDocuments(findingData);

	bestDealsCountNumber = await bestDealsModal.countDocuments({
		...findingData,
		notionalPercentage: {
			$gt: 0,
			$lte: 40,
		},
	});

	// rewrite the above code using switch case and for faster response

	let sortingData = {};
	let collationData = { locale: 'en_US' };
	switch (sortBy) {
		case 'Price - High to Low':
			sortingData = { listingPrice: -1 };
			collationData = { locale: 'en_US' };
			break;
		case 'Price - Low to High':
			sortingData = { listingPrice: 1 };
			collationData = { locale: 'en_US' };
			break;
		case 'Newest First':
			sortingData = { createdAt: -1 };
			findingData.createdAt = { $ne: null };
			break;
		case 'Oldest First':
			sortingData = { createdAt: 1 };
			findingData.createdAt = { $ne: null };
			break;
		default:
			// sort by notionalPercentage
			break;
	}

	completeDeals = await bestDealsModal
		.find(findingData, {
			...neededKeysForDeals,
		})
		.sort(sortingData)
		.collation(collationData)
		.skip(parseInt(page) * 30)
		.limit(30)
		.lean();
	return {
		totalProducts,
		completeDeals,
		bestDealsCount: bestDealsCountNumber,
	};
};

export default applySortFilter;
module.exports = applySortFilter;
