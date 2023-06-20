import isLoggedIn from '@/controllers/user/isLoggedIn';
import loginController from '@/controllers/user/login';
import express from 'express';

const router = express.Router();

router.get('/isloggedin', isLoggedIn);
router.post('/login', loginController);

export default router;
