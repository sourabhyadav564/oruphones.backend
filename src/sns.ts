import { SNSClient } from '@aws-sdk/client-sns';

export default new SNSClient({
	region: process.env.AWS_SNS_REGION,
	apiVersion: 'v2',
});
