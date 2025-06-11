import { Request, ResponseToolkit } from '@hapi/hapi';
import {
  createHolidayService,
  getAllHolidaysService,
  updateHolidayService,
  deleteHolidayService,
} from '../Services/holidayServices';

export const createHoliday = async (req: Request, h: ResponseToolkit) => {
  try {
    const result = await createHolidayService(req.payload as any);
    return h.response(result).code(201);
  } catch (err) {
    if (err instanceof Error) {
      return h.response({ error: err.message }).code(400);
    }
    return h.response({ error: 'Unexpected error' }).code(500);
  }
  
};

export const getAllHolidays = async (_req: Request, h: ResponseToolkit) => {
  const holidays = await getAllHolidaysService();
  return h.response(holidays).code(200);
};

export const updateHoliday = async (req: Request, h: ResponseToolkit) => {
  try {
    const { id } = req.params;
    const result = await updateHolidayService(parseInt(id), req.payload as any);
    return h.response(result).code(200);
  } catch (err) {
    if (err instanceof Error) {
      return h.response({ error: err.message }).code(400);
    }
    return h.response({ error: 'Unexpected error' }).code(500);
  }
  
};

export const deleteHoliday = async (req: Request, h: ResponseToolkit) => {
  try {
    const { id } = req.params;
    const result = await deleteHolidayService(parseInt(id));
    return h.response(result).code(200);
  } catch (err) {
    if (err instanceof Error) {
      return h.response({ error: err.message }).code(400);
    }
    return h.response({ error: 'Unexpected error' }).code(500);
  }
  
};
