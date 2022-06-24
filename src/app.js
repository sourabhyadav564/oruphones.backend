const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const start_migration = require("../utils/calculate_LSP");
const start_migrating_external_source_buy = require("../utils/get_external_source_data");
const allCron = require("../utils/filter_cron_job_data")

const corsOptions = {
  // origin: "https://userregisrationfrontend.herokuapp.com",
  // origin: "http://localhost:3000",
  // credentials: true,
};

const app = express();
const port = process.env.PORT || 5000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors(corsOptions));

let schedule = require('node-schedule');

schedule.scheduleJob('07 20 * * * ', function(){
  console.log('The answer to life, the universe, and everything!');
  // start_migration();
  // start_migrating_external_source_buy();
  allCron();
});

const testRoute = require("../routes/others/test_routes");
const brandRoute = require("../routes/master/master_brand_routes");
const makeModalRoute = require("../routes/master/make_modal_routes");
const saveModalRoute = require("../routes/device/save_listing_routes");
const eventRoute = require("../routes/others/event_routes");
const imageRoute = require("../routes/device/image_upload_routes");
const questionRoute = require("../routes/master/get_question_routes");
const citiesRoute = require("../routes/global/cities_route");
const bestDealHomeRoute = require("../routes/home/best_deal_home_routes");
const bestDealCompletedRoute = require("../routes/device/complete_best_deal_routes");
const loginOtpRoute = require("../routes/login/login_otp_routes");
const createUserRoute = require("../routes/login/login_user_routes");
const saveNotificationTokenRoute = require("../routes/notification/notification_save_token_routes");
const diagnosticsConfigRoute = require("../routes/diagnostics/diagnostics_config_routes");
const searchFilterRoute = require("../routes/master/show_search_filters_routes");
const favoriteRoute = require("../routes/favorite/favorite_add");
const marketingNameByModel = require("../routes/master/marketing_name_by_model_routes");
const listingByMakeRoute = require("../routes/home/listings_by_make_routes");
const recommendedPriceRoute = require("../routes/others/recommended_price");
const topSellingModelRoute = require("../routes/home/top_selling_models_routes");
const buyersVerficationRoutes = require("../routes/device/buyers_verification_routes");
const externalSourcePriceRoutes = require("../routes/device/get_external_source_data_routes");
const searchSuggestionRoute = require("../routes/global/search_filter_routes");
const logEventInfoRoute = require("../routes/global/log_event_info_routes");
const searchListingRoute = require("../routes/home/search_listing_routes");
const shareLinkRoute = require("../routes/global/share_link_route");
const shopByCategoryRoutes = require("../routes/home/shop_by_category_routes");
const shopByPriceRoute = require("../routes/home/shop_by_price_routes");
const getInfoTemplateRoutes = require("../routes/global/get_info_template_routes");
const getMIPLoginRoutes = require("../routes/mip/mip_login_routes");
const getMIPImageVerificationRoutes = require("../routes/mip/mip_image_verification_route");
const getBatteryTestRoutes = require("../routes/diagnostics/battery_test_routes");

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend Server Running Successfully",
  });
});

app.use("/api/v1", testRoute);
app.use("/api/v1/master", brandRoute);
app.use("/api/v1/master", makeModalRoute);
app.use("/api/v1/master", questionRoute);
app.use("/api/v1/master", searchFilterRoute);
app.use("/api/v1/master", marketingNameByModel);
app.use("/api/v1/device", saveModalRoute);
app.use("/api/v1/device", imageRoute);
app.use("/api/v1/device", bestDealCompletedRoute);
app.use("/api/v1/device", buyersVerficationRoutes);
app.use("/api/v1/device", externalSourcePriceRoutes);
app.use("/api/v1/global", citiesRoute);
app.use("/api/v1/global", recommendedPriceRoute);
app.use("/api/v1/global", shareLinkRoute);
app.use("/api/v1/global", getInfoTemplateRoutes);
app.use("/api/v1/home", bestDealHomeRoute);
app.use("/api/v1/home", listingByMakeRoute);
app.use("/api/v1/home", topSellingModelRoute);
app.use("/api/v1/home", searchListingRoute);
app.use("/api/v1/home", shopByCategoryRoutes);
app.use("/api/v1/home", shopByPriceRoute);
app.use("/api/v1/api/auth", eventRoute);
app.use("/api/v1/api", diagnosticsConfigRoute);
app.use("/api/v1/api", getBatteryTestRoutes);
app.use("/api/v1/mip", getMIPImageVerificationRoutes);
app.use("/api/v1/login", loginOtpRoute);
app.use("/api/v1/login", createUserRoute);
app.use("/api/v1/notification", saveNotificationTokenRoute);
app.use("/api/v1/favorite", favoriteRoute);
app.use("/api/v1/cscglobal", searchSuggestionRoute);
app.use("/api/v1/cscglobal", logEventInfoRoute);
app.use("/api/v1/user", getMIPLoginRoutes);

app.listen(port, () => {
  console.log(`The app listening on port ${port}`);
});
