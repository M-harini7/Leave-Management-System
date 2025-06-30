import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { AppDataSource } from '../data-sources';
import { Employee } from '../Entities/Employee';
import { LeaveRequest } from '../Entities/LeaveRequest';
import { LeaveRequestStatus } from '../Entities/LeaveRequest';
import { Team } from '../Entities/Team';

export const summaryRoute: ServerRoute = {
  method: 'GET',
  path: '/summary',
  handler: async (request: Request, h: ResponseToolkit) => {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const leaveRepo = AppDataSource.getRepository(LeaveRequest);
    const teamRepo = AppDataSource.getRepository(Team);

    const totalUsers = await employeeRepo.count();
    const activeUsers = await employeeRepo.count({ where: { isActive: true } });
    const inactiveUsers = totalUsers - activeUsers;

    const totalLeaveRequests = await leaveRepo.count();
    const approvedLeaveRequests = await leaveRepo.count({ where: { status: LeaveRequestStatus.approved } });
    const rejectedLeaveRequests = await leaveRepo.count({ where: { status: LeaveRequestStatus.rejected } });

    const totalTeams = await teamRepo.count();

    return h.response({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
      },
      leaveRequests: {
        total: totalLeaveRequests,
        approved: approvedLeaveRequests,
        rejected: rejectedLeaveRequests,
      },
      teams: {
        total: totalTeams,
      },
    });
  },
};
