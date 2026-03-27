import type { Request, Response, NextFunction } from 'express';
import multer from 'multer'
import { verifyToken, extractTokenFromHeader, type JWTPayload } from '../utils/jwt.util.js';
import { pendingUserRepository } from '../repositories/pending_user.repository.js';

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).single('image')

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).array('images', 5)

export interface UploadAuthenticatedRequest extends Request {
  user?: JWTPayload;
  pendingUser?: number;
}

export const uploadAuth = async (
  req: UploadAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Try JWT first
    const authHeader = req.headers.authorization;
    const jwtToken = extractTokenFromHeader(authHeader);
    if (jwtToken) {
      const decoded = verifyToken(jwtToken);
      req.user = decoded;
      return next();
    }

    // 2. Try pending registration token
    const pendingToken = req.query.token as string;
    if (pendingToken) {
      const pendingUser = await pendingUserRepository.findByToken(pendingToken);

      if (pendingUser) {
        req.pendingUser = pendingUser;
        return next();
      }
    }

    return res.status(401).json({ error: "Unauthorized upload" });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};