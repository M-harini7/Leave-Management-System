import { Request, ResponseToolkit } from '@hapi/hapi';
import jwt from 'jsonwebtoken';
import { AuthPayload,JwtPayload } from '../types';

export const requireAuth = async (req: Request, h: ResponseToolkit) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return h.response({ message: 'Unauthorized' }).code(401).takeover();

  const token = authHeader.split(' ')[1];
  if (!token) return h.response({ message: 'Unauthorized' }).code(401).takeover();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user = { userId: decoded.userId, role: decoded.role };
    return h.continue;
  } catch {
    return h.response({ message: 'Invalid Token' }).code(403).takeover();
  }
};
export const verifyToken = async (request: Request, h: ResponseToolkit) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new Error("Token required");

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    request.auth.credentials = decoded;
    return h.continue;
  } catch (err) {
    return h.response({ message: "Unauthorized" }).code(401).takeover();
  }
};