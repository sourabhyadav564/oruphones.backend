import { index } from '@/controllers';
import express from 'express';

const router = express.Router();
router.get('/', index);

export default router;
