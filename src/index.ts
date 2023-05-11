import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import startSavingBestDeals from '@/utils/best_deals_cron_job';
import startCalculatingLSPTest from '@/utils/new_lsp';

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
	],
};

const app: Express = express();
const port = process.env.PORT || 5000;

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors(corsOptions));

let schedule = require('node-schedule');

// schedule.scheduleJob("00 02 * * *", function () {
//   console.log("The answer to life, the universe, and everything!");
//   startCalculatingLSP();
// });

schedule.scheduleJob('00 02 * * *', function () {
	console.log('The answer to life, the universe, and everything!');
	startCalculatingLSPTest();
});

// schedule.scheduleJob("09 17 * * *", function () {
//   console.log("The answer to life, the universe, and everything!");
//   generateCollectionDump();
// });

schedule.scheduleJob('00 03 * * *', function () {
	console.log('The answer to life, the universe, and everything!');
	startSavingBestDeals();
});

import testRoute from '@/routes/v1/others/test_routes';
import brandRoute from '@/routes/v1/master/master_brand_routes';
import makeModalRoute from '@/routes/v1/master/make_modal_routes';
import saveModalRoute from '@/routes/v1/device/save_listing_routes';
import eventRoute from '@/routes/v1/others/event_routes';
import imageRoute from '@/routes/v1/device/image_upload_routes';
import questionRoute from '@/routes/v1/master/get_question_routes';
import citiesRoute from '@/routes/v1/global/cities_route';
import bestDealHomeRoute from '@/routes/v1/home/best_deal_home_routes';
import bestDealCompletedRoute from '@/routes/v1/device/complete_best_deal_routes';
import loginOtpRoute from '@/routes/v1/login/login_otp_routes';
import createUserRoute from '@/routes/v1/login/login_user_routes';
import saveNotificationTokenRoute from '@/routes/v1/notification/notification_save_token_routes';
import diagnosticsConfigRoute from '@/routes/v1/diagnostics/diagnostics_config_routes';
import searchFilterRoute from '@/routes/v1/master/show_search_filters_routes';
import favoriteRoute from '@/routes/v1/favorite/favorite_add';
import marketingNameByModel from '@/routes/v1/master/marketing_name_by_model_routes';
import listingByMakeRoute from '@/routes/v1/home/listings_by_make_routes';
import recommendedPriceRoute from '@/routes/v1/others/recommended_price';
import topSellingModelRoute from '@/routes/v1/home/top_selling_models_routes';
import buyersVerficationRoutes from '@/routes/v1/device/buyers_verification_routes';
import externalSourcePriceRoutes from '@/routes/v1/device/get_external_source_data_routes';
import searchSuggestionRoute from '@/routes/v1/global/search_filter_routes';
import logEventInfoRoute from '@/routes/v1/global/log_event_info_routes';
import searchListingRoute from '@/routes/v1/home/search_listing_routes';
import shareLinkRoute from '@/routes/v1/global/share_link_route';
import shopByCategoryRoutes from '@/routes/v1/home/shop_by_category_routes';
import shopByPriceRoute from '@/routes/v1/home/shop_by_price_routes';
import getInfoTemplateRoutes from '@/routes/v1/global/get_info_template_routes';
import getMIPLoginRoutes from '@/routes/v1/mip/mip_login_routes';
import getMIPImageVerificationRoutes from '@/routes/v1/mip/mip_image_verification_route';
import getBatteryTestRoutes from '@/routes/v1/diagnostics/battery_test_routes';
import addSubscriptionRoute from '@/routes/v1/global/subscription_routes';
import addContactUsRoute from '@/routes/v1/global/contact_us_route';
import getNewTokenRoute from '@/routes/v1/login/get_new_token';
import wordpressRoute from '@/routes/v1/others/wordpress_route';

app.get('/', (req, res) => {
	res.status(200).json({
		message: 'Backend Testing Server Running Successfully',
	});
});

app.use('/api/v1', testRoute);
app.use('/api/v1/master', brandRoute);
app.use('/api/v1/master', makeModalRoute);
app.use('/api/v1/master', questionRoute);
app.use('/api/v1/master', searchFilterRoute);
app.use('/api/v1/master', marketingNameByModel);
app.use('/api/v1/device', saveModalRoute);
app.use('/api/v1/device', imageRoute);
app.use('/api/v1/device', bestDealCompletedRoute);
app.use('/api/v1/device', buyersVerficationRoutes);
app.use('/api/v1/device', externalSourcePriceRoutes);
app.use('/api/v1/global', citiesRoute);
app.use('/api/v1/global', recommendedPriceRoute);
app.use('/api/v1/global', shareLinkRoute);
app.use('/api/v1/global', getInfoTemplateRoutes);
app.use('/api/v1/home', bestDealHomeRoute);
app.use('/api/v1/home', listingByMakeRoute);
app.use('/api/v1/home', topSellingModelRoute);
app.use('/api/v1/home', searchListingRoute);
app.use('/api/v1/home', shopByCategoryRoutes);
app.use('/api/v1/home', shopByPriceRoute);
app.use('/api/v1/api/auth', eventRoute);
app.use('/api/v1/api', diagnosticsConfigRoute);
app.use('/api/v1/api', getBatteryTestRoutes);
app.use('/api/v1/mip', getMIPImageVerificationRoutes);
app.use('/api/v1/login', loginOtpRoute);
app.use('/api/v1/login', createUserRoute);
app.use('/api/v1/notification', saveNotificationTokenRoute);
app.use('/api/v1/favorite', favoriteRoute);
app.use('/api/v1/cscglobal', searchSuggestionRoute);
app.use('/api/v1/cscglobal', logEventInfoRoute);
app.use('/api/v1/user', getMIPLoginRoutes);
app.use('/api/v1/global', addSubscriptionRoute);
app.use('/api/v1/global', addContactUsRoute);
app.use('/api/v1/auth', getNewTokenRoute);
app.use('/api/v1/wordpress', wordpressRoute);

app.listen(port, () => {
	console.log(`The app listening on port ${port}`);
});
