import { Request, Response } from 'express';
import Location from '@/database/modals/global/locations/location';
import { z } from 'zod';

const validator = z.object({
	searchText: z.string().min(0).max(50),
});

export default async function Search(req: Request, res: Response) {
	try {
		const { searchText } = validator.parse(req.body);

		const localities = await Location.aggregate([
			{
				$match: {
					name: { $regex: `^${searchText}`, $options: 'i' }, // Case-insensitive search for matching locality from the beginning
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
				$limit: 20,
			},
		]);

		const cities = await Location.aggregate([
			{
				$match: {
					city: { $regex: `^${searchText}`, $options: 'i' }, 
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
		]);

		const response = [
			{
				type: 'Country',
				location: 'India',
				city: 'India',
				state: '',
				latitude: 0,
				longitude: 0,
			  },
			...cities.map((location) => ({
				type: 'City',
				location: `${location._id}, ${location.state}`,
                city : location._id,
				state: location.state,
				latitude: location.latitude,
				longitude: location.longitude,
			})),
			...localities.map((location) => ({
				type: 'Area',
				location: `${location.name}, ${location._id}`,
                locality : location.name,
                city : location._id,
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