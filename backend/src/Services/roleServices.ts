import { AppDataSource } from '../data-sources';
import { Role } from '../Entities/Role';

class RoleService {
  static async getAllRoles() {
    const roleRepo = AppDataSource.getRepository(Role);
    return roleRepo.find();
  }

  static async createRole(name: string, description?: string): Promise<Role> {
    const roleRepo = AppDataSource.getRepository(Role);
    const existing = await roleRepo.findOneBy({ name });
    if (existing) throw new Error('Role already exists');

    const role = roleRepo.create({ name });
    return roleRepo.save(role);
  }

  static async updateRole(id: number, updateData: Partial<Role>) {
    const roleRepo = AppDataSource.getRepository(Role);
    const role = await roleRepo.findOneBy({ id });
    if (!role) return null;

    Object.assign(role, updateData);
    return roleRepo.save(role);
  }

  static async deleteRole(id: number) {
    const roleRepo = AppDataSource.getRepository(Role);
    const role = await roleRepo.findOneBy({ id });
    if (!role) return false;

    await roleRepo.delete(id);
    return true;
  }
}

export default RoleService;
