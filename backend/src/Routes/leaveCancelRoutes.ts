import { ServerRoute } from '@hapi/hapi';
import { AppDataSource } from '../data-sources';
import { LeaveRequest, LeaveRequestStatus } from '../Entities/LeaveRequest';
import { LeaveApproval } from '../Entities/LeaveApproval';

export const cancelLeaveRoute: ServerRoute = {
  method: 'PATCH',
  path: '/leave-requests/{id}/cancel',
  handler: async (request, h) => {
    const leaveRepo = AppDataSource.getRepository(LeaveRequest);
    const approvalRepo = AppDataSource.getRepository(LeaveApproval);
    const id = parseInt(request.params.id);

    try {
      // Load leave request WITH approvals
      const leave = await leaveRepo.findOne({
        where: { id },
        relations: ['approvals'],
      });

      if (!leave) {
        return h.response({ message: 'Leave request not found.' }).code(404);
      }

      if (leave.status !== LeaveRequestStatus.pending) {
        return h.response({ message: 'Only pending requests can be cancelled.' }).code(400);
      }

      // Update the leave request status
      leave.status = LeaveRequestStatus.cancelled;
      await leaveRepo.save(leave);

      // Update all associated approvals to cancelled
      if (leave.approvals && leave.approvals.length > 0) {
        for (const approval of leave.approvals) {
          approval.status = LeaveRequestStatus.cancelled;
          await approvalRepo.save(approval);
        }
      }

      return h.response({ message: 'Leave request and approvals cancelled successfully.' }).code(200);
    } catch (error) {
      console.error('Error cancelling leave:', error);
      return h.response({ message: 'Internal server error.' }).code(500);
    }
  }
};
