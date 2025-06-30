import { AppDataSource } from '../data-sources';
import { Employee } from '../Entities/Employee';
import { Role } from '../Entities/Role';
import { Team } from '../Entities/Team';
import { LeaveBalance } from '../Entities/LeaveBalance';
import { LeaveType } from '../Entities/LeaveType';
import {Gender} from '../types';

export const createEmployee = async (data: {
  name: string;
  email: string;
  gender: Gender;
  joiningDate: string;
  roleId: number;
  teamId: number;
}) => {
  const employeeRepo = AppDataSource.getRepository(Employee);
  const roleRepo = AppDataSource.getRepository(Role);
  const teamRepo = AppDataSource.getRepository(Team);
  const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
  const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

  const existingEmployee = await employeeRepo.findOneBy({ email: data.email });
  if (existingEmployee) {
    throw new Error('Employee with this email already exists.');
  }

  const role = await roleRepo.findOneBy({ id: data.roleId });
  const team = await teamRepo.findOneBy({ id: data.teamId });

  if (!role) throw new Error('Invalid role ID');
  if (!team) throw new Error('Invalid team ID');

  const newEmployee = employeeRepo.create({
    name: data.name,
    email: data.email,
    gender: data.gender,
    joiningDate: new Date(data.joiningDate),
    role,
    team,
    isActive: true,
  });

  const savedEmployee = await employeeRepo.save(newEmployee);
  const leaveTypes = await leaveTypeRepo.find();
  const applicableLeaveTypes = leaveTypes.filter((lt) => {
    if (lt.applicableGender == null) return true; // 'all'
    return lt.applicableGender === data.gender;
  });

  // Create leave balances
  const leaveBalances = applicableLeaveTypes.map((lt) =>
    leaveBalanceRepo.create({
      employee: savedEmployee,
      leaveType: lt,
      totalDays: lt.totalDays,
      usedDays: 0,
      remainingDays: lt.totalDays,
      year: new Date().getFullYear(),
    })
  );

  await leaveBalanceRepo.save(leaveBalances);

  return savedEmployee;
};

export const updateEmployee = async (
  employeeId: number,
  data: {
    name?: string;
    email?: string;
    gender?: Gender;
    joiningDate?: string;
    roleId?: number;
    teamId?: number;
    isActive?: boolean;
  }
) => {
  const employeeRepo = AppDataSource.getRepository(Employee);
  const roleRepo = AppDataSource.getRepository(Role);
  const teamRepo = AppDataSource.getRepository(Team);

  const employee = await employeeRepo.findOne({
    where: { id: employeeId },
    relations: ['role', 'team'],
  });
  if (!employee) {
    throw new Error('Employee not found');
  }

  if (data.email && data.email !== employee.email) {
    const existingEmployee = await employeeRepo.findOneBy({ email: data.email });
    if (existingEmployee) {
      throw new Error('Employee with this email already exists.');
    }
    employee.email = data.email;
  }

  if (data.name) employee.name = data.name;
  if (data.gender) employee.gender = data.gender;
  if (data.joiningDate) employee.joiningDate = new Date(data.joiningDate);

  if (data.roleId !== undefined && data.roleId !== null) {
    const role = await roleRepo.findOneBy({ id: data.roleId });
    if (!role) throw new Error('Invalid role ID');
    employee.role = role;
  }
  
  if (data.teamId !== undefined && data.teamId !== null) {
    const team = await teamRepo.findOneBy({ id: data.teamId });
    if (!team) throw new Error('Invalid team ID');
    employee.team = team;
  }
  
  if (data.isActive !== undefined) {
    employee.isActive = data.isActive; 
  }
  return await employeeRepo.save(employee);
};

export const deleteEmployee = async (employeeId: number) => {
  const employeeRepo = AppDataSource.getRepository(Employee);

  const employee = await employeeRepo.findOneBy({ id: employeeId });
  if (!employee) {
    throw new Error('Employee not found');
  }
  // Soft delete
  employee.isActive = false;
  return await employeeRepo.save(employee);
};

export const getAllEmployees = async () => {
  const employeeRepo = AppDataSource.getRepository(Employee);
  return await employeeRepo.find({
    relations: ["role", "team"]
  });
}
