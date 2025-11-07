import { tagRepository } from '../repositories/tag.repository.js';

export const tagService = {
  getAllTags: async () => {
    return await tagRepository.getAllTags();
  },
};

