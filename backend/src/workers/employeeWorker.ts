import { Worker } from 'bullmq';
import { AppDataSource } from '../data-sources';
import { Employee } from '../Entities/Employee';
import { Team } from '../Entities/Team';
import { Role } from '../Entities/Role';
import { LeaveType } from '../Entities/LeaveType';
import { LeaveBalance } from '../Entities/LeaveBalance';
import { connection } from '../redisConnection';

AppDataSource.initialize().then(() => {
  console.log('DB Initialized. Starting employee worker...');

  const employeeRepo = AppDataSource.getRepository(Employee);
  const teamRepo = AppDataSource.getRepository(Team);
  const roleRepo = AppDataSource.getRepository(Role);
  const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
  const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

  new Worker(
    'employee-upload-queue',
    async (job) => {
      const rows = job.data.rows;
      const warnings: string[] = [];
      const employeesToSave: Employee[] = [];

      const allTeams = await teamRepo.find();
      const allRoles = await roleRepo.find();

      const emailsInBatch = rows.map((r: any) => r.email?.toLowerCase()).filter(Boolean);
      const existingEmployees = await employeeRepo
        .createQueryBuilder('employee')
        .where('LOWER(employee.email) IN (:...emails)', { emails: emailsInBatch })
        .select(['employee.email'])
        .getMany();

      const existingEmails = new Set(existingEmployees.map(e => e.email.toLowerCase()));

      for (const row of rows) {
        if (!row.email) {
          warnings.push(`Skipping row without email: ${JSON.stringify(row)}`);
          continue;
        }

        if (existingEmails.has(row.email.toLowerCase())) {
          warnings.push(`Skipping ${row.name} with email ${row.email} - already exists`);
          continue;
        }

        const team = allTeams.find(t => t.name.toLowerCase() === (row.team || '').toLowerCase());
        const role = allRoles.find(r => r.name.toLowerCase() === (row.role || '').toLowerCase());

        if (!team || !role) {
          warnings.push(`Skipping ${row.name}: team or role not found`);
          continue;
        }

        const employee = new Employee();
        employee.name = row.name;
        employee.email = row.email;
        employee.password = row.password || '';
        employee.gender = row.gender?.toLowerCase() === 'female' ? 'female' : 'male';
        employee.joiningDate = new Date(row.joiningDate);
        employee.role = role;
        employee.team = team;

        employeesToSave.push(employee);
      }

      if (employeesToSave.length === 0) {
        warnings.push('No valid employees to insert');
        return { warnings ,inserted:0};
      }

      const savedEmployees = await employeeRepo.save(employeesToSave);
      const leaveTypes = await leaveTypeRepo.find();
      const leaveBalances: LeaveBalance[] = [];
       
      for (const emp of savedEmployees) {
        const applicableLeaveTypes = leaveTypes.filter((lt) => {
            // Example condition: add `gender` column in LeaveType to control eligibility
            if (lt.name.toLowerCase() === 'maternity leave') return emp.gender === 'female';
            if (lt.name.toLowerCase() === 'paternity leave') return emp.gender === 'male';
            return true; // For gender-neutral leave types
          });
        for (const lt of leaveTypes) {
          leaveBalances.push(
            leaveBalanceRepo.create({
              employee: emp,
              leaveType: lt,
              totalDays: lt.totalDays,
              usedDays: 0,
              remainingDays: lt.totalDays,
            })
          );
        }
      }

      if (leaveBalances.length) {
        await leaveBalanceRepo.save(leaveBalances);
      }

      return {
        warnings,
        inserted: savedEmployees.length,
      };
    },
    { connection }
  );
});