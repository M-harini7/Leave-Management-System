import { Request, ResponseToolkit } from '@hapi/hapi';
import { LeaveTypeService } from '../Services/leaveTypeServices';

export class LeaveTypeController {
  static async createLeaveType(request: Request, h: ResponseToolkit) {
    try {
      const leaveType = await LeaveTypeService.createLeaveType(request.payload as any);
      return h.response(leaveType).code(201);
    } catch (error) {
      return h.response({ error: error instanceof Error ? error.message : 'Unknown error' }).code(400);

    }
  }

  static async updateLeaveType(request: Request, h: ResponseToolkit) {
    const id = Number(request.params.id);
    try {
      const leaveType = await LeaveTypeService.updateLeaveType(id, request.payload as any);
      return h.response(leaveType).code(200);
    } catch (error) {
      return h.response({ error: error instanceof Error ? error.message : 'Unknown error' }).code(400);

    }
  }

  static async deleteLeaveType(request: Request, h: ResponseToolkit) {
    const id = Number(request.params.id);
    try {
      await LeaveTypeService.deleteLeaveType(id);
      return h.response({ message: 'Leave Type deleted' }).code(200);
    } catch (error) {
      return h.response({ error: error instanceof Error ? error.message : 'Unknown error' }).code(400);

    }
  }

  static async getAllLeaveTypes(request: Request, h: ResponseToolkit) {
    try {
      const leaveTypes = await LeaveTypeService.getAllLeaveTypes();
      return h.response( leaveTypes ).code(200); 
    } catch (error) {
      return h.response({ error: 'Failed to fetch leave types' }).code(500);
    }
  }
}
