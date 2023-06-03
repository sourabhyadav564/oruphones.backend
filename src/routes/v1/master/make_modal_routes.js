// const express = require('express');
// const router = express.Router();

// require('@/database/connection');
// const brandModal = require('@/database/modals/master/make_modal_list');
// const logEvent = require('@/middleware/event_logging');

// router.get('/eleminate', async (req, res) => {
// 	try {
// 		const dataObject = await brandModal.find();
// 		res.status(200).json({
// 			reason: 'Modals found',
// 			statusCode: 200,
// 			status: 'SUCCESS',
// 			dataObject,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		res.status(400).json(error);
// 	}
// });

// module.exports = router;
