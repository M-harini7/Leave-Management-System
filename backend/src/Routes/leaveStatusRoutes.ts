import { ServerRoute } from '@hapi/hapi';
import { approveRejectLeaveApprovalHandler } from '../Controllers/leaveStatusController';
import { verifyToken } from '../Middleware/employeeAuth';
export const leaveStatusRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/leave-approval/action',
    handler: approveRejectLeaveApprovalHandler,
    options: {
      pre: [{ method: verifyToken }],
    },
  },
];
