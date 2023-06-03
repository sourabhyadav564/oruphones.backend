import redisClient from '@/database/redis';
import { NextFunction, Request, Response } from 'express';

// WIP
export default async function (
	req: Request,
	res: Response,
	next: NextFunction
) {
	const { originalUrl, query, body, params } = req;
	const key = JSON.stringify({ originalUrl, query, body, params });
	const redisResponse = await redisClient.get(key);
	if (redisResponse !== null) {
		console.log('This response was powered by redis');
		res.status(200).json(JSON.parse(redisResponse));
		return;
	}
	next();
}