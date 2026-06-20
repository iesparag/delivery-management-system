import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets must be defined');
}

interface AuthRequest extends Request {
  userId?: number;
  tenantId?: number;
  roleName?: string;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing or invalid' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid' });
    }

    req.userId = user?.id;
    req.tenantId = user?.tenantId;
    req.roleName = user?.role;
    next();
  });
};

export const roleBasedAccess = (allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.roleName || !allowedRoles.includes(req.roleName)) {
    return res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
  }

  next();
};
