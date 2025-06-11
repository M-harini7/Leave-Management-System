import { AppDataSource } from '../data-sources';
import { Employee } from '../Entities/Employee';
import { Role } from '../Entities/Role';
import { Team } from '../Entities/Team';

const seedEmployees = async () => {
  await AppDataSource.initialize();
  const empRepo = AppDataSource.getRepository(Employee);
  const roleRepo = AppDataSource.getRepository(Role);
  const teamRepo = AppDataSource.getRepository(Team);

  const adminRole = await roleRepo.findOneBy({ name: 'Admin' });
  const hrRole = await roleRepo.findOneBy({ name: 'HR' });
  const teamLeadRole = await roleRepo.findOneBy({ name: 'Team Lead' });

  const engineeringTeam = await teamRepo.findOneBy({ name: 'Engineering' });

  const employees = [
    {
      name: 'Harini',
      email: 'harini@company.com',
      gender: 'Female',
      joiningDate: new Date('2023-01-01'),
      role: adminRole!,
      teamId: engineeringTeam!,
      password:'harini123',
    },
    {
      name: 'Priya',
      email: 'priya@company.com',
      gender: 'Female',
      joiningDate: new Date('2023-02-01'),
      role: hrRole!,
      teamId: engineeringTeam!,
      password:'priya123',
    },
    {
      name: 'Karthik',
      email: 'karthik@company.com',
      gender: 'Male',
      joiningDate: new Date('2022-10-10'),
      role: teamLeadRole!,
      teamId: engineeringTeam!,
      password:'karthik123',
    },
  ];

  for (const data of employees) {
    const exists = await empRepo.findOneBy({ email: data.email });
    if (!exists) {
      const employee = empRepo.create(data);
      await empRepo.save(employee);
    }
  }

  console.log('✅ Employees seeded');
  process.exit(0);
};

seedEmployees().catch((err) => {
  console.error(err);
  process.exit(1);
});
