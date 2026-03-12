import { reportRepository, type ReportReason } from '../repositories/report.repository.js';

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
