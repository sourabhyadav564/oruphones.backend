import Location from '@/database/modals/global/locations/location';
import { Request, Response } from 'express';
import { z } from 'zod';


const validator = z.object({
	searchText: z.string().min(0).max(50),
});

export default async function Search(req: Request, res: Response) {
	try {
		console.log(req.body);
		const { searchText } = validator.parse(req.body);
		const [cities, localities] = await Promise.all([
			Location.aggregate([
				{
					// using indexed
					$match: {
						$text: {
							$search: searchText,
							$caseSensitive: false,
							$diacriticSensitive: false,
							$language: 'en',
						},
					},
				},
				{
					$group: {
						_id: '$city',
						state: { $first: '$state' },
						latitude: { $first: '$latitude' },
						longitude: { $first: '$longitude' },
					},
				},
				{
					$limit: 5,
				},
			]),
			Location.aggregate([
				{
					$match: {
						$text: {
							$search: searchText,
							$caseSensitive: false,
							$diacriticSensitive: false,
							$language: 'en',
						},
					},
				},
				{
					$group: {
						_id: '$city',
						name: { $first: '$name' },
						state: { $first: '$state' },
						latitude: { $first: '$latitude' },
						longitude: { $first: '$longitude' },
					},
				},
				{
					$limit: 10,
				},
			]),
		]);

		const response = [
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
		];

		res.json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'An error occurred' });
	}
}