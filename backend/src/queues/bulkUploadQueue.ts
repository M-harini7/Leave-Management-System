import { Queue } from 'bullmq';
import { connection } from '../redisConnection';

export const employeeQueue = new Queue('employee-upload-queue', { connection });


