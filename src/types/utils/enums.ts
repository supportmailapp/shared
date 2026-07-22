export enum ReportNotificationType {
  ActionTaken = 0,
  ReportSummary = 1,
  ModeratorInfo = 2,
}

export const BlacklistScopes = {
  global: 1 << 0, // 1
  tickets: 1 << 1, // 2
  reports: 1 << 2, // 4
  tags: 1 << 3, // 8
};

export const BlacklistScopesMap = {
  [BlacklistScopes.global.toString()]: "global",
  [BlacklistScopes.tickets.toString()]: "tickets",
  [BlacklistScopes.reports.toString()]: "reports",
  [BlacklistScopes.tags.toString()]: "tags",
} as const;

export const MinBlacklistScope = BlacklistScopes.tickets;
export const MaxBlacklistScope = BlacklistScopes.tags;

export enum ReportStatus {
  ignored = 0,
  open = 1,
  timeouted = 2,
  kicked = 3,
  banned = 4,
  messageDeleted = 5,
  resolved = 6, // Resolved without any further action
}

export enum TicketStatus {
  closed = 0,
  open = 1,
  closeRequested = 2,
}

export enum TicketState {
  unanswered = 1,
  pendingQR = 2,
  uResponded = 3,
  awaitingRes = 4,
}

export enum SpecialChannelType {
  Category = 0,
  Channel = 1,
}

export enum ClientAPIErrorCodes {
  MissingPermissions = 0,
  CategoryCreateFailed = 1,
  ForumCreationFailed = 2,
  GuildNotFound = 3,
  CommunityNotEnabled = 4,
  CategoryNotFound = 5,
}

/**
 * An enum representing the type of entity.
 */
export enum EntityType {
  role = 0,
  user = 1,
  guild = 2,
}

export enum LogEventType {
  TestEvent = "testEvent",

  InternalConfigLoad = "internalConfigLoad",

  TicketCreated = "ticketCreate",
  TicketClosed = "ticketClose",
  TicketReopened = "ticketReopen",
  TicketDeleted = "ticketDelete",
}

export enum UserRole {
  /**
   * Represents a regular user with no special permissions.
   *
   * This is the default role when no role is given.
   */
  User = 0,
  /**
   * Represents a user with administrative permissions.
   */
  Admin = 1,
  /**
   * Represents a user with permissions to moderate and manage appeals as well as reports.
   */
  Moderator = 2,
}
