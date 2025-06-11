import { Request, ResponseToolkit } from '@hapi/hapi';
import { AppDataSource } from '../data-sources';
import { LeaveBalance } from '../Entities/LeaveBalance';
import { LeaveRequest } from '../Entities/LeaveRequest';
export const getLeaveHistoryHandler = async (request: Request, h: ResponseToolkit) => {
  const employeeId = parseInt(request.params.employeeId);
  const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
  try {
    const leaveHistory = await leaveRequestRepo.find({
        where: { employee: { id: employeeId } },
        relations: ['leaveType'],  // Load the leaveType relation
      });
    return h.response(leaveHistory).code(200);
  } catch (err) {
    console.error('Error fetching leave history:', err);
    return h.response({ error: 'Failed to fetch leave history' }).code(500);
  }
};
export const getLeaveBalanceHandler = async (request: Request, h: ResponseToolkit) => {
    try {
      const employeeId = parseInt(request.params.employeeId);
      const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
  
      const balances = await leaveBalanceRepo.find({
        where: { employee: { id: employeeId } },
        relations: ['leaveType'], // if you want details of leave type
      });
      return h.response(balances).code(200);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      return h.response({ error: 'Failed to fetch leave balances' }).code(500);
    }
  };