// src/routes/approverSummaryRoute.ts
import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { AppDataSource } from '../data-sources';
import { LeaveApproval } from '../Entities/LeaveApproval';

export const approverSummaryRoute: ServerRoute = {
  method: 'GET',
  path: '/approver-summary',
  options: {
    auth: 'jwt', // ✅ ensure this route is protected by JWT auth strategy
  },
  handler: async (request: Request, h: ResponseToolkit) => {
    try {
      const user = request.auth?.credentials as { employeeId?: number } | null;

      if (!user || !user.employeeId) {
        return h.response({ error: 'Unauthorized: Missing employeeId' }).code(401);
      }

      const approverId = user.employeeId;
      const approvalRepo = AppDataSource.getRepository(LeaveApproval);

      const [pending, approved, rejected] = await Promise.all([
        approvalRepo.count({ where: { approver: { id: approverId }, status: 'pending' } }),
        approvalRepo.count({ where: { approver: { id: approverId }, status: 'approved' } }),
        approvalRepo.count({ where: { approver: { id: approverId }, status: 'rejected' } }),
      ]);

      return h.response({ pending, approved, rejected });
    } catch (error) {
      console.error('Error in /approver-summary:', error);
      return h.response({ error: 'Internal Server Error' }).code(500);
    }
  },
};
