const mongoose = require('mongoose');

const reportGradeSchema = new mongoose.Schema(
	{
		filePath: {
			type: String,
			required: true,
		},
		fileKey: {
			type: String,
			required: true,
		},
		src: {
			type: String,
		},
		reportId: {
			type: String,
			required: true,
		},
		userUniqueId: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const gradeModal = new mongoose.model('report_grades', reportGradeSchema);

module.exports = gradeModal;
