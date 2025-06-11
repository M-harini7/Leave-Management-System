import { AppDataSource } from '../data-sources';
import { LeaveRequest } from '../Entities/LeaveRequest';
import { User } from '../Entities/User';

export const getTeamLeaveCalendarService = async (userId: number) => {
  const userRepo = AppDataSource.getRepository(User);
  const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);

  const user = await userRepo.findOne({
    where: { id: userId },
    relations: ['role', 'employee', 'employee.team'],
  });

  if (!user || !user.employee || !user.employee.team || !user.role) {
    throw new Error('User, role, or team not found');
  }

  const userRole = user.role.name.toLowerCase();
  const teamId = user.employee.team.id;

  let roleFilter: string[] = [];

  if (userRole === 'developer') {
    // ✅ Developers can see all developers in their own team
    const leaveRequests = await leaveRequestRepo
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('employee.team', 'team')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('leave.leaveType', 'leaveType')
      .leftJoinAndSelect('user.role', 'role')
      .where('leave.status = :status', { status: 'approved' })
      .andWhere('team.id = :teamId', { teamId })
      .andWhere('LOWER(role.name) = :roleName', { roleName: 'developer' })
      .orderBy('leave.startDate', 'ASC')
      .getMany();

    return leaveRequests.map(leave => ({
      id: leave.id,
      title: `${leave.employee.name} - ${leave.leaveType.name}`,
      start: leave.startDate,
      end: leave.endDate,
      status: leave.status,
      employeeName: leave.employee.name,
      leaveTypeName: leave.leaveType.name,
    }));
  }

  // ✅ Higher roles can see lower roles in same team
  if (userRole === 'team lead') {
    roleFilter = ['developer'];
  } else if (userRole === 'manager') {
    roleFilter = ['team lead', 'developer'];
  } else if (userRole === 'hr') {
    roleFilter = ['manager', 'team lead', 'developer'];
  }

  const leaveRequests = await leaveRequestRepo
    .createQueryBuilder('leave')
    .leftJoinAndSelect('leave.employee', 'employee')
    .leftJoinAndSelect('employee.team', 'team')
    .leftJoinAndSelect('employee.user', 'user')
    .leftJoinAndSelect('leave.leaveType', 'leaveType')
    .leftJoinAndSelect('user.role', 'role')
    .where('leave.status = :status', { status: 'approved' })
    .andWhere('team.id = :teamId', { teamId })
    .andWhere('LOWER(role.name) IN (:...roles)', { roles: roleFilter })
    .orderBy('leave.startDate', 'ASC')
    .getMany();

  return leaveRequests.map(leave => ({
    id: leave.id,
    title: `${leave.employee.name} - ${leave.leaveType.name}`,
    start: leave.startDate,
    end: leave.endDate,
    status: leave.status,
    employeeName: leave.employee.name,
    leaveTypeName: leave.leaveType.name,
  }));
};
