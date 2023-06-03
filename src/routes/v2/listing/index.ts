import listingController from '@/controllers/listing/index';
import express from 'express';

const router = express.Router();
router.get('/makes', listingController.makes);
router.post('/models', listingController.models);
router.post('/filter/getSimilarLeaderboard', listingController.filter.getSimilarWithExternalVendors);
router.post('/filter/getSimilarPriceRange', listingController.filter.getSimilarPriceRange);
router.post('/filter/getSimilar', listingController.filter.getSimilarListings);
router.post('/filter', listingController.filter.filter);
router.post('/topSellingHome', listingController.topSellingHome);
router.get('/topSellingHome', (req, res) => res.send('Hello World!'));

export default router;