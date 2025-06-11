import { Request, ResponseToolkit } from '@hapi/hapi';
import { getPendingApprovalsService ,getProcessedApprovalsService} from '../Services/leaveApprovalServices';

export const getPendingApprovalsController = async (req: Request, h: ResponseToolkit) => {
  try {
    const userId = (req.auth.credentials as any).userId;

    const approvals = await getPendingApprovalsService(userId);
    return h.response(approvals).code(200);
  } catch (error: any) {
    console.error('Error fetching pending approvals:', error);
    return h.response({ message: error.message || 'Internal Server Error' }).code(500);
  }
};


export const getProcessedApprovalsController = async (req: Request, h: ResponseToolkit) => {
  try {
    const userIdUnknown = (req.auth.credentials as any).userId;

    if (typeof userIdUnknown !== 'number') {
      return h.response({ error: 'Invalid userId type' }).code(400);
    }
    const userId = userIdUnknown;

    const approvals = await getProcessedApprovalsService(userId);
    return h.response(approvals).code(200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return h.response({ message }).code(500);
  }
};

