// src/Routes/teamLeaveCalendarRoutes.ts
import { Server } from '@hapi/hapi';
import { getTeamLeaveCalendarController } from '../Controllers/teamLeaveCalendarController';
import { verifyToken } from '../Middleware/employeeAuth';

export const teamLeaveCalendarRoutes = (server: Server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/calendar/team',
      handler: getTeamLeaveCalendarController,
      options: {
        pre: [{ method: verifyToken }],
      },
    },
  ]);
};
