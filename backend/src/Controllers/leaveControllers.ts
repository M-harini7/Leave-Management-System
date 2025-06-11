import { Request, ResponseToolkit } from '@hapi/hapi';
import * as leaveService from '../Services/leaveRequestServices';
import { createLeaveRequestWithApprovals } from '../Services/leaveRequestServices';

export const createLeaveRequest = async (request: Request, h: ResponseToolkit) => {
  try {
    const { leaveTypeId, startDate, endDate, reason } = request.payload as any;
    const employeeId = (request.auth.credentials as any).employeeId;

    const leaveRequest = await createLeaveRequestWithApprovals(
      employeeId,
      leaveTypeId,
      new Date(startDate),
      new Date(endDate),
      reason
    );

    return h.response({
      message: 'Leave request submitted successfully',
      data: leaveRequest,
    }).code(201);
  } catch (error: any) {
    console.error('Error submitting leave request:', error);
    return h.response({ error: error.message || 'Something went wrong' }).code(500);
  }
};
 export const getAllLeaveRequests = async (request: Request, h: ResponseToolkit) => {
    try {
      const requests = await leaveService.getAllLeaveRequests();
      return h.response(requests).code(200);
    } catch (err) {
      console.error(err);
      return h.response({ error: 'Failed to fetch leave requests' }).code(500);
    }
  }; 
  export const getDashboardData = async (request: Request, h: ResponseToolkit) => {
    try {
      const credentials = request.auth.credentials as { employeeId: number };
      const employeeId = credentials.employeeId;
      const data = await leaveService.getDashboardData(employeeId);
      return h.response(data).code(200);
    } catch (error) {
      let errorMessage = 'Something went wrong';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return h.response({ error: errorMessage }).code(500);
    }
  };