import { Request, ResponseToolkit } from '@hapi/hapi';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-sources';
import { User } from '../Entities/User';

export const validateAdminOrHRForTeam = {
  method: async (request: Request, h: ResponseToolkit) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid token');
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as any;

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: decoded.userId },
        relations: ['role'],
      });

      if (!user || ![1, 2].includes(user.role.id)) {
        throw new Error('Forbidden: Admin or HR only');
      }

      (request as any).user = user;
      return h.continue;

    } catch (err: any) {
      return h.response({ error: err.message }).code(403).takeover();
    }
  },
  assign: 'teamPermission',
};
