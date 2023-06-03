const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

require('@/database/connection');

const { generateAccessToken } = require('@/middleware/auth_token');
const eventModal = require('@/database/modals/others/event_logs');

router.get('/token', async (req, res) => {
	try {
		const refreshToken = req.body.token;
		if (refreshToken == null) return res.sendStatus(401);

		const getRefreshToken = eventModal.findOne({ refreshToken: refreshToken });
		if (!getRefreshToken) return res.sendStatus(403);
		jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
			if (err) return res.sendStatus(403);
			const accessToken = generateAccessToken({
				sessionId: user.sessionId,
			});
			res.status(200).json({
				reason: 'Access Token created successfully',
				statusCode: 200,
				status: 'SUCCESS',
				accessToken,
			});
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

module.exports = router;
