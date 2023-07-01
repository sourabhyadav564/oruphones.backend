import deleteUser from '@/controllers/user/deleteUser';
import favs from '@/controllers/user/favs';
import isLoggedIn from '@/controllers/user/isLoggedIn';
import loginController from '@/controllers/user/login';
import otp from '@/controllers/user/login/otp';
import logout from '@/controllers/user/logout';
import notifications from '@/controllers/user/notifications';
import refreshUser from '@/controllers/user/refreshUser';
import reports from '@/controllers/user/reports';
import update from '@/controllers/user/update';
import isAuth from '@/middleware/isAuth';
import express from 'express';

const router = express.Router();

router.get('/isloggedin', isLoggedIn);
router.get('/logout', isAuth, logout);
router.get('/notifs', isAuth, notifications.getNotifications);
router.get('/deleteUser', isAuth, deleteUser);
router.get('/reports', isAuth, reports.getReport);
router.post('/reports', isAuth, reports.checkReport);
router.post('/notifs', isAuth, notifications.modifyNotifs);
router.post('/refreshUser', isAuth, refreshUser);
router.post('/favs', isAuth, favs);
router.post('/update', isAuth, update);
router.post('/login/otpCreate', otp.otpCreate);
router.post('/login/otpValidate', otp.otpValidate);
router.post('/login', loginController);

export default router;
