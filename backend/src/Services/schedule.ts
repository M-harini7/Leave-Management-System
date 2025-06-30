import cron from 'node-cron';
import { runCarryForwardAndAllocationJob } from './carryForwardServices';

export function startScheduledJobs() {
  // Run daily at midnight — internal logic decides what to run
  cron.schedule('0 0 * * *', async () => {
    await runCarryForwardAndAllocationJob();
  });

  console.log('🕒 Leave job scheduled to run daily at 12:00 AM.');
}
