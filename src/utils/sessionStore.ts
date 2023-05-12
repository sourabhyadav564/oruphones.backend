import session from 'express-session';
import dotenv from 'dotenv';
import RedisStore from 'connect-redis';
import redisClient from '@/database/redis';
dotenv.config();

const secretKey = process.env.SESSION_SECRET || 'secret';

export default session({
	store: new RedisStore({ client: redisClient }),
	saveUninitialized: false,
	secret: secretKey,
	resave: false,
	proxy: true,
	name: 'ORUauth',
	rolling: true,
	cookie: {
		// sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
		// sameSite: 'none',
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 1000 * 60 * 60 * 8, // 8 hours
		httpOnly: true,
	},
});
