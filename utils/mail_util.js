const nodemailer = require("nodemailer");
const config = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mobiruindia22@gmail.com",
    pass: "rtrmntzuzwzisajb",
  },
});

const prodMails =
  "nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp, piyush@zenro.co.jp, anish@zenro.co.jp, sg9439117@gmail.com";
const devMails = "nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp";

const sendMailUtil = async (sub, mailBody) => {
  let mailOptions2 = {
    from: "mobiruindia22@gmail.com",
    to:
      process.env.SERVER_URL === "https://oruphones.com" ? prodMails : devMails,
    subject: sub,
    html: mailBody,
  };

  config.sendMail(mailOptions2, function (error, info) {
    if (error) {
      //   console.log(error);
    } else {
      // console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  sendMailUtil,
};
