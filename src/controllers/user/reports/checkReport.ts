import gradeModal from '@/database/modals/others/report_grade';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const validator = z.object({
	reportId: z.string().nonempty(),
});

export default async function getReport(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { reportId } = validator.parse(req.body);
		const reports = await gradeModal.aggregate([
			{
				$match: {
					userUniqueId: req.session.user?.userUniqueId,
					reportId,
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
