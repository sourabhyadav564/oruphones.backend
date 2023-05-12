import { createClient } from 'redis';

const redisClient = createClient({
	url: process.env.REDIS_URL,
	socket: {
		reconnectStrategy(retries) {
			return Math.min(retries * 100, 3000);
		},
	},
});

redisClient
	.connect()
	.then(() => console.log('Redis Connected Successfully.'))
	.catch((err) => console.log('Redis Connection Failed: ', err));

redisClient.on('error', (err) => {
	console.log('Redis Error: ', err);
});

export default redisClient;
