const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

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

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend Server Running Successfully",
  });
});

app.use("/api/v1", testRoute);
app.use("/api/v1/master", brandRoute);
app.use("/api/v1/master", makeModalRoute);
app.use("/api/v1/master", questionRoute);
app.use("/api/v1/device", saveModalRoute);
app.use("/api/v1/device", imageRoute);
app.use("/api/v1/device", bestDealCompletedRoute);
app.use("/api/v1/global", citiesRoute);
app.use("/api/v1/home", bestDealHomeRoute);
app.use("/api/v1/api/auth", eventRoute);
app.use("/api/v1/login", loginOtpRoute)

app.listen(port, () => {
  console.log(`The app listening on port ${port}`);
});
