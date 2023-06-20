import index from '@/controllers';
import idx404 from '@/controllers/404';
import pingIndex from '@/routes/v2/ping';
import listingIndex from '@/routes/v2/listing';
import userIndex from '@/routes/v2/user';
import express from 'express';

const router = express.Router();
router.use('/ping', pingIndex);
router.use('/listing', listingIndex);
router.use('/user', userIndex);
router.get('/', index);
router.use('*', idx404);

export default router;
