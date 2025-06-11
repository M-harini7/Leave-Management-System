import { Server } from '@hapi/hapi';
import { getTeamMembers } from '../Controllers/getemployeeController';

export const getemployeeRoute = (server: Server) => {
  server.route([
    {
      method: 'GET',
      path: '/employees/team-members',
      handler: getTeamMembers,
      options: {
        auth: 'jwt',
      },
    },
  ]);
};
