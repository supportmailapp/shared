import { ReportStatus } from "../utils/enums.js";

export interface IReport {
  reportId: string;
  userId: string;
  guildId: string;
  authorId: string;
  reason: string;
  /**
   * The log message associated with the report.
   *
   * Format: `"channelId-messageId"`
   */
  logMessage?: string;
  /**
   * The reported message reference.
   *
   * Format: `"channelId-messageId"`
   */
  message?: string;
  status: ReportStatus;
  comment?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolveComment?: string;
  attachments?: {};
  createdAt: Date;
  updatedAt: Date;
}
