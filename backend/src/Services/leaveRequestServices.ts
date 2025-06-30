import { AppDataSource } from '../data-sources';
import { LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { LeaveRequest, LeaveRequestStatus } from '../Entities/LeaveRequest';
import { LeaveApproval } from '../Entities/LeaveApproval';
import { Employee } from '../Entities/Employee';
import { Role } from '../Entities/Role';
import { LeaveType } from '../Entities/LeaveType';
import { LeaveBalance } from '../Entities/LeaveBalance';

export const createLeaveRequestWithApprovals = async (
  employeeId: number,
  leaveTypeId: number,
  startDate: Date,
  endDate: Date,
  reason: string,
  lastDayHalf: boolean = false
) => {
  const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
  const leaveApprovalRepo = AppDataSource.getRepository(LeaveApproval);
  const employeeRepo = AppDataSource.getRepository(Employee);
  const roleRepo = AppDataSource.getRepository(Role);
  const leaveTypeRepo = AppDataSource.getRepository(LeaveType);


  const employee = await employeeRepo.findOne({
    where: { id: employeeId },
    relations: ['team', 'role'],
  });
  if (!employee) throw new Error('Employee not found');

  const leaveType = await leaveTypeRepo.findOneBy({ id: leaveTypeId });
  if (!leaveType) throw new Error('Leave type not found');

  const countWorkingDays = (start: Date, end: Date) => {
    let count = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    end = new Date(end);
    end.setHours(0, 0, 0, 0);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leaveStart = new Date(startDate);
  leaveStart.setHours(0, 0, 0, 0);

  if (leaveStart < today) {
    const workingDaysGap = countWorkingDays(leaveStart, today) - 1;
    if (workingDaysGap > 5) {
      throw new Error('Leave request cannot be submitted for dates more than 5 working days in the past.');
    }
  }

  // Always normalize start and end dates to midnight to avoid time component issues
const start = new Date(startDate);
const end = new Date(endDate);
start.setHours(0, 0, 0, 0);
end.setHours(0, 0, 0, 0);

// Count working days between start and end
let totalDays = countWorkingDays(start, end);

if (start.getTime() === end.getTime()) {
  // Single-day leave
  totalDays = lastDayHalf ? 0.5 : 1;
} else if (lastDayHalf) {
  // For multi-day leave, subtract 0.5 only if end date is a weekday
  const endDay = end.getDay();
  if (endDay !== 0 && endDay !== 6) {
    totalDays -= 0.5;
  } else {
    console.log('End date is a weekend; skipping half-day adjustment.');
  }
}

  if (totalDays <= 0) {
    throw new Error('Total leave days must be greater than zero.');
  }

  // Check overlapping leaves
  const overlapping = await leaveRequestRepo.findOne({
    where: {
      employee: { id: employee.id },
      startDate: LessThanOrEqual(endDate),
      endDate: MoreThanOrEqual(startDate),
      status: In(['approved', 'pending']),
    },
  });
  if (overlapping) throw new Error('You already have a leave request during this period.');
  const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
  const balance = await leaveBalanceRepo.findOne({
    where: {
      employee: { id: employee.id },
      leaveType: { id: leaveType.id },
    },
  });
  if (!balance) {
    throw new Error('Leave balance not found');
  }
  
  //  Check if enough balance
  if (balance.remainingDays < totalDays) {
    throw new Error(`Insufficient leave balance. Remaining: ${balance.remainingDays}, Requested: ${totalDays}`);
  }
  // Create LeaveRequest
  const leaveRequest = leaveRequestRepo.create({
    employee: { id: employeeId },
    leaveType,
    startDate,
    endDate,
    reason,
    totalDays,
    status: leaveType.autoApprove ? LeaveRequestStatus.approved : LeaveRequestStatus.pending,
  });

  const savedLeaveRequest = await leaveRequestRepo.save(leaveRequest);

  if (leaveType.autoApprove) {
    const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
    const balance = await leaveBalanceRepo.findOne({
      where: {
        employee: { id: employee.id },
        leaveType: { id: leaveType.id },
      },
    });
    if (!balance) throw new Error('Leave balance not found');

    if (balance.remainingDays < totalDays) {
      throw new Error('Insufficient leave balance for auto-approval');
    }

    balance.usedDays += totalDays;
    balance.remainingDays = balance.totalDays - balance.usedDays;
    await leaveBalanceRepo.save(balance);

    const systemRole = await roleRepo.findOneBy({ name: 'System Auto Approval' });
    const autoApproval = leaveApprovalRepo.create({
      leaveRequest: savedLeaveRequest,
      level: 1,
      role: systemRole ?? undefined,
      status: LeaveRequestStatus.approved,
      remarks: 'Auto-approved by system',
    });
    await leaveApprovalRepo.save(autoApproval);

    return savedLeaveRequest;
  }

  // Manual approval flow
  const approvalFlowByRole: Record<string, string[]> = {
    Developer: ['Team Lead', 'Manager', 'HR'],
    'Team Lead': ['Manager', 'HR'],
    Manager: ['HR'],
    HR: ['HR'],
  };

  const requesterRoleName = employee.role.name;
  const leaveTypeMaxLevels = leaveType.approvalLevels || 0;
  const approvalRoles = approvalFlowByRole[requesterRoleName] || [];
  const levelsToInsert = Math.min(leaveTypeMaxLevels, approvalRoles.length);

  for (let level = 1; level <= levelsToInsert; level++) {
    const roleName = approvalRoles[level - 1];
    const role = await roleRepo.findOneBy({ name: roleName });
    if (!role) continue;

    const approver = await employeeRepo.findOne({
      where: {
        role: { id: role.id },
        team: { id: employee.team.id },
      },
      relations: ['role', 'team'],
    });

    const approval = leaveApprovalRepo.create({
      leaveRequest: savedLeaveRequest,
      level,
      role,
      status: LeaveRequestStatus.pending,
      approver: approver ?? undefined,
    });

    await leaveApprovalRepo.save(approval);
  }

  return savedLeaveRequest;
};

export const getAllLeaveRequests = async () => {
  const leaveRepo = AppDataSource.getRepository(LeaveRequest);
  return await leaveRepo.find({
    relations: ['employee', 'leaveType'],
    order: { startDate: 'DESC' },
  });
};
export const getDashboardData = async (employeeId: number) => {
  const leaveRepo = AppDataSource.getRepository(LeaveRequest);
  const balanceRepo = AppDataSource.getRepository(LeaveBalance);

  const history = await leaveRepo.find({
    where: { employee: { id: employeeId } },
    relations: ['leaveType'],
    order: { startDate: 'DESC' },
  });

  const balances = await balanceRepo.find({
    where: { employee: { id: employeeId } },
    relations: ['leaveType'],
  });

  return { history, balances };
};