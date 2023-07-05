import AreaModal from '@/database/modals/global/locations/area';
import cityAreaModal from '@/database/modals/global/locations/city';
import stateAreaModal from '@/database/modals/global/locations/state';
import { Request, Response } from 'express';
import { z } from 'zod';

const validator = z.object({
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
});

export default async function getLocation(req: Request, res: Response) {
	try {
		const { latitude, longitude } = validator.parse(req.body);

		let dataObject = [];

		let unwant = {
			_id: 0,
			type: 0,
		};

		if (latitude && longitude) {
			let lat = latitude;
			let long = longitude;

			let areaData = await AreaModal.aggregate([
				{
					$project: {
						id: 1,
						name: 1,
						longitude: 1,
						latitude: 1,
						parentId: 1,
						distance: {
							$sqrt: {
								$add: [
									{
										$pow: [
											{
												$subtract: ['$latitude', lat],
											},
											2,
										],
									},
									{
										$pow: [
											{
												$subtract: ['$longitude', long],
											},
											2,
										],
									},
								],
							},
						},
					},
				},
				{
					$sort: {
						distance: 1,
					},
				},
				{
					$limit: 1,
				},
			]);

			if (areaData.length > 0) {
				let area = areaData[0];
				let cityData = await cityAreaModal.findOne(
					{ id: area.parentId },
					unwant
				);
				let stateData = await stateAreaModal.findOne(
					{ id: cityData.parentId },
					unwant
				);
				dataObject.push({
					id: stateData.id,
					name: stateData.name,
					type: 'state',
				});
				dataObject.push({
					id: cityData.id,
					name: cityData.name,
					type: 'city',
				});
				dataObject.push({
					id: area.id,
					name: area.name,
					type: 'area',
				});
			}
		}

		res.status(200).json({
			reason: dataObject.length > 0 ? 'Locations found' : 'Locations not found',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject,
		});
	} catch (error) {
		console.error(error);
		res.status(400).json(error);
	}
}
