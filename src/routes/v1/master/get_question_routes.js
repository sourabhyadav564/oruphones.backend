const express = require('express');
const router = express.Router();

require('@/database/connection');
const questionModal = require('@/database/modals/master/get_question');
const logEvent = require('@/middleware/event_logging');
const validUser = require('@/middleware/valid_user');

router.get('/getQuestions', validUser, logEvent, async (req, res) => {
	try {
		const dataObject = await questionModal.find().sort({ questionId: 1 });
		res.status(200).json({
			reason: 'Questions found',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

module.exports = router;
