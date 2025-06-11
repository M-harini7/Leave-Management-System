import { Request, ResponseToolkit } from '@hapi/hapi';
import {
  registerEmployee,
  loginEmployee,
  getUserProfile,
} from '../Services/employeeServices';
import { AuthPayload } from '../types';

export const registerEmployeeHandler = async (req: Request, h: ResponseToolkit) => {
    // Cast req.payload to the expected shape
    const payload = req.payload as { email: string; password: string };
    try {
      const result = await registerEmployee(payload);
      return h.response(result).code(201);
    } catch (error: any) {
      return h.response({ error: error.message }).code(400);
    }
  };
  
  export const loginHandler = async (req: Request, h: ResponseToolkit) => {
    // Cast req.payload to the expected shape
    const payload = req.payload as { email: string; password: string };
    try {
      const result = await loginEmployee(payload);
      return h.response(result).code(200);
    } catch (error: any) {
      return h.response({ error: error.message }).code(400);
    }
  };
  export const getProfileHandler = async (request: Request, h: ResponseToolkit) => {
    try {
      const credentials = request.auth.credentials as unknown as AuthPayload;
  
      if (typeof credentials.userId !== 'number') {
        return h.response({ error: 'Invalid userId in token' }).code(400);
      }
  
      const profile = await getUserProfile(credentials.userId);
      return h.response(profile).code(200);
    } catch (err: any) {
      console.error('Error in getProfileHandler:', err);
      return h.response({ error: 'Failed to fetch profile' }).code(500);
    }
  };
  
  

