import express from 'express';
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { reportService } from '../services/report.service.js';

type Response = express.Response;

export const reportUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const reportedId = parseInt(req.params.userId, 10);
    if (isNaN(reportedId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { reason, description } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'reason is required' });
    }

    const result = await reportService.reportUser(req.user.userId, reportedId, reason, description);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Cannot report yourself') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Invalid report reason') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'You have already reported this user') {
        return res.status(409).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getMyReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }
    const reports = await reportService.getMyReports(req.user.userId);
    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};
