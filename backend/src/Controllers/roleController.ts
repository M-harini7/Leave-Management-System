import { Request, ResponseToolkit } from '@hapi/hapi';
import RoleService from '../Services/roleServices';

export class RoleController {
  static async update(request: Request, h: ResponseToolkit) {
    try {
      const id = Number(request.params.id);
      const payload = request.payload as { name?: string; description?: string };

      if (!id) return h.response({ error: 'Invalid role id' }).code(400);

      const updatedRole = await RoleService.updateRole(id, payload);

      if (!updatedRole) return h.response({ error: 'Role not found' }).code(404);

      return h.response(updatedRole).code(200);
    } catch (err) {
      return h.response({ error: (err as Error).message }).code(500);
    }
  }

  static async remove(request: Request, h: ResponseToolkit) {
    try {
      const id = Number(request.params.id);
      if (!id) return h.response({ error: 'Invalid role id' }).code(400);

      const deleted = await RoleService.deleteRole(id);
      if (!deleted) return h.response({ error: 'Role not found' }).code(404);

      return h.response({ message: 'Role deleted' }).code(200);
    } catch (err) {
      return h.response({ error: (err as Error).message }).code(500);
    }
  }

  static async getAll(request: Request, h: ResponseToolkit) {
    try {
      const roles = await RoleService.getAllRoles();
      return h.response(roles).code(200);
    } catch (err) {
      return h.response({ error: (err as Error).message }).code(500);
    }
  }
  static async create(request: Request, h: ResponseToolkit) {
    try {
      const { name, description } = request.payload as { name: string; description?: string };
      const role = await RoleService.createRole(name, description);
      return h.response({ message: 'Role created', role }).code(201);
    } catch (err) {
      return h.response({ error: (err as Error).message }).code(400);
    }
  }
  
}
