import redisClient from '@/database/redis';
import RedisStore from 'connect-redis';
import dotenv from 'dotenv';
import session from 'express-session';

dotenv.config();

const secretKey = process.env.SESSION_SECRET || 'secret';

export default session({
	store: new RedisStore({ client: redisClient, prefix: 'sess-' }),
	resave: false,
	saveUninitialized: true,
	secret: secretKey,
	proxy: true,
	name: 'session',
	rolling: true,
	cookie: {
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
		// sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		// secure: false,
		maxAge: 1000 * 60 * 60 * 12, // 12 hours
		httpOnly: true,
	},
});
