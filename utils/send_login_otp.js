var unirest = require("unirest");
const dotenv = require("dotenv");
dotenv.config();

const sendLoginOtp = (mobileNumber, clientOTP) => {
    var req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");
    
    req.headers({
      "authorization": process.env.SMS_API_SECRET,
    });
    
    req.form({
      "variables_values": clientOTP,
      "route": "otp",
      "numbers": mobileNumber.toString(),
    });
    
    req.end(function (res) {
      if (res.error) throw new Error(res.error);
      console.log(res.body);
    });
}

module.exports = sendLoginOtp;
