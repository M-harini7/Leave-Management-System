import { Server } from '@hapi/hapi';
import {
  registerEmployeeHandler,
  loginHandler,
  getProfileHandler,
} from '../Controllers/employeeController';
import { verifyToken } from '../Middleware/employeeAuth';

export const employeeRoutes = (server: Server) => {
  server.route([
    {
      method: 'POST',
      path: '/register',
      handler: registerEmployeeHandler,
    },
    {
      method: 'POST',
      path: '/login',
      handler: loginHandler,
    },
    {
      method: "GET",
      path: "/profile",
      handler: getProfileHandler,
      options: {
        pre: [{ method: verifyToken }],
      }
    },

  ]);
};
