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

const userRoute = require("../routes/test_routes");
const brandRoute = require("../routes/brand_routes");

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend Server Running Successfully",
  });
});

app.use("/api/v1", userRoute);
app.use("/api/v1", brandRoute);

app.listen(port, () => {
  console.log(`The app listening on port ${port}`);
});
