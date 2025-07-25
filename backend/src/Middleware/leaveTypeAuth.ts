import { Request, ResponseToolkit } from '@hapi/hapi';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-sources';
import { User } from '../Entities/User';

export const leaveTypeAuth = async (request: Request, h: ResponseToolkit) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '731f3f5d2a1a2d2f7f387bcc0e4c29b6dfe2589528b97edb0eba96b009078de7') as any;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: decoded.userId },
      relations: ['role','employee'],
    });

    if (!user || !user.role ||  !user.employee) {
      throw new Error('Unauthorized: User or role not found');
    }

  
    const allowedRoleIds = [1, 2];
    if (!allowedRoleIds.includes(user.role.id)) {
      throw new Error('Forbidden: Insufficient role permission');
    }

 
    (request as any).user = user;

    return h.continue;

  } catch (err: any) {
  
    const code = err.message.includes('Forbidden') ? 403 : 401;
    return h.response({ error: err.message || 'Unauthorized' }).code(code).takeover();
  }
};
