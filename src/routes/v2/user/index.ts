import isLoggedIn from '@/controllers/user/isLoggedIn';
import loginController from '@/controllers/user/login';
import logout from '@/controllers/user/logout';
import express from 'express';

const router = express.Router();

router.get('/isloggedin', isLoggedIn);
router.get('/logout', logout);
router.post('/login', loginController);

export default router;
