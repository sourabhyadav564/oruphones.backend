import index from '@/controllers';
import idx404 from '@/controllers/404';
import imageUpload from '@/controllers/imageUpload';
import imageUploadMiddleware from '@/middleware/imageUpload';
import reportIssue from '@/controllers/reportIssue';
import listingIndex from '@/routes/v2/listing';
import pingIndex from '@/routes/v2/ping';
import userIndex from '@/routes/v2/user';
import searchIndex from '@/routes/v2/search'
import express from 'express';

const router = express.Router();
router.post('/reportIssue', reportIssue);
router.post('/imageUpload', imageUploadMiddleware, imageUpload);
router.use('/ping', pingIndex);
router.use('/listing', listingIndex);
router.use('/user', userIndex);
router.use('/location', searchIndex )
router.get('/', index);
router.use('*', idx404);

export default router;
