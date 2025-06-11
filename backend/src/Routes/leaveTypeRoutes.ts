import { Server } from '@hapi/hapi';
import { LeaveTypeController } from '../Controllers/leaveTypeControllers';
import { leaveTypeAuth } from '../Middleware/leaveTypeAuth';

export const leaveTypeRoutes = (server: Server) => {
  server.route([
    {
      method: 'POST',
      path: '/leave-types',
      options: {
        pre: [leaveTypeAuth],
        handler: LeaveTypeController.createLeaveType,
      },
    },
    {
      method: 'PUT',
      path: '/leave-types/{id}',
      options: {
        pre: [leaveTypeAuth],
        handler: LeaveTypeController.updateLeaveType,
      },
    },
    {
      method: 'DELETE',
      path: '/leave-types/{id}',
      options: {
        pre: [leaveTypeAuth],
        handler: LeaveTypeController.deleteLeaveType,
      },
    },
    {
      method: 'GET',
      path: '/leave-types',
      handler: LeaveTypeController.getAllLeaveTypes,
    },
  ]);
};
