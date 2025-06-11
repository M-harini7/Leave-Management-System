import { Server } from '@hapi/hapi';
import { getLeaveHistoryHandler,getLeaveBalanceHandler } from '../Controllers/leaveHistoryController';

export const leaveHistoryRoutes = (server: Server) => {
  server.route([
    {
    method: 'GET',
    path: '/leaves/employee/{employeeId}',
    handler: getLeaveHistoryHandler,
    options: {
      auth: 'jwt'
    }
  },
  {
    method: 'GET',
    path: '/leave-balances/{employeeId}',
    handler: getLeaveBalanceHandler,
    options: {
      auth: 'jwt',  // if you want authentication
      cors: true,   // optional, you already have global CORS
    },
  }
]);
};
