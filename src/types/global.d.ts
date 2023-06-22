import { TUser } from '@/types/User';
import { SessionData } from 'express-session';


declare module 'express-session' {
	interface SessionData {
		User: Partial<TUser>;
	}
}