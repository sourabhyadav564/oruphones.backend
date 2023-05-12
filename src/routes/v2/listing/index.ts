import express from 'express';
import listingController from '@/controllers/listing/index';

const router = express.Router();

router.post('/topSellingHome', listingController.topSellingHome);
router.get('/topSellingHome', (req, res) => res.send('Hello World!'));

export default router;
