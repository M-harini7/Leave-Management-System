import { Server } from '@hapi/hapi';
import * as leaveController from '../Controllers/leaveControllers';
import { verifyToken } from '../Middleware/employeeAuth';
export const registerLeaveRoutes = (server: Server) => {
  server.route([
    {
      method: 'POST',
      path: '/leave-request',
      options: {
        pre: [{ method: verifyToken }],
      },
      handler: leaveController.createLeaveRequest,
    },
    {
      method: 'GET',
      path: '/leave-request',
      handler: leaveController.getAllLeaveRequests,
      options: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/leave-dashboard',
      handler: leaveController.getDashboardData,
      options: {
        auth: 'jwt', // enable JWT auth
      },
    },
  ]);
};
