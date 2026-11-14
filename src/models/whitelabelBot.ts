import { Schema, type Model } from "mongoose";
import type { IWhitelabelBot } from "$types";

export const WHITELABEL_COLLECTION = "whitelabelBots";

/**
 * Crypto the consuming app injects. The factory never imports the crypto
 * helpers itself, so the key source (systemd credential, dev env) stays in the
 * app. `guildId` is bound into the seal as AAD, so a sealed token copied into
 * another guild's document fails to open.
 */
export interface WhitelabelBotSchemaOptions {
  seal: (plain: string, guildId: string) => string;
  open: (sealed: string, guildId: string) => string;
}

export interface WhitelabelBotMethods {
  /** Seals `plain` with this document's `guildId` and stores it in `token`. */
  setToken(plain: string): void;
  /** Opens the sealed token. Throws if `token` was not selected or is null. */
  readToken(): string;
}

type WhitelabelBotModel = Model<IWhitelabelBot, {}, WhitelabelBotMethods>;

/**
 * Build the shared `whitelabelBots` schema. `token` is `select: false` and is
 * stripped from `toJSON`/`toObject`, so the sealed value only leaves the DB
 * layer when a query explicitly selects it (`.select("+token")`). Consumers
 * still own the `models.WhitelabelBot ? ... : model(...)` singleton guard.
 */
export function makeWhitelabelBotSchema(
  opts: WhitelabelBotSchemaOptions,
): Schema<IWhitelabelBot, WhitelabelBotModel, WhitelabelBotMethods> {
  const { seal, open } = opts;

  const stripToken = (_doc: unknown, ret: Record<string, unknown>) => {
    delete ret.token;
    return ret;
  };

  const schema = new Schema<IWhitelabelBot, WhitelabelBotModel, WhitelabelBotMethods>(
    {
      instanceId: { type: String, required: true, unique: true },
      guildId: { type: String, required: true, unique: true },
      applicationId: { type: String, default: null },
      botUserId: { type: String, default: null },
      token: { type: String, default: null, select: false },
      mode: { type: String, enum: ["main", "whitelabel"], default: "main" },
      desiredStatus: { type: String, enum: ["running", "stopped"], default: "stopped" },
      failure: {
        type: new Schema(
          {
            reason: {
              type: String,
              required: true,
              enum: [
                "token_invalid",
                "disallowed_intents",
                "not_in_guild",
                "removed_from_guild",
                "decrypt_failed",
                "mode_not_whitelabel",
              ],
            },
            detail: { type: String },
            at: { type: Date, required: true },
          },
          { _id: false },
        ),
        default: null,
      },
      commandsHash: { type: String, default: null },
      presence: {
        type: new Schema(
          {
            status: {
              type: String,
              required: true,
              enum: ["online", "idle", "dnd", "invisible"],
            },
            activity: {
              type: new Schema(
                {
                  type: {
                    type: String,
                    required: true,
                    enum: ["custom", "playing", "listening", "watching", "competing"],
                  },
                  text: { type: String, required: true, maxlength: 128 },
                },
                { _id: false },
              ),
              default: null,
            },
          },
          { _id: false },
        ),
        default: null,
      },
    },
    {
      collection: WHITELABEL_COLLECTION,
      timestamps: true,
      toJSON: { flattenMaps: true, flattenObjectIds: true, transform: stripToken },
      toObject: { flattenMaps: true, flattenObjectIds: true, transform: stripToken },
    },
  );

  // One application can back at most one guild. Documents without a token yet
  // carry applicationId null, which the partial filter keeps out of the index.
  schema.index(
    { applicationId: 1 },
    { unique: true, partialFilterExpression: { applicationId: { $type: "string" } } },
  );

  schema.method("setToken", function setToken(this: IWhitelabelBot, plain: string) {
    this.token = seal(plain, this.guildId);
  });

  schema.method("readToken", function readToken(this: IWhitelabelBot): string {
    if (!this.token) {
      throw new Error("whitelabel token not loaded: select('+token') and check it is set");
    }
    return open(this.token, this.guildId);
  });

  return schema;
}
