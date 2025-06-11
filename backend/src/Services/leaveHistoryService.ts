import { AppDataSource } from '../data-sources';
import { LeaveRequest } from '../Entities/LeaveRequest';

export const getLeaveHistoryByEmployee = async (employeeId: number) => {
  const repo = AppDataSource.getRepository(LeaveRequest);

  const history = await repo.find({
    where: { employee: { id: employeeId } },
    relations: ['leaveType'],
    order: { startDate: 'DESC' },
  });

  return history.map((leave) => ({
    id: leave.id,
    startDate: leave.startDate,
    endDate: leave.endDate,
    leaveType: leave.leaveType.name,
    status: leave.status,
    reason: leave.reason,
  }));
};
