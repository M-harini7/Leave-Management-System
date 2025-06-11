import { AppDataSource } from '../data-sources';
import { Employee } from '../Entities/Employee';

export const getTeamMembersService = async (role: string, teamId: number) => {
  const employeeRepo = AppDataSource.getRepository(Employee);

  let allowedRoles: string[] = [];

  if (role === 'team lead'|| role==='developer') {
    allowedRoles = ['developer'];
  } else if (role === 'manager') {
    allowedRoles = ['team lead', 'developer'];
  } else if(role==='hr') {
    allowedRoles=['team lead','developer','manager'] // Other roles not allowed to see team members
  }
  else{
    return[];
  }

  const members = await employeeRepo
    .createQueryBuilder('employee')
    .leftJoinAndSelect('employee.role', 'role')
    .leftJoinAndSelect('employee.team', 'team')
    .where('team.id = :teamId', { teamId })
    .andWhere('LOWER(role.name) IN (:...allowedRoles)', { allowedRoles })
    .getMany();

  return members;
};
