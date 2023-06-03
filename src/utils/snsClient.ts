import { SNSClient } from '@aws-sdk/client-sns';
import dotenv from 'dotenv';
dotenv.config();
// Set the AWS Region.
const REGION = process.env.AWS_SNS_REGION;
// Create SNS service object.
const snsClient = new SNSClient({ region: REGION });
export { snsClient };
