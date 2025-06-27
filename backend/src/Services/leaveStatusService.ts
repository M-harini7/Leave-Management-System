import { AppDataSource } from '../data-sources';
import { LeaveApproval } from '../Entities/LeaveApproval';
import { LeaveRequest } from '../Entities/LeaveRequest';
import { LeaveRequestStatus } from '../Entities/LeaveRequest';
import { LeaveBalance } from '../Entities/LeaveBalance';
import { Role } from '../Entities/Role';
import { Employee } from '../Entities/Employee';

export async function handleLeaveApprovalAction(
  leaveApprovalId: number,
  action: 'approve' | 'reject',
  remarks?: string
) {
  const leaveApprovalRepo = AppDataSource.getRepository(LeaveApproval);
  const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
  const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

  const leaveApproval = await leaveApprovalRepo.findOne({
    where: { id: leaveApprovalId },
    relations: [
      'leaveRequest.employee.team',
      'leaveRequest.employee.role',
      'leaveRequest',
      'leaveRequest.employee',
      'leaveRequest.leaveType',
    ],
  });

  if (!leaveApproval) throw new Error('Leave approval record not found');
  if (leaveApproval.status !== 'pending') throw new Error('This leave approval is already processed');

  const leaveRequest = leaveApproval.leaveRequest;

  if (action === 'approve') {
    const leaveBalance = await leaveBalanceRepo.findOne({
      where: {
        employee: { id: leaveRequest.employee.id },
        leaveType: { id: leaveRequest.leaveType.id },
      },
    });

    if (!leaveBalance) throw new Error('Leave balance record not found');
    if (leaveBalance.remainingDays < leaveRequest.totalDays) {
      throw new Error('Insufficient leave balance. Cannot approve this request.');
    }

    leaveApproval.status = LeaveRequestStatus.approved;
    if (remarks) leaveApproval.remarks = remarks;
    await leaveApprovalRepo.save(leaveApproval);

    // Check if all approvals are done (all levels approved)
    const allApprovals = await leaveApprovalRepo.find({
      where: { leaveRequest: { id: leaveRequest.id } },
    });

    const pendingOrRejected = allApprovals.find(
      (approval) => approval.status !== 'approved'
    );

    if (pendingOrRejected) {
      // There are still approvals pending or rejected, so leave request remains pending
      leaveRequest.status = LeaveRequestStatus.pending;
    } else {
      // All approvals approved: finalize leave request
      leaveRequest.status = LeaveRequestStatus.approved;

      leaveBalance.usedDays += leaveRequest.totalDays;
      leaveBalance.remainingDays = leaveBalance.totalDays - leaveBalance.usedDays;
      await leaveBalanceRepo.save(leaveBalance);
    }

    await leaveRequestRepo.save(leaveRequest);
  } else {
    // Reject flow: update this approval and the request immediately
    leaveApproval.status = LeaveRequestStatus.rejected;
    if (remarks) leaveApproval.remarks = remarks;
    await leaveApprovalRepo.save(leaveApproval);

    leaveRequest.status = LeaveRequestStatus.rejected;
    await leaveRequestRepo.save(leaveRequest);
  }

  return { message: `Leave request ${action}d successfully` };
}
