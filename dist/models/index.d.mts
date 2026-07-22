import { t as IUserToken } from "../index-Dms9iMxW.mjs";
import { Schema } from "mongoose";
//#region src/models/userTokens.d.ts
/**
 * Env-specific bits the consuming app must inject. The shared package never
 * reads env or does crypto itself — v2 (Bun, `process.env`) and dashboard
 * (SvelteKit, `$env/static/private`) resolve their key differently, and the
 * import mechanisms are not portable. So the app owns encrypt/decrypt.
 */
interface UserTokenSchemaOptions {
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
declare function makeUserTokenSchema(opts: UserTokenSchemaOptions): Schema<IUserToken>;
//#endregion
export { type UserTokenSchemaOptions, makeUserTokenSchema };