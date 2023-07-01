import listingController from '@/controllers/listing/index';
import isAuth from '@/middleware/isAuth';
import express from 'express';

const router = express.Router();
router.get('/makes', listingController.makes);
router.post('/activate', isAuth, listingController.activate);
router.post('/delete', isAuth, listingController.deleteListing);
router.post('/pause', isAuth, listingController.pause);
router.post('/sendVerification', isAuth, listingController.sendVerification);
router.post('/getSellerNumber', isAuth, listingController.getSellerNumber);
router.post('/models', listingController.models.makes);
router.post('/models/filtered', listingController.models.filteredMakes);
router.post('/listings', isAuth, listingController.listings);
router.post(
	'/filter/getSimilarLeaderboard',
	listingController.filter.getSimilarWithExternalVendors
);
router.post(
	'/filter/getSimilarPriceRange',
	listingController.filter.getSimilarPriceRange
);
router.post('/filter/getSimilar', listingController.filter.getSimilarListings);
router.post('/filter', listingController.filter.filter);
router.post('/topSellingHome', listingController.topSellingHome);
router.get('/topSellingHome', (req, res) => res.send('Hello World!'));

export default router;
