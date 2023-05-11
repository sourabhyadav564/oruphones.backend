function generateRandomNumber() {
	var digits = '0123456789';
	let sessionId = '';
	for (let i = 0; i < 6; i++) {
		sessionId += digits[Math.floor(Math.random() * 10)];
	}
	return sessionId;
}

module.exports = generateRandomNumber;
