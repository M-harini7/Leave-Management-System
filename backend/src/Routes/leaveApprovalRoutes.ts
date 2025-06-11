import { Server } from '@hapi/hapi';
import { getPendingApprovalsController,getProcessedApprovalsController } from '../Controllers/leaveApprovalController';
import { verifyToken } from '../Middleware/employeeAuth';

export const leaveApprovalRoutes = (server: Server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/approvals/pending',
      handler: getPendingApprovalsController,
      options: {
        pre: [{ method: verifyToken }],
      },
    },
    {
      method: 'GET',
      path: '/api/approvals/processed',
      handler: getProcessedApprovalsController,
      options: { pre: [{ method: verifyToken }] },
    }
    
  ]);
};
