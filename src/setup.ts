import startSavingBestDeals from '@/utils/best_deals_cron_job';
import sendListingsMail from '@/utils/listing_mails';
import startDataMigrationJob from '@/utils/migration_data';
import startCalculatingLSPTest from '@/utils/new_lsp';
import startDataMigrationJob from '@/utils/migration_data';
import sendListingsMail from '@/utils/listing_mails';
import session from '@/utils/sessionStore';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

require('dotenv').config();

const corsOptions = {
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
		'https://oruphones-mobile-web.vercel.app',
		'https://devmitra.oruphones.com',
		'https://mitra.oruphones.com',
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
if (process.env.SERVER_URL === 'https://oruphones.com') {
	schedule.scheduleJob('57 10 * * *', function () {
		// console.log('The answer to life, the universe, and everything!');
		startDataMigrationJob();
	});

	schedule.scheduleJob('30 16 * * *', function () {
		startCalculatingLSPTest();
	});

	schedule.scheduleJob('59 11 * * *', function () {
		// console.log('The answer to life, the universe, and everything!');
		startSavingBestDeals();
	});

	schedule.scheduleJob('53 15 * * *', function () {
		sendListingsMail();
	});
}
export default app;
