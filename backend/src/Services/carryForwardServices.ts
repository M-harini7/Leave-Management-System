import { AppDataSource } from '../data-sources';
import { LeaveType, AllocationFrequency } from '../Entities/LeaveType';
import { LeaveBalance } from '../Entities/LeaveBalance';
import { Employee } from '../Entities/Employee';
import { LeaveAllocationLog } from '../Entities/LeaveAllocationLog';

export async function runCarryForwardAndAllocationJob() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth(); // 0 = Jan
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  const currentYear = today.getFullYear();
  const previousYear = currentYear - 1;

  const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
  const employeeRepo = AppDataSource.getRepository(Employee);
  const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
  const logRepo = AppDataSource.getRepository(LeaveAllocationLog);

  const leaveTypes = await leaveTypeRepo.find();
  const employees = await employeeRepo.find();

  for (const leaveType of leaveTypes) {
    const isYearly = leaveType.allocationFrequency === AllocationFrequency.YEARLY;
    const isMonthly = leaveType.allocationFrequency === AllocationFrequency.MONTHLY;
    const isQuarterly = leaveType.allocationFrequency === AllocationFrequency.QUARTERLY;

    const isFirstDayOfYear = day === 1 && month === 0;
    const isFirstDayOfQuarter = day === 1 && [0, 3, 6, 9].includes(month);
    const isFirstDayOfMonth = day === 1;

    // === 1. CARRY FORWARD ===
    if (isYearly && leaveType.isCarryForwardAllowed && isFirstDayOfYear) {
      const previousBalances = await leaveBalanceRepo.find({
        where: { leaveType: { id: leaveType.id }, year: previousYear },
        relations: ['employee', 'leaveType'],
      });

      for (const prev of previousBalances) {
        const unused = prev.totalDays - prev.usedDays;
        if (unused <= 0) continue;

        // Skip if already carried forward today
        const logExists = await logRepo.findOne({
          where: {
            employee: { id: prev.employee.id },
            leaveType: { id: leaveType.id },
            frequency: 'CARRY_FORWARD',
            date: dateStr,
          },
        });
        if (logExists) continue;

        const carryAmount = Math.min(unused, leaveType.carryForwardLimit ?? unused);

        let currentBalance = await leaveBalanceRepo.findOne({
          where: {
            employee: { id: prev.employee.id },
            leaveType: { id: leaveType.id },
            year: currentYear,
          },
        });

        if (!currentBalance) {
          currentBalance = leaveBalanceRepo.create({
            employee: prev.employee,
            leaveType,
            year: currentYear,
            totalDays: carryAmount,
            usedDays: 0,
            remainingDays: carryAmount,
          });
        } else {
          currentBalance.totalDays += carryAmount;
          currentBalance.remainingDays += carryAmount;
        }

        await leaveBalanceRepo.save(currentBalance);

        // Save log
        await logRepo.save(logRepo.create({
          employee: prev.employee,
          leaveType,
          frequency: 'CARRY_FORWARD',
          date: dateStr,
        }));

        console.log(`Carried forward ${carryAmount} for ${prev.employee.id} (${leaveType.name})`);
      }
    }

    // === 2. ALLOCATE LEAVE (Yearly, Monthly, Quarterly) ===
    if (!leaveType.isAutoAllocatable || leaveType.defaultAnnualAllocation <= 0) continue;

    const shouldAllocate =
      (isYearly && isFirstDayOfYear) ||
      (isMonthly && isFirstDayOfMonth) ||
      (isQuarterly && isFirstDayOfQuarter);

    if (!shouldAllocate) continue;

    const allocationAmount =
      isMonthly
        ? leaveType.defaultAnnualAllocation / 12
        : isQuarterly
        ? leaveType.defaultAnnualAllocation / 4
        : leaveType.defaultAnnualAllocation;

    const frequency: 'YEARLY' | 'MONTHLY' | 'QUARTERLY' =
      isYearly ? 'YEARLY' : isMonthly ? 'MONTHLY' : 'QUARTERLY';

    for (const employee of employees) {
      const logExists = await logRepo.findOne({
        where: {
          employee: { id: employee.id },
          leaveType: { id: leaveType.id },
          frequency,
          date: dateStr,
        },
      });

      if (logExists) {
        console.log(` Already allocated ${leaveType.name} for employee ${employee.id} today`);
        continue;
      }

      let balance = await leaveBalanceRepo.findOne({
        where: {
          employee: { id: employee.id },
          leaveType: { id: leaveType.id },
          year: currentYear,
        },
      });

      if (!balance) {
        balance = leaveBalanceRepo.create({
          employee,
          leaveType,
          year: currentYear,
          totalDays: allocationAmount,
          usedDays: 0,
          remainingDays: allocationAmount,
        });
      } else {
        balance.totalDays += allocationAmount;
        balance.remainingDays += allocationAmount;
      }

      await leaveBalanceRepo.save(balance);

      await logRepo.save(logRepo.create({
        employee,
        leaveType,
        frequency,
        date: dateStr,
      }));

      console.log(` Allocated ${allocationAmount.toFixed(2)} ${leaveType.name} to employee ${employee.id}`);
    }
  }

  console.log(' Leave carry forward & allocation job complete.');
}
