const nodemailer = require('nodemailer');
const { mailIds } = require('./matrix_figures');
const config = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'mobiruindia22@gmail.com',
		pass: 'rtrmntzuzwzisajb',
	},
});

const sendMailUtil = async (sub, mailBody) => {
	let mailOptions2 = {
		from: 'mobiruindia22@gmail.com',
		to:
			process.env.SERVER_URL === 'https://oruphones.com'
				? mailIds.prod
				: mailIds.dev,
		subject: sub,
		html: mailBody,
	};

	config.sendMail(mailOptions2, function (error, info) {
		// if (error) {
		//   //   console.log(error);
		// } else {
		//   // console.log("Email sent: " + info.response);
		// }
	});
};

module.exports = {
	sendMailUtil,
};