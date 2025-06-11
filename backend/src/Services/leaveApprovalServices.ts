import { AppDataSource } from '../data-sources';
import { User } from '../Entities/User';
import { LeaveApproval } from '../Entities/LeaveApproval';
export const getPendingApprovalsService = async (userId: number) => {
  const userRepo = AppDataSource.getRepository(User);
  const leaveApprovalRepo = AppDataSource.getRepository(LeaveApproval);

  const user = await userRepo.findOne({
    where: { id: userId },
    relations: ['employee', 'role'],
  });

  if (!user) throw new Error('User not found');

  const employeeId = user.employee.id;

  const pendingApprovals = await leaveApprovalRepo
    .createQueryBuilder('la')
    .leftJoinAndSelect('la.leaveRequest', 'lr')
    .leftJoinAndSelect('lr.employee', 'employee')
    .leftJoinAndSelect('lr.leaveType', 'leaveType') 
    .leftJoinAndSelect('la.role', 'role')
    .where('la.approver = :employeeId', { employeeId })
    .andWhere('la.status = :pending', { pending: 'pending' })
    .andWhere(qb => {
      const subQuery = qb.subQuery()
        .select('1')
        .from(LeaveApproval, 'prev')
        .where('prev.leaveRequest = la.leaveRequest')
        .andWhere('prev.level < la.level')
        .andWhere('prev.status != :approved')
        .getQuery();
      return `NOT EXISTS ${subQuery}`;
    })
    .setParameter('approved', 'approved')
    .getMany();

  return pendingApprovals;
};
export const getProcessedApprovalsService = async (userId: number) => {
  const userRepo = AppDataSource.getRepository(User);
  const leaveApprovalRepo = AppDataSource.getRepository(LeaveApproval);

  const user = await userRepo.findOne({
    where: { id: userId },
    relations: ['employee'],
  });

  if (!user) throw new Error('User not found');

  const employeeId = user.employee.id;

  const processedApprovals = await leaveApprovalRepo
    .createQueryBuilder('la')
    .leftJoinAndSelect('la.leaveRequest', 'lr')
    .leftJoinAndSelect('lr.employee', 'employee')
    .leftJoinAndSelect('employee.role', 'role')
    .leftJoinAndSelect('employee.team', 'team')
    .leftJoinAndSelect('lr.leaveType', 'leaveType')
    .leftJoinAndSelect('la.role', 'approvalRole')
    .where('la.approver = :employeeId', { employeeId })
    .andWhere('la.status IN (:...statuses)', { statuses: ['approved', 'rejected'] })
    .orderBy('la.updatedAt', 'DESC')
    .getMany();

  return processedApprovals;
};
