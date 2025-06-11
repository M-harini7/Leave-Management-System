import { AppDataSource } from '../data-sources';
import { LeaveType } from '../Entities/LeaveType';
import { ApprovalFlow } from '../Entities/ApprovalFlow';
import { Role } from '../Entities/Role';
import { Employee } from '../Entities/Employee';
import { LeaveBalance } from '../Entities/LeaveBalance';
import { FindOptionsWhere } from 'typeorm';

export class LeaveTypeService {
  static levelRoleMap: Record<number, string> = {
    1: 'Team Lead',
    2: 'Manager',
    3: 'HR',
  };

  static async createLeaveType(data: {
    name: string;
    totalDays: number;
    approvalLevels: number;
    autoApprove: boolean;
    description?: string;
    applicableGender?: 'male' | 'female' | 'all';
  }): Promise<LeaveType> {
    const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
    const approvalFlowRepo = AppDataSource.getRepository(ApprovalFlow);
    const roleRepo = AppDataSource.getRepository(Role);
    const employeeRepo = AppDataSource.getRepository(Employee);
    const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

    const existing = await leaveTypeRepo.findOneBy({ name: data.name });
    if (existing) throw new Error('Leave Type already exists');

    const leaveType = leaveTypeRepo.create({
      ...data,
      applicableGender: data.applicableGender === 'all' ? null : data.applicableGender,
    });

    const savedLeaveType = await leaveTypeRepo.save(leaveType);

    for (let level = 1; level <= data.approvalLevels; level++) {
      const roleName = this.levelRoleMap[level];
      if (!roleName) continue;

      const role = await roleRepo.findOneBy({ name: roleName });
      if (!role) throw new Error(`Role not found: ${roleName}`);

      const approvalFlow = approvalFlowRepo.create({
        leaveType: savedLeaveType,
        role,
        level,
      });

      await approvalFlowRepo.save(approvalFlow);
    }

    const employees = await employeeRepo.find();

    const leaveBalances = employees
      .filter(emp => {
        if (savedLeaveType.applicableGender) {
          return emp.gender === savedLeaveType.applicableGender;
        }
        return true;
      })
      .map(emp =>
        leaveBalanceRepo.create({
          employee: emp,
          leaveType: savedLeaveType,
          totalDays: data.totalDays,
          usedDays: 0,
          remainingDays: data.totalDays,
          year: new Date().getFullYear(),
        })
      );

    await leaveBalanceRepo.save(leaveBalances);

    return savedLeaveType;
  }

  static async updateLeaveType(
    id: number,
    data: Partial<Omit<LeaveType, 'applicableGender'>> & { applicableGender?: 'male' | 'female' | 'all' }
  ): Promise<LeaveType> {
    const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
    const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
    const employeeRepo = AppDataSource.getRepository(Employee);
  
    const leaveType = await leaveTypeRepo.findOneBy({ id });
    if (!leaveType) throw new Error('Leave Type not found');
  
    const originalTotalDays = leaveType.totalDays;
    const originalGender = leaveType.applicableGender ?? 'all';
  
    // Convert 'all' to null for DB storage
    const updatedGender: 'male' | 'female' | null | undefined =
      data.applicableGender === 'all' ? null : data.applicableGender;
  
    Object.assign(leaveType, { ...data, applicableGender: updatedGender });
  
    const updatedLeaveType = await leaveTypeRepo.save(leaveType);
  
    // Update leave balances if totalDays changed
    if (data.totalDays !== undefined && data.totalDays !== originalTotalDays) {
      const balances = await leaveBalanceRepo.find({
        where: { leaveType: { id } },
        relations: ['employee'],
      });
  
      for (const balance of balances) {
        balance.totalDays = updatedLeaveType.totalDays;
        balance.remainingDays = Math.max(0, updatedLeaveType.totalDays - balance.usedDays);
        await leaveBalanceRepo.save(balance);
      }
    }
  
    // Update leave balances if applicableGender changed
    if (data.applicableGender !== undefined && data.applicableGender !== originalGender) {
      const newGender = data.applicableGender;
  
      if (newGender !== 'all') {
        const balances = await leaveBalanceRepo.find({
          where: { leaveType: { id } },
          relations: ['employee'],
        });
  
        for (const balance of balances) {
          if (balance.employee.gender !== newGender) {
            await leaveBalanceRepo.remove(balance);
          }
        }
      }

      const whereCondition: FindOptionsWhere<Employee> | undefined =
      newGender === 'all' ? undefined : { gender: newGender as 'male' | 'female' };
    
    const eligibleEmployees = await employeeRepo.find({
      where: whereCondition,
    });

  
      for (const emp of eligibleEmployees) {
        const existing = await leaveBalanceRepo.findOne({
          where: {
            employee: { id: emp.id },
            leaveType: { id: updatedLeaveType.id },
          },
        });
  
        if (!existing) {
          const newBalance = leaveBalanceRepo.create({
            employee: emp,
            leaveType: updatedLeaveType,
            totalDays: updatedLeaveType.totalDays,
            usedDays: 0,
            remainingDays: updatedLeaveType.totalDays,
            year: new Date().getFullYear(),
          });
          await leaveBalanceRepo.save(newBalance);
        }
      }
    }
  
    return updatedLeaveType;
  }
  

  static async deleteLeaveType(id: number): Promise<void> {
    const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
    const leaveType = await leaveTypeRepo.findOneBy({ id });
    if (!leaveType) throw new Error('Leave Type not found');
    await leaveTypeRepo.remove(leaveType);
  }

  static async getAllLeaveTypes(): Promise<LeaveType[]> {
    const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
    return await leaveTypeRepo.find();
  }
}
