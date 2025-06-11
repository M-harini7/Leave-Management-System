// src/Controllers/teamLeaveCalendarController.ts
import { Request, ResponseToolkit } from '@hapi/hapi';
import { getTeamLeaveCalendarService } from '../Services/teamLeaveCalendarService';

export const getTeamLeaveCalendarController = async (req: Request, h: ResponseToolkit) => {
  try {
    const userId = (req.auth.credentials as any).userId;
    const calendarData = await getTeamLeaveCalendarService(userId);
    return h.response(calendarData).code(200);
  } catch (err: any) {
    console.error('Team Calendar Fetch Error:', err);
    return h.response({ error: err.message || 'Internal Server Error' }).code(500);
  }
};
