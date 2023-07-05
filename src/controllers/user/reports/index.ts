import checkReport from './checkReport';
import gradeModal from '@/database/modals/others/report_grade';
import { Request, Response, NextFunction } from 'express';

export async function getReport(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const reports = await gradeModal.aggregate([
			{
				$match: {
					userUniqueId: req.session.user?.userUniqueId,
				},
			},
			{
				$project: {
					reportId: 1,
					src: 1,
					filePath: 1,
				},
			},
		]);
		if (!reports) throw new Error('No report found');
		res.status(200).json({
			message: 'Reports fetched successfully',
			data: reports,
		});
	} catch (error) {
		next(error);
	}
}

export default {
	getReport,
	checkReport,
};
