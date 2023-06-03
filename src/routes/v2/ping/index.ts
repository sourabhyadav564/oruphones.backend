import pingIndex from '@/controllers/ping';
import express from 'express';

const router = express.Router();
router.get('/', pingIndex);

export default router;
