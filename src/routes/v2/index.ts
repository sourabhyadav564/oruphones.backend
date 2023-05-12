import index from '@/controllers';
import pingIndex from '@/routes/v2/ping';
import idx404 from '@/controllers/404';
import listingIndex from '@/routes/v2/listing';
import express from 'express';

const router = express.Router();
router.use('/ping', pingIndex);
router.use('/listing', listingIndex);
router.get('/', index);
router.use('*', idx404);

export default router;
