import { Server } from '@hapi/hapi';
import { RoleController } from '../Controllers/roleController';
import { validateAdminOrHR } from '../Middleware/roleAuth';

export const roleRoutes = (server: Server) => {
  server.route([
    {
      method: 'POST',
      path: '/roles',
      options: {
        pre: [validateAdminOrHR], // your auth middleware for roles
        handler: RoleController.create,
      },
    },
    {
      method: 'PUT',
      path: '/roles/{id}',
      options: {
        pre: [validateAdminOrHR],
        handler: RoleController.update,
      },
    },
    {
      method: 'DELETE',
      path: '/roles/{id}',
      options: {
        pre: [validateAdminOrHR],
        handler: RoleController.remove,
      },
    },
    {
      method: 'GET',
      path: '/roles',
      handler: RoleController.getAll, // open or protected depending on your setup
    },
  ]);
};
