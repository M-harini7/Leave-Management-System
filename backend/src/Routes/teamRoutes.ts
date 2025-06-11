import { Server } from '@hapi/hapi';
import { TeamController } from '../Controllers/teamControllers';
import { validateAdminOrHRForTeam } from '../Middleware/teamAuth';
import { verifyToken } from '../Middleware/employeeAuth';
export const teamRoutes = (server: Server) => {
  server.route([
    {
      method: 'POST',
      path: '/teams',
      options: {
        pre: [validateAdminOrHRForTeam],
        handler: TeamController.create,
      },
    },
    {
      method: 'PUT',
      path: '/teams/{id}',
      options: {
        pre: [validateAdminOrHRForTeam],
        handler: TeamController.update,
      },
    },
    {
      method: 'DELETE',
      path: '/teams/{id}',
      options: {
        pre: [validateAdminOrHRForTeam],
        handler: TeamController.remove,
      },
    },
    {
      method: 'GET',
      path: '/teams',
      handler: TeamController.getAll, // anyone can view
    },
  ]);
};
