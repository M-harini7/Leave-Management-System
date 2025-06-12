import { Request, ResponseToolkit } from '@hapi/hapi';
import * as xlsx from 'xlsx';
import { employeeQueue } from '../queues/bulkUploadQueue';
import { QueueEvents } from 'bullmq';
import { connection } from '../redisConnection';

const CHUNK_SIZE = 500;

export const uploadEmployees = async (request: Request, h: ResponseToolkit) => {
  const payload: any = request.payload;
  const file = payload?.file || payload?.payload?.file;

  if (!file || !(file instanceof Buffer)) {
    return h.response({ error: 'Invalid file or format' }).code(400);
  }

  try {
    const workbook = xlsx.read(file);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    let allWarnings: string[] = [];
    let totalInserted = 0;

    const queueEvents = new QueueEvents('employee-upload-queue', { connection });

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      const job = await employeeQueue.add('upload-batch', { rows: chunk });
      const result = await job.waitUntilFinished(queueEvents);

      if (result?.warnings?.length) {
        allWarnings = allWarnings.concat(result.warnings);
      }
      if (result?.inserted) {
        totalInserted += result.inserted;
      }
    }

    return h.response({
      message: `Upload complete. ${totalInserted} employees inserted.`,
      warnings: allWarnings,
    }).code(200);
  } catch (err) {
    console.error('Upload failed:', err);
    return h.response({ error: 'Failed to process Excel' }).code(500);
  }
};
