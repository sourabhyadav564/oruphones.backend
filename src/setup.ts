import startSavingBestDeals from '@/utils/best_deals_cron_job';
import startCalculatingLSPTest from '@/utils/new_lsp';
import session from '@/utils/sessionStore';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';


require('dotenv').config();

const corsOptions = {
	// origin: "https://userregisrationfrontend.herokuapp.com",
	origin: [
		'https://www.oruphones.com',
		'https://dev.oruphones.com',
		'https://store.oruphones.com',
		'https://image.oruphones.com',
		'https://mip.oruphones.com',
		'https://api.oruphones.com',
		'https://prodbackend.oruphones.com',
		'https://new-test-application-001.herokuapp.com',
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:3002',
		'https://localhost:3003',
		'http://localhost:5500',
		'https://oru-phones-web.vercel.app',
		'https://oru-phones-mobile-web.vercel.app',
		'https://oru-phones-mip-portal.vercel.app',
		'https://oruphones-desk-web-orpin.vercel.app',
	],
};

const app: Express = express();

// parse application/x-www-form-urlencoded
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(session);


let schedule = require('node-schedule');
schedule.scheduleJob('00 02 * * *', function () {
	console.log('The answer to life, the universe, and everything!');
	startCalculatingLSPTest();
});

schedule.scheduleJob('00 03 * * *', function () {
	console.log('The answer to life, the universe, and everything!');
	startSavingBestDeals();
});

export default app;