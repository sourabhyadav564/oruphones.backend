import errorHandler from '@/middleware/errorHandler';
import buyersVerficationRoutes from '@/routes/v1/device/buyers_verification_routes';
import bestDealCompletedRoute from '@/routes/v1/device/complete_best_deal_routes';
import externalSourcePriceRoutes from '@/routes/v1/device/get_external_source_data_routes';
import imageRoute from '@/routes/v1/device/image_upload_routes';
import saveModalRoute from '@/routes/v1/device/save_listing_routes';
import getBatteryTestRoutes from '@/routes/v1/diagnostics/battery_test_routes';
import diagnosticsConfigRoute from '@/routes/v1/diagnostics/diagnostics_config_routes';
import favoriteRoute from '@/routes/v1/favorite/favorite_add';
import citiesRoute from '@/routes/v1/global/cities_route';
import addContactUsRoute from '@/routes/v1/global/contact_us_route';
import agentRoute from '@/routes/v1/global/agent_store';
import getInfoTemplateRoutes from '@/routes/v1/global/get_info_template_routes';
import logEventInfoRoute from '@/routes/v1/global/log_event_info_routes';
import searchSuggestionRoute from '@/routes/v1/global/search_filter_routes';
import shareLinkRoute from '@/routes/v1/global/share_link_route';
import addSubscriptionRoute from '@/routes/v1/global/subscription_routes';
import dashboard from '@/routes/v1/global/dashboard';
import agentOlxDashboard from '@/routes/v1/global/agent_olx';
import bestDealHomeRoute from '@/routes/v1/home/best_deal_home_routes';
import listingByMakeRoute from '@/routes/v1/home/listings_by_make_routes';
import searchListingRoute from '@/routes/v1/home/search_listing_routes';
import shopByCategoryRoutes from '@/routes/v1/home/shop_by_category_routes';
import shopByPriceRoute from '@/routes/v1/home/shop_by_price_routes';
import topSellingModelRoute from '@/routes/v1/home/top_selling_models_routes';
import getNewTokenRoute from '@/routes/v1/login/get_new_token';
import loginOtpRoute from '@/routes/v1/login/login_otp_routes';
import createUserRoute from '@/routes/v1/login/login_user_routes';
import questionRoute from '@/routes/v1/master/get_question_routes';
import marketingNameByModel from '@/routes/v1/master/marketing_name_by_model_routes';
import brandRoute from '@/routes/v1/master/master_brand_routes';
import searchFilterRoute from '@/routes/v1/master/show_search_filters_routes';
import getMIPImageVerificationRoutes from '@/routes/v1/mip/mip_image_verification_route';
import getMIPLoginRoutes from '@/routes/v1/mip/mip_login_routes';
import saveNotificationTokenRoute from '@/routes/v1/notification/notification_save_token_routes';
import eventRoute from '@/routes/v1/others/event_routes';
import recommendedPriceRoute from '@/routes/v1/others/recommended_price';
import testRoute from '@/routes/v1/others/test_routes';
import wordpressRoute from '@/routes/v1/others/wordpress_route';
import router from '@/routes/v2';
import buyerVerificationRoutes from '@/routes/v2/device/buyer_verification_routes';
import completeBestDealRoutes from '@/routes/v2/device/complete_best_deal_routes';
import getExternalSellSourceRoutes from '@/routes/v2/device/get_external_sell_source';
import imageUploadRoutes from '@/routes/v2/device/image_upload_routes';
import saveListingRoute from '@/routes/v2/device/save_listing_route';
import getBatteryTestRoutes2 from '@/routes/v2/diagnostics/battery_test_routes';
import diagnosticsConfigRoute2 from '@/routes/v2/diagnostics/diagnostics_config_routes';
import favoriteRoutes2 from '@/routes/v2/favorite/favorite_add';
import recommendedPrice from '@/routes/v2/global/recommended_price';


import bestDealHomeRoutes2 from '@/routes/v2/home/best_deal_home_routes';
import listingsByMakeRoutes2 from '@/routes/v2/home/listings_by_make';
import searchListingRoute2 from '@/routes/v2/home/search_listing_route';
import shopByCategoryRoutes2 from '@/routes/v2/home/shop_by_category_routes';
import shopByPriceRoutes2 from '@/routes/v2/home/shop_by_price_routes';
import topSellingModelsRoutes2 from '@/routes/v2/home/top_selling_models_routes';
import loginOtpRoutes2 from '@/routes/v2/login/login_otp_routes';
import loginUserRoutes2 from '@/routes/v2/login/login_user_routes';
import getQuestionRoute from '@/routes/v2/master/get_question_route';
import marketingNameByModelRoutes from '@/routes/v2/master/marketing_name_by_model_routes';
import notificationRoutes2 from '@/routes/v2/notification/notification_save_token_routes';
import predictimage from '@/routes/v2/predict_image';
import s3images from '@/routes/v2/s3images';
//v2-import routes
import testRoutes2 from '@/routes/v2/test_routes';
import app from '@/setup';

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.status(200).json({
		message: 'Backend Testing Server Running Successfully',
	});
});

app.use('/api/v1', testRoute);
app.use('/api/v1/master', brandRoute);
app.use('/api/v1/master', questionRoute);
app.use('/api/v1/master', searchFilterRoute);
app.use('/api/v1/master', marketingNameByModel);
app.use('/api/v1/device', saveModalRoute);
app.use('/api/v1/device', imageRoute);
app.use('/api/v1/device', bestDealCompletedRoute);
app.use('/api/v1/device', buyersVerficationRoutes);
app.use('/api/v1/device', externalSourcePriceRoutes);
app.use('/api/v1/global', citiesRoute);
app.use('/api/v1/global', agentRoute);
app.use('/api/v1/global', recommendedPriceRoute);
app.use('/api/v1/global', shareLinkRoute);
app.use('/api/v1/global', getInfoTemplateRoutes);
app.use('/api/v1/global', dashboard);
app.use("/api/v1/global", agentOlxDashboard);
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

//v2

app.use('/api', testRoutes2);
app.use('/api/v2/login', loginOtpRoutes2);
app.use('/api/v2/login', loginUserRoutes2);
app.use('/api/v2/notification', notificationRoutes2);
app.use('/api/v2/favorite', favoriteRoutes2);
app.use('/api/v2/home', bestDealHomeRoutes2);
app.use('/api/v2/home', listingsByMakeRoutes2);
app.use('/api/v2/home', searchListingRoute);
app.use('/api/v2/home', shopByCategoryRoutes2);
app.use('/api/v2/home', shopByPriceRoutes2);
app.use('/api/v2/home', topSellingModelsRoutes2);
app.use('/api/v2/device', getExternalSellSourceRoutes);
app.use('/api/v2/device', buyerVerificationRoutes);
app.use('/api/v2/device', imageUploadRoutes);
app.use('/api/v2/device', completeBestDealRoutes);
app.use('/api/v2/device', saveListingRoute);
app.use('/api/v2/global', recommendedPrice);
app.use('/api/v2/master', marketingNameByModelRoutes);
app.use('/api/v2/master', getQuestionRoute);
app.use('/api/v2/images', s3images);
app.use('/api/v2/api', diagnosticsConfigRoute2);
app.use('/api/v2/api', getBatteryTestRoutes2);
// app.use('/api/v2/images', predictimage);

app.use(router);
app.use(errorHandler);
app.listen(port, () => {
	console.log(`The app listening on port ${port}`);
});