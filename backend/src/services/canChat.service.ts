import { likeRepository } from '../repositories/like.repository.js';
import { blockRepository } from '../repositories/block.repository.js';
import { reportRepository } from '../repositories/report.repository.js';

export type CanChatResult = {
  allowed: boolean;
  reason?: 'not_matched' | 'blocked' | 'reported';
};

export async function canChat(userA: number, userB: number): Promise<CanChatResult> {
  if (userA === userB) {
    return { allowed: false, reason: 'not_matched' };
  }

  const [isBlocked, isReported, mutualLikeAtoB, mutualLikeBtoA] = await Promise.all([
    blockRepository.isBlocked(userA, userB),
    reportRepository.isReported(userA, userB),
    likeRepository.checkLikeExists(userA, userB),
    likeRepository.checkLikeExists(userB, userA),
  ]);

  if (isBlocked) {
    return { allowed: false, reason: 'blocked' };
  }

  if (isReported) {
    return { allowed: false, reason: 'reported' };
  }

  const mutualLike = mutualLikeAtoB && mutualLikeBtoA;
  if (!mutualLike) {
    return { allowed: false, reason: 'not_matched' };
  }

  return { allowed: true };
}
