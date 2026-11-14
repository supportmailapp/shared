/** Who serves a guild: the shared main bot, or the guild's own whitelabel bot. */
export type WhitelabelMode = "main" | "whitelabel";

/** What the owner/guild asked for. The live state is reported by the manager, not stored here. */
export type WhitelabelDesiredStatus = "running" | "stopped";

export type WhitelabelFailureReason =
  | "token_invalid"
  | "disallowed_intents"
  | "not_in_guild"
  | "removed_from_guild"
  | "decrypt_failed"
  | "mode_not_whitelabel";

/** Bot status shown in the member list. `invisible` appears offline. */
export type WhitelabelPresenceStatus = "online" | "idle" | "dnd" | "invisible";

/** Activity types offered for a whitelabel bot. No streaming. */
export type WhitelabelActivityType = "custom" | "playing" | "listening" | "watching" | "competing";

export interface WhitelabelPresence {
  status: WhitelabelPresenceStatus;
  activity: { type: WhitelabelActivityType; text: string } | null;
}

export interface IWhitelabelFailure {
  reason: WhitelabelFailureReason;
  detail?: string;
  at: Date;
}

export interface IWhitelabelBot {
  /** `wl_` + 24 lowercase hex chars. Never the guild id. */
  instanceId: string;
  guildId: string;
  applicationId: string | null;
  botUserId: string | null;
  /** Sealed token (`v1.<base64>`); never selected by default. */
  token: string | null;
  mode: WhitelabelMode;
  desiredStatus: WhitelabelDesiredStatus;
  failure: IWhitelabelFailure | null;
  /** sha256 of the last registered command body. */
  commandsHash: string | null;
  /** Presence the instance sets on connect. `null` = default presence (see `WHITELABEL_DEFAULT_PRESENCE`). */
  presence: WhitelabelPresence | null;
  createdAt: Date;
  updatedAt: Date;
}
