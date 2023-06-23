import index from '@/controllers';
import idx404 from '@/controllers/404';
import imageUpload from '@/controllers/imageUpload';
import isAuth from '@/middleware/isAuth';
import listingIndex from '@/routes/v2/listing';
import pingIndex from '@/routes/v2/ping';
import userIndex from '@/routes/v2/user';
import { singleUpload } from '@/utils/upload_image';
import express from 'express';

const router = express.Router();
router.post('/imageUpload', isAuth, singleUpload.single('image'), imageUpload);
router.use('/ping', pingIndex);
router.use('/listing', listingIndex);
router.use('/user', userIndex);
router.get('/', index);
router.use('*', idx404);

export default router;
