import { AppDataSource } from '../data-sources';
import { Employee } from '../Entities/Employee';
import { LeaveType } from '../Entities/LeaveType';
import { LeaveRequest } from '../Entities/LeaveRequest';

const seedOneLeaveRequest = async () => {
  await AppDataSource.initialize();

  const employeeRepo = AppDataSource.getRepository(Employee);
  const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
  const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);

  // Find an employee (e.g., first employee)
  const employee = await employeeRepo.findOneBy({});
  if (!employee) {
    console.error('No employee found to assign leave request');
    process.exit(1);
  }

  // Find a leave type (e.g., Annual Leave)
  const leaveType = await leaveTypeRepo.findOneBy({ name: 'Annual Leave' });
  if (!leaveType) {
    console.error('No leave type found');
    process.exit(1);
  }

  const startDate = new Date("2025-06-10");
  const endDate = new Date("2025-06-14");

  // Calculate total days inclusive
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  // Create a new LeaveRequest entity instance
  const leaveRequest = new LeaveRequest();
  leaveRequest.startDate = startDate;
  leaveRequest.endDate = endDate;
  leaveRequest.totalDays = totalDays;
  leaveRequest.reason = "Family vacation";
  leaveRequest.status = "pending";
  leaveRequest.remarks = "Family vacation";
  leaveRequest.employee = employee;       // associate full entity, not just ID
  leaveRequest.leaveType = leaveType;     // associate full entity, not just ID

  // Save the leave request
  await leaveRequestRepo.save(leaveRequest);

  console.log('✅ One leave request seeded');
  process.exit(0);
};

seedOneLeaveRequest().catch((err) => {
  console.error(err);
  process.exit(1);
});
