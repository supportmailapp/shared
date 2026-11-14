import type { WhitelabelMode } from "./database/whitelabelBot.js";

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
