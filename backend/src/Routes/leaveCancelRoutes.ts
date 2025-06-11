import { ServerRoute } from '@hapi/hapi';
import { AppDataSource } from '../data-sources';
import { LeaveRequest } from '../Entities/LeaveRequest';

export const cancelLeaveRoute: ServerRoute = {
  method: 'PATCH',
  path: '/leave-requests/{id}/cancel',
  handler: async (request, h) => {
    const leaveRepo = AppDataSource.getRepository(LeaveRequest);
    const id = parseInt(request.params.id);

    try {
      const leave = await leaveRepo.findOneBy({ id });

      if (!leave) {
        return h.response({ message: 'Leave request not found.' }).code(404);
      }

      if (leave.status !== 'pending') {
        return h.response({ message: 'Only pending requests can be cancelled.' }).code(400);
      }

      leave.status = 'cancelled';
      await leaveRepo.save(leave);

      return h.response({ message: 'Leave request cancelled successfully.' }).code(200);
    } catch (error) {
      console.error('Error cancelling leave:', error);
      return h.response({ message: 'Internal server error.' }).code(500);
    }
  }
};
