import { Schema } from "mongoose";
import type { IUserToken } from "$types";

/**
 * Env-specific bits the consuming app must inject. The shared package never
 * reads env or does crypto itself — v2 (Bun, `process.env`) and dashboard
 * (SvelteKit, `$env/static/private`) resolve their key differently, and the
 * import mechanisms are not portable. So the app owns encrypt/decrypt.
 */
export interface UserTokenSchemaOptions {
  encrypt: (plain: string) => string;
  decrypt: (encoded: string) => string;
}

/**
 * Build the shared `userTokens` schema. The `accessToken` / `refreshToken`
 * getters/setters call the injected crypto so ciphertext never leaves the DB
 * layer. Consumers still own the `models.UserToken ? model(...) : model(...)`
 * singleton guard (per-process, breaks across two mongoose instances — hence
 * mongoose is a peerDependency).
 */
export function makeUserTokenSchema(opts: UserTokenSchemaOptions): Schema<IUserToken> {
  const { encrypt, decrypt } = opts;

  return new Schema<IUserToken>(
    {
      userId: { type: String, required: true, unique: true },
      accessToken: {
        type: String,
        required: true,
        set: (v: string) => (v ? encrypt(v) : v),
        get: (v: string) => (v ? decrypt(v) : v),
      },
      refreshToken: {
        type: String,
        default: null,
        set: (v: string | null) => (v ? encrypt(v) : null),
        get: (v: string | null) => (v ? decrypt(v) : v),
      },
      expiresAt: { type: Date, required: true },
      clearance: { type: String, enum: ["user","admin"], default: "user" }
    },
    {
      timestamps: true,
      toJSON: { flattenMaps: true, flattenObjectIds: true, getters: true },
      toObject: { flattenMaps: true, flattenObjectIds: true, getters: true },
    },
  );
}
