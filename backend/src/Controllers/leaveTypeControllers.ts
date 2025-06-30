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
      const user = (request as any).user;

      if (!user || !user.employee) {
        console.error(' No employee found on user:', user);
        return h.response({ error: 'User employee profile not available' }).code(400);
      }

      if (!user.employee.gender) {
        console.error(' Employee gender is missing:', user.employee);
        return h.response({ error: 'User gender not available' }).code(400);
      }

      const gender = user.employee.gender as 'male' | 'female';

      
      const leaveTypes = await LeaveTypeService.getAllLeaveTypes(gender);

      return h.response(leaveTypes).code(200);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      return h.response({ error: 'Failed to fetch leave types' }).code(500);
    }
  }
  
  
}
