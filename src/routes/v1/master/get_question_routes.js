const express = require('express');
const router = express.Router();

require('@/database/connection');
const questionModal = require('@/database/modals/master/get_question');
const logEvent = require('@/middleware/event_logging');
const validUser = require('@/middleware/valid_user');

const newQuestions = [
	{
		title: 'Is your phone working?',
		options: {
			'Yes, Working': [
				'Powers ON',
				'All features are working 100%',
				'Battery Health is atleast 80%',
				'Display does not have touch problems or dead pixels',
				'Screen/Back is NOT cracked',
			],
			No: [
				'Device has some of its components missing (ex. missing sim tray,keys etc.)',
				'Device does not power on',
				'Battery health less than 80%',
				'Display is faulty',
				'Screen and/or back have cracks.',
			],
		},
	},
	{
		title: 'Condition of Screen/Display',
		options: {
			'No scratch, No crack, and No dents on the screen/display': [
				'No scratches on the screen/display',
				'No cracks on the screen/display',
				'No dents on the screen/display',
				'Display in perfect condition (without any discoloration, dead pixels, touch problems or flickering lines)',
			],
			'Up to 2 minor scratches on the screen/display': [
				'Has maximum 2 minor scratches/marks with each scratch less than 5 mm (size of a rice grain)',
				'No cracks and no dents on the screen',
				'Has Zero deep scratches (scratch cannot be felt with your nail)',
				'Display in perfect condition (without any discoloration, dead pixels, flickering lines, or touch problems)',
			],
			'Up to 5 minor scratches on the screen/display': [
				'Has maximum 5 minor scratches/marks with each scratch less than 5 mm (size of a rice grain)',
				'No cracks/dents on the screen',
				'Has Zero deep scratches (scratch cannot be felt with your nail)',
				'Display in good condition (may have light discoloration, but no dead pixels, flickering lines or touch problems)',
			],
			'Has significant scratches & marks on the screen/display which are clearly visible':
				[
					'Heavy signs of usage. Screen has large scratches and deep scratches',
					'Display in good condition (may have light discoloration, but no dead pixels, flickering lines or touch problems)',
					'No cracks on the screen/display',
				],
		},
	},
	{
		title: 'Condition of the phone’s body (back and sides)',
		options: {
			'No scratch, No crack, and No dents on the back and sides of the phone': [
				'No scratches, no cracks, and no dents on the phone body',
				'No sign of discoloration',
				'No signs of wear and tear',
			],
			'Up to 2 minor scratches/marks on the back and sides of the phone': [
				'Has maximum 2 minor scratches/marks or dots with each scratch less than 5 mm (size of a rice grain)',
				'No cracks and no dents',
				'Has Zero deep scratches (scratch cannot be felt with your nail)',
				'No sign of any discoloration',
				'No signs of wear and tear',
			],
			'Up to 5 minor scratches/marks on the back and sides of the phone': [
				'Has maximum 5 minor scratches/marks with each scratch less than 5 mm (size of a rice grain)',
				'Up to 2 Dents on the sides of the phone',
				'Up to 2 deep scratches (scratch cannot be felt with your nail)',
				'Minor sign of discoloration',
				'Minor signs of wear and tear',
			],
			'Has significant scratches, marks and dents on the back and sides of the phone':
				[
					'Heavy signs of usage. Body has large scratches and deep scratches',
					'Body may have more than 2 dents',
					'Signs of discoloration and wear & tear',
					'No cracks',
				],
		},
	},
];

router.get('/getQuestions', validUser, logEvent, async (req, res) => {
	try {
		// const dataObject = await questionModal.find().sort({ questionId: 1 });
		res.status(200).json({
			reason: 'Questions found',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject: newQuestions,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.get('/getCondition', validUser, logEvent, async (req, res) => {
	try {
		let ans1 = req.query.ans1;
		let ans2 = req.query.ans2;
		let ans3 = req.query.ans3;
		let devAge = req.query.deviceAge;

		let condition = 'Good';

		if (ans1 === 'No') {
			condition = 'Needs Repair';
		} else {
			let ans2Condition = '';
			let ans3Condition = '';
			if (ans2.toString().includes('Has significant scratches')) {
				ans2Condition = 'Fair';
			} else if (ans2.toString().includes('Up to 5 minor')) {
				ans2Condition = 'Good';
			} else if (ans2.toString().includes('Up to 2 minor')) {
				ans2Condition = 'Excellent';
			} else if (ans2.toString().includes('No scratch, No crack,')) {
				ans2Condition = 'Like New';
			}

			if (ans3.toString().includes('Has significant scratches')) {
				ans3Condition = 'Fair';
			} else if (ans3.toString().includes('Up to 5 minor scratches/marks')) {
				ans3Condition = 'Good';
			} else if (ans3.toString().includes('Up to 2 minor scratches/marks')) {
				ans3Condition = 'Excellent';
			} else if (ans3.toString().includes('No scratch, No crack,')) {
				ans3Condition = 'Like New';
			}

			let conditions = [
				'Like New',
				'Excellent',
				'Good',
				'Fair',
				'Needs Repair',
			];

			let ans2Index = conditions.indexOf(ans2Condition);
			let ans3Index = conditions.indexOf(ans3Condition);

			let index = Math.max(ans2Index, ans3Index);

			condition = conditions[index];
		}

		if (condition == 'Like New') {
			switch (devAge) {
				case 'four':
					condition = 'Excellent';
					break;
				case 'seven':
					condition = 'Excellent';
					break;
				case 'more':
					condition = 'Good';
					break;
				default:
					condition = condition;
					break;
			}
		} else if (condition == 'Excellent') {
			switch (devAge) {
				case 'more':
					condition = 'Good';
					break;
				default:
					condition = condition;
					break;
			}
		}

		res.status(200).json({
			reason: 'Condition found',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject: {
				condition: condition,
			},
		});
		return;
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
		return;
	}
});

module.exports = router;
