import { Request, Response } from 'express';
import redisClient from '@/database/redis';

export default async function index(req: Request, res: Response) {
	try {
		// every ping, increment the ping count
		let pingCount = await redisClient.get('pingCount');
		console.log(pingCount);
		if (!pingCount) {
			pingCount = '0';
		}
		let newPingCount = parseInt(pingCount) + 1;
		await redisClient.set('pingCount', newPingCount.toString());
		res.status(200).json({
			message: 'Pong',
			pingCount: newPingCount,
		});
	} catch (err) {
		res.status(500).json({
			message: 'Internal Server Error',
		});
	}
}
