function generateOTP() {
	// var digits = '0123456789';
	// let OTP = '';
	// for (let i = 0; i < 4; i++ ) {
	//     OTP += digits[Math.floor(Math.random() * 10)];
	// }
	// return OTP;
	let OTP = Math.floor(1000 + Math.random() * 9000);
	return OTP;
}

module.exports = generateOTP;
