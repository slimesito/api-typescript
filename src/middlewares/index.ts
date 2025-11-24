import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AnyZodObject, ZodError } from 'zod';
import { apiResponse } from '../core/utils';
import { config } from '../config'; 

// --- 1. Se define una interfaz personalizada ---
// Esto extiende la Request normal de Express para agregarle 'user'
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return apiResponse(res, null, 'No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // --- 2. Se hace "Casting" explícito ---
    (req as AuthRequest).user = decoded as any;
    
    next();
  } catch (error) {
    return apiResponse(res, null, 'Invalid or expired token', 401);
  }
};

export const validateRequest = (schema: AnyZodObject) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          status: 422,
          message: 'Validation Error',
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      return res.status(400).json({ message: 'Invalid request data' });
    }
};