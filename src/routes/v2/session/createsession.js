const express = require('express');
const router = express.Router();

router.get('/session', (req, res) => {
	if (!req.session.isLoggedIn) {
		req.session.isLoggedIn = false;
	}
	const sessionId = req.sessionID;

	res.send('Session created with ID: ' + sessionId);
});

router.get('/getsession', (req, res) => {
    console.log(req.session)
	res.send('Session details ' + req.session);
});

module.exports = router;