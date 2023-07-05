import Location from '@/database/modals/global/locations/location';
import { Request, Response } from 'express';

export default async function TopSearch(req: Request, res: Response) {
	try {
		const topLocations = await Location.aggregate([
			{
				$match: {
					displayWithImage: '1',
				},
			},
			{
				$limit: 12,
			},
		]);

		const formattedLocations = topLocations.map((location) => ({
			type: 'City',
			location: `${location.name}, ${location.state}`,
			city: location.name,
			state: location.state,
			latitude: location.latitude,
			longitude: location.longitude,
			imgPath: location.imgpath,
		}));

		res.json(formattedLocations);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'An error occurred' });
	}
}
