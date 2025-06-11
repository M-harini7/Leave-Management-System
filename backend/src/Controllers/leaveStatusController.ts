import { Request, ResponseToolkit } from '@hapi/hapi';
import { handleLeaveApprovalAction } from '../Services/leaveStatusService';

export async function approveRejectLeaveApprovalHandler(req: Request, h: ResponseToolkit) {
  const { leaveApprovalId, action, remarks } = req.payload as {
    leaveApprovalId: number;
    action: 'approve' | 'reject';
    remarks?: string;
  };

  try {
    const result = await handleLeaveApprovalAction(leaveApprovalId, action, remarks);
    return h.response(result).code(200);
  } catch (err: any) {
    return h.response({ error: err.message }).code(400);
  }
}
