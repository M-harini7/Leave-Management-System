import { AppDataSource } from '../data-sources';
import { LeaveType } from '../Entities/LeaveType';
import { LeaveBalance } from '../Entities/LeaveBalance';

export const carryForwardUnusedLeave = async () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
  const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

  const carryForwardLeaveTypes = await leaveTypeRepo.find({
    where: { carryForward: true },
  });

  for (const leaveType of carryForwardLeaveTypes) {
    const balances = await leaveBalanceRepo.find({
      where: { leaveType: { id: leaveType.id }, year: currentYear },
      relations: ['employee', 'leaveType'],
    });

    for (const balance of balances) {
      const unused = balance.totalDays - balance.usedDays;
      if (unused <= 0) continue;

      let nextBalance = await leaveBalanceRepo.findOne({
        where: {
          employee: { id: balance.employee.id },
          leaveType: { id: leaveType.id },
          year: nextYear,
        },
        relations: ['employee', 'leaveType'],
      });

      if (!nextBalance) {
        nextBalance = leaveBalanceRepo.create({
            employee: { id: balance.employee.id },     // safer than passing full object
            leaveType: { id: leaveType.id },
            year: nextYear,
            totalDays: unused,                         // ✅ match your entity field
            usedDays: 0,
            remainingDays: unused                      // ✅ update if you want to start fresh
          });
      } else {
        nextBalance.totalDays += unused;
      }

      await leaveBalanceRepo.save(nextBalance);
    }
  }

  console.log(`✅ Carry forward process completed for ${currentYear} → ${nextYear}`);
};
