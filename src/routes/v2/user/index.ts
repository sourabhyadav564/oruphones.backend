import isLoggedIn from '@/controllers/user/isLoggedIn';
import loginController from '@/controllers/user/login';
import otp from '@/controllers/user/login/otp';
import logout from '@/controllers/user/logout';
import express from 'express';

const router = express.Router();

router.get('/isloggedin', isLoggedIn);
router.get('/logout', logout);
router.post('/login/otpCreate', otp.otpCreate)
router.post('/login/otpValidate', otp.otpValidate)
router.post('/login', loginController);

export default router;
