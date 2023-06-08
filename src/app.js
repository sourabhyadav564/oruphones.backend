const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const startSavingBestDeals = require('./utils/best_deals_helper_routes')
const startCalculatingLSPTest = require('./utils/new_lsp')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const session = require("express-session");


const redis2 = require("../config/redis");

const RedisStore = require("connect-redis").default;
const redisStore = new RedisStore({ client: redis2 });

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
}

const app = express()
const port = process.env.PORT || 6000

main().catch((err) => console.log(err))

async function main() {
  try {
    await mongoose.connect(process.env.MONGO, { useNewUrlParser: true })
    console.log('Connected to MongoDB Successfully')
  } catch (error) {
    console.log(error)
  }
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors(corsOptions))

let schedule = require('node-schedule')

// schedule.scheduleJob('00 02 * * *', function () {
//   console.log('The answer to life, the universe, and everything!')
//   startCalculatingLSPTest()
// })

// schedule.scheduleJob('00 03 * * *', function () {
//   console.log('The answer to life, the universe, and everything!')
//   startSavingBestDeals()
// })

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend Testing Server Running Successfully',
  })
})

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: redisStore, // Use RedisStore for session storage
    rolling: true, // update cookie on every request
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // Session expiration time (in milliseconds)
    },
    genid: () => {
      // Generate a unique session ID for each user
      return `user-${Math.random().toString(36).substring(7)}`;
    },
  })
);


app.use('/api', require('./routes/v2/test_routes'))
app.use('/api/v2/login', require('./routes/v2/login/login_otp_routes'))
app.use('/api/v2/login', require('./routes/v2/login/login_user_routes'))
app.use('/api/v2/notification', require('./routes/v2/notification/notification_save_token_routes'));
app.use('/api/v2/favorite', require('./routes/v2/favorite/favorite_add'));
app.use('/api/v2/home', require('./routes/v2/home/best_deal_home_routes'));
app.use('/api/v2/home', require('./routes/v2/home/listings_by_make'));
app.use('/api/v2/home', require('./routes/v2/home/search_listing_route'));
app.use('/api/v2/home', require('./routes/v2/home/shop_by_category_routes'));
app.use('/api/v2/home', require('./routes/v2/home/shop_by_price_routes'));
app.use('/api/v2/home', require('./routes/v2/home/top_selling_models_routes'));
app.use('/api/v2/device', require('./routes/v2/device/get_external_sell_source'));
app.use('/api/v2/device', require('./routes/v2/device/buyer_verification_routes'));
app.use('/api/v2/device', require('./routes/v2/device/image_upload_routes'));
app.use('/api/v1/device', require('./routes/v1/device/image_upload_routes'));
app.use('/api/v2/device', require('./routes/v2/device/complete_best_deal_routes'));
app.use('/api/v2/device', require('./routes/v2/device/save_listing_route'));
app.use('/api/v2/global', require('./routes/v2/global/recommended_price'));
app.use('/api/v2/master', require('./routes/v2/master/marketing_name_by_model_routes'));
app.use('/api/v2/master', require('./routes/v2/master/get_question_route'));


app.listen(6000, () => {
  console.log(`The app listening on port 6000`)
})