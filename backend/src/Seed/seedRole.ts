import { AppDataSource } from '../data-sources';
import { Role } from '../Entities/Role';

const seedRoles = async () => {
  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);
  const roles = ['Admin', 'HR', 'Manager', 'Team Lead', 'Developer', 'System Auto Approval'];

  for (const name of roles) {
    const role = new Role();
    role.name = name;
    await roleRepo.save(role);
  }

  console.log('✅ Roles seeded');
};

seedRoles().catch(console.error);
