import Location from '@/database/modals/global/locations/location';
import { Request, Response } from 'express';
import { z } from 'zod';


const validator = z.object({
	searchText: z.string().min(0).max(50),
});

export default async function Search(req: Request, res: Response) {
	try {
		const { searchText } = validator.parse(req.body);
		// try word level matches
		let response = await Location.aggregate([
			{
				// using indexed
				$match: {
					$text: {
						$search: searchText,
					},
				},
			},
			{
				$limit: 5,
			},
		]);

		// if no word level matches found, try text level matches using regex
		if (response.length === 0) {
			const [cities, localities] = await Promise.all([
				Location.aggregate([
					{
						$match: {
							city: {
								$regex: `^${searchText}`,
								$options: 'i',
							},
						},
					},
					{
						$limit: 5,
					},
				]),
				Location.aggregate([
					{
						$match: {
							name: {
								$regex: `^${searchText}`,
								$options: 'i',
							},
						},
					},
					{
						$limit: 10,
					},
				]),
			]);
			response = [
				...cities.map((location) => ({
					type: 'City',
					location: `${location._id}, ${location.state}`,
					city: location._id,
					state: location.state,
					latitude: location.latitude,
					longitude: location.longitude,
				})),
				...localities.map((location) => ({
					type: 'Area',
					location: `${location.name}, ${location._id}`,
					locality: location.name,
					city: location._id,
					state: location.state,
					latitude: location.latitude,
					longitude: location.longitude,
				})),
			]
		}else{
			response = response.map((location) => ({
				type: location.type,
				location: `${location.name}, ${location.city}`,
				locality: location.name,
				city: location.city,
				state: location.state,
				latitude: location.latitude,
				longitude: location.longitude,
			}));
		}

		res.json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'An error occurred' });
	}
}