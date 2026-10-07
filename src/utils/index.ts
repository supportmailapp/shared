// Pure, portable utilities shared across the SupportMail ecosystem.
//
// HARD RULE: zero env access, zero crypto, zero I/O, zero runtime-specific
// APIs. Must run identically under Bun, Node, and CF Workers. Anything that
// touches `process.env`, `$env/*`, node:crypto, or the filesystem belongs in
// the consuming app, not here.

import type { DaySchedule } from "$types/database/schedule.js";
import type { ReportDMSettings } from "$types/database/guild.js";
import { ReportDMField, ReportStatus } from "$types/utils/enums.js";

/** Discord snowflakes are 17–20 digit numeric strings. */
export function isSnowflake(v: string): boolean {
  return /^\d{17,20}$/.test(v);
}

/**
 * Does the `1 << n` operation.
 *
 * Example: You wanna check if bit 3 is set in a bitfield, you can do:
 * ```ts
 * const bitToCheck = bitfieldBit(3); // 8
 * if (bitfield & bitToCheck) {
 *   // Bit 3 is set
 * }
 * ```
 */
export function bitfieldBit(n: number | bigint | string): bigint {
  return BigInt(1) << BigInt(n);
}

export const createDefaultSchedule = (): DaySchedule[] =>
  (["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => ({
    day,
    timeSlots: [],
  }));

/** All resolve statuses (every status except `open`). */
export const REPORT_RESOLVE_STATUSES = [
  ReportStatus.ignored,
  ReportStatus.timeouted,
  ReportStatus.kicked,
  ReportStatus.banned,
  ReportStatus.messageDeleted,
  ReportStatus.resolved,
] as const;

/**
 * Fields that may appear in each report DM kind.
 *
 * The reported user never learns who reported them, nor which moderator acted.
 */
export const ALLOWED_REPORT_DM_FIELDS = {
  onCreate: [
    ReportDMField.ReportId,
    ReportDMField.ReportedUser,
    ReportDMField.Reason,
    ReportDMField.ReportedMessage,
    ReportDMField.Comment,
  ],
  onResolve: [
    ReportDMField.ReportId,
    ReportDMField.ReportedUser,
    ReportDMField.Reason,
    ReportDMField.ReportedMessage,
    ReportDMField.Comment,
    ReportDMField.Action,
    ReportDMField.ActionDuration,
    ReportDMField.Moderator,
    ReportDMField.ResolveComment,
  ],
  reportedUser: [
    ReportDMField.ReportId,
    ReportDMField.Reason,
    ReportDMField.ReportedMessage,
    ReportDMField.Action,
    ReportDMField.ActionDuration,
    ReportDMField.ResolveComment,
  ],
} as const satisfies Record<keyof ReportDMSettings, readonly ReportDMField[]>;

/**
 * Statuses that may trigger each report DM kind.
 *
 * The reported user is never told about an ignored report - from their side
 * nothing happened.
 */
export const ALLOWED_REPORT_DM_STATUSES = {
  onResolve: REPORT_RESOLVE_STATUSES,
  reportedUser: REPORT_RESOLVE_STATUSES.filter((s) => s !== ReportStatus.ignored),
} as const;

/**
 * Defaults for `guild.reportConfig.dmSettings`.
 *
 * `onCreate`/`onResolve` mirror the pre-`dmSettings` behavior (creation DM was
 * always sent); the reported-user DM is opt-in.
 */
export const createDefaultReportDMSettings = (): ReportDMSettings => ({
  onCreate: {
    enabled: true,
    fields: [ReportDMField.ReportId, ReportDMField.ReportedUser],
  },
  onResolve: {
    enabled: true,
    fields: [ReportDMField.ReportId, ReportDMField.Action],
    statuses: [...ALLOWED_REPORT_DM_STATUSES.onResolve],
  },
  reportedUser: {
    enabled: false,
    fields: [ReportDMField.Action, ReportDMField.ActionDuration, ReportDMField.Reason],
    statuses: [ReportStatus.timeouted, ReportStatus.kicked, ReportStatus.banned],
  },
});

export * from "./validators.js";
export * from "./tagAccess.js";
