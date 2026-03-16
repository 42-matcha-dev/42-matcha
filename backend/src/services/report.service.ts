import { reportRepository, type ReportReason } from '../repositories/report.repository.js';
import { likeRepository } from '../repositories/like.repository.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { blockRepository } from '../repositories/block.repository.js';
import { notificationService } from './notification.service.js';


const VALID_REASONS: ReportReason[] = ['FAKE_ACCOUNT', 'SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'OTHER'];

export const reportService = {
  reportUser: async (reporterId: number, reportedId: number, reason: ReportReason, description?: string) => {
    if (reporterId === reportedId) {
      throw new Error('Cannot report yourself');
    }

    if (!VALID_REASONS.includes(reason)) {
      throw new Error('Invalid report reason');
    }

    const exists = await reportRepository.checkReportExists(reporterId, reportedId);
    if (exists) {
      throw new Error('You have already reported this user');
    }

    const report = await reportRepository.createReport(reporterId, reportedId, reason, description);

    const alreadyBlocked = await blockRepository.checkBlockExists(reporterId, reportedId);
    if (!alreadyBlocked) {
      await blockRepository.createBlock(reporterId, reportedId);
    }
    await Promise.all([
      likeRepository.removeLike(reporterId, reportedId),
      likeRepository.removeLike(reportedId, reporterId),
    ]);
    await conversationRepository.removeConversation(reporterId, reportedId);

    await Promise.all([
      notificationService.deleteByActorAndType(reporterId, reportedId, "LIKE"),
      notificationService.deleteByActorAndType(reportedId, reporterId, "LIKE"),
      notificationService.deleteByActorAndType(reporterId, reportedId, "MATCH"),
      notificationService.deleteByActorAndType(reportedId, reporterId, "MATCH"),
      notificationService.deleteByActorAndType(reporterId, reportedId, "VIEW"),
      notificationService.deleteByActorAndType(reportedId, reporterId, "VIEW"),
    ]);

    return {
      success: true,
      message: 'User reported successfully',
      report,
    };
  },

  getMyReports: async (reporterId: number) => {
    return reportRepository.getReportsByUser(reporterId);
  },
};
