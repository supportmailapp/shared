import type { WhitelabelMode, WhitelabelPresence } from "./database/whitelabelBot.js";

/** Outcome of re-sending the panel through the other bot after a mode switch. */
export type PanelResendResult = {
  status: "sent" | "skipped" | "failed";
  reason?: string;
  oldMessageDeleted?: boolean;
};

/** Body sm-api returns when a Discord call made with a whitelabel token fails. */
export type WhitelabelDiscordErrorBody = {
  error: "discord_error";
  discord: { status: number; code: number; message: string };
};

/** Which bot serves a guild right now. Ids are null until a token was submitted. */
export type WhitelabelModeInfo = {
  mode: WhitelabelMode;
  botUserId: string | null;
  applicationId: string | null;
};

/** How a switch back from the whitelabel bot to the main bot is carried out. */
export type WhitelabelSwitchVariant = "graceful" | "semi_forced" | "forced";

/** Presence used when a whitelabel bot has `presence: null`. */
export const WHITELABEL_DEFAULT_PRESENCE: WhitelabelPresence = {
  status: "online",
  activity: { type: "custom", text: "DM to talk to moderators" },
};

/** Profile fields of a whitelabel bot that can be changed through Discord. */
export type WhitelabelProfileField = "username" | "avatar" | "banner" | "bio";

/** The bot's current Discord profile. `bio` is the application description. */
export interface WhitelabelProfile {
  username: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string;
}

export interface WhitelabelBranding {
  profile: WhitelabelProfile;
  presence: WhitelabelPresence | null;
}

/** Partial profile update. Images are data URIs; `null` removes the image. */
export interface WhitelabelProfileUpdate {
  username?: string;
  avatar?: string | null;
  banner?: string | null;
  bio?: string;
}

/** One failed Discord call of a profile update, with the fields it covered. */
export interface WhitelabelProfileFailure {
  fields: WhitelabelProfileField[];
  status: number;
  code: number;
  message: string;
  /** Seconds, when Discord ratelimited the call. */
  retryAfter?: number;
}

export interface WhitelabelProfileUpdateResult {
  applied: WhitelabelProfileField[];
  failed: WhitelabelProfileFailure[];
  profile: WhitelabelProfile;
}

/** `applied`: saved and set live. `saved`: saved, bot not running. `saved_not_applied`: saved, live apply failed. */
export type WhitelabelPresenceOutcome = "applied" | "saved" | "saved_not_applied";

export interface WhitelabelPresenceResult {
  result: WhitelabelPresenceOutcome;
  presence: WhitelabelPresence | null;
}
