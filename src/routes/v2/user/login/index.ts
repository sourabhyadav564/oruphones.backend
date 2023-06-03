import express from 'express';
import loginController from '@/controllers/user/login';

const router = express.Router();

router.post('/', loginController);

export default router;
