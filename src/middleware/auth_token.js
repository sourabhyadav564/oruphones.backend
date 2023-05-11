const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '30s',
	});
}

exports.generateAccessToken = generateAccessToken;

function generateRefreshToken(user) {
	return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: '7d',
	});
}

exports.generateRefreshToken = generateRefreshToken;

function authenticateAccessToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		// if (err) return res.sendStatus(403);
		if (err)
			return res.status(200).json({
				status: 'FAILURE',
				reason: 'Invalid access token',
				statusCode: 200,
			});
		req.srcFrom = user;
		next();
	});
}

exports.authenticateAccessToken = authenticateAccessToken;
