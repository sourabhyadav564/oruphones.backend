const express = require('express');
const router = express.Router();

// require("@/database/connection");
// // const bestDealHomeModel = require("@/database/modals/home/best_deals_home");
const saveListingModal = require('@/database/modals/device/save_listing_device');
// const favoriteModal = require("@/database/modals/favorite/favorite_add");
// const logEvent = require("@/middleware/event_logging");
// const getRecommendedPrice = require("@/utils/get_recommended_price");
const getThirdPartyVendors = require('@/utils/third_party_listings');

const getBestDeals = require('@/utils/get_best_deals');
const logEvent = require('@/middleware/event_logging');
const {
	bestDealsNearAll,
	bestDealsNearMe,
} = require('@/utils/best_deals_helper_routes');
const validUser = require('@/middleware/valid_user');

router.get('/listings/best/nearall', validUser, logEvent, async (req, res) => {
	const location = req.query.userLocation;
	let page = req.query.pageNumber;
	page = parseInt(page.toString());
	const userUniqueId = req.headers.useruniqueid;

	let sortBy = req.query.sortBy;
	if (!sortBy) {
		sortBy = 'NA';
	}
	if (sortBy == undefined || sortBy == 'Featured' || sortBy == 'undefined') {
		sortBy = 'NA';
	} else {
		sortBy = sortBy;
	}

	// bestDealsNearAll(location, page, userUniqueId, sortBy, res);
	bestDealsNearMe(location, page, userUniqueId, sortBy, res);
});

module.exports = router;
