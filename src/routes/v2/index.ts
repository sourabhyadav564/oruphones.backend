import index from '@/controllers';
import pingIndex from '@/controllers/ping';
import express from 'express';

const router = express.Router();
router.get('/ping', pingIndex);
router.get('/', index);

export default router;
