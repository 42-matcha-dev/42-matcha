import express from 'express';
import { tagService } from '../services/tag.service.js';

type Response = express.Response;

export const getTags = async (_req: express.Request, res: Response) => {
  try {
    const tags = await tagService.getAllTags();
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

