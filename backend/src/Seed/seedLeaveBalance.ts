import { AppDataSource } from '../data-sources';
import { Employee } from '../Entities/Employee';
import { LeaveType } from '../Entities/LeaveType';
import { LeaveBalance } from '../Entities/LeaveBalance';

const seedLeaveBalances = async () => {
  await AppDataSource.initialize();

  const empRepo = AppDataSource.getRepository(Employee);
  const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
  const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

  const employees = await empRepo.find();
  const leaveTypes = await leaveTypeRepo.find();

  for (const emp of employees) {
    for (const leaveType of leaveTypes) {
      // Check if balance already exists to avoid duplicates
      const existingBalance = await leaveBalanceRepo.findOne({
        where: {
          employee: { id: emp.id },
          leaveType: { id: leaveType.id },
        },
      });

      if (!existingBalance) {
        const balance = leaveBalanceRepo.create({
          employee: emp,
          leaveType: leaveType,
          totalDays: leaveType.totalDays,
          usedDays: 0,
        });
        await leaveBalanceRepo.save(balance);
      }
    }
  }

  console.log('✅ Leave balances seeded');
  process.exit(0);
};

seedLeaveBalances().catch((err) => {
  console.error(err);
  process.exit(1);
});

