import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Token sealing for whitelabel bots.
//
// Sealed format: "v1." + base64(iv(12) | authTag(16) | ciphertext), AES-256-GCM,
// AAD = UTF-8 of "whitelabel-token:v1:<guildId>". The AAD binds a sealed token to
// its guild, so a token copied into another guild's document fails to open.
//
// The key is 32 random bytes as base64 text. Production source is only the
// systemd credential file; the env value is a development convenience and is
// honoured only when the caller passes `allowEnv: true`.

/** File name of the systemd credential holding the key. */
export const WHITELABEL_KEY_CREDENTIAL = "whitelabel-token-key";
/** Env variable accepted as key source in development only. */
export const WHITELABEL_KEY_ENV = "WHITELABEL_TOKEN_KEY";

const VERSION_PREFIX = "v1.";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

export type WhitelabelCryptoErrorCode = "key_missing" | "key_invalid" | "decrypt_failed";

export class WhitelabelCryptoError extends Error {
  readonly code: WhitelabelCryptoErrorCode;

  constructor(code: WhitelabelCryptoErrorCode, detail?: string, options?: { cause?: unknown }) {
    super(detail ? `${code}: ${detail}` : code, options);
    this.name = "WhitelabelCryptoError";
    this.code = code;
  }
}

/** Parse a base64 key. Must decode to exactly 32 bytes, else `key_invalid`. Never echoes the input. */
export function parseWhitelabelKey(base64: string): Buffer {
  const trimmed = base64.trim();
  // Canonical only: the alphabet check alone accepts bad padding and non-zero
  // trailing bits, so also require that decode + re-encode reproduces the input.
  if (!BASE64_RE.test(trimmed) || Buffer.from(trimmed, "base64").toString("base64") !== trimmed) {
    throw new WhitelabelCryptoError("key_invalid", "key is not valid base64");
  }
  const key = Buffer.from(trimmed, "base64");
  if (key.length !== KEY_BYTES) {
    throw new WhitelabelCryptoError("key_invalid", `key must be exactly ${KEY_BYTES} bytes`);
  }
  return key;
}

/**
 * Resolve the key. The credential file (`<credentialsDir>/whitelabel-token-key`)
 * wins. The env value is used only when `allowEnv` is true and no credential
 * file exists. An existing but malformed credential never falls back.
 */
export function loadWhitelabelKey(opts: {
  /** Value of CREDENTIALS_DIRECTORY. */
  credentialsDir?: string;
  /** Value of WHITELABEL_TOKEN_KEY. */
  envValue?: string;
  /** True only in development. */
  allowEnv: boolean;
}): Buffer {
  if (opts.credentialsDir) {
    let raw: string | null = null;
    try {
      raw = readFileSync(join(opts.credentialsDir, WHITELABEL_KEY_CREDENTIAL), "utf8");
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
        // Keep the original errno (EACCES, EISDIR, ...) as `cause` for diagnosis.
        throw new WhitelabelCryptoError("key_missing", "credential file is unreadable", { cause: e });
      }
    }
    if (raw !== null) return parseWhitelabelKey(raw);
  }
  if (opts.allowEnv && opts.envValue && opts.envValue.trim() !== "") {
    return parseWhitelabelKey(opts.envValue);
  }
  throw new WhitelabelCryptoError("key_missing", "no whitelabel token key available");
}

function assertKey(key: Buffer): void {
  if (key.length !== KEY_BYTES) {
    throw new WhitelabelCryptoError("key_invalid", `key must be exactly ${KEY_BYTES} bytes`);
  }
}

function aadFor(guildId: string): Buffer {
  return Buffer.from(`whitelabel-token:v1:${guildId}`, "utf8");
}

/** Seal a bot token for one guild. A fresh random IV is used per call. */
export function sealWhitelabelToken(key: Buffer, plain: string, guildId: string): string {
  assertKey(key);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(aadFor(guildId));
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return VERSION_PREFIX + Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

/** Open a sealed token. Any failure (version, shape, key, AAD, tamper) is `decrypt_failed`. */
export function openWhitelabelToken(key: Buffer, sealed: string, guildId: string): string {
  assertKey(key);
  if (!sealed.startsWith(VERSION_PREFIX)) {
    throw new WhitelabelCryptoError("decrypt_failed", "unknown sealed token version");
  }
  const body = sealed.slice(VERSION_PREFIX.length);
  if (!BASE64_RE.test(body)) {
    throw new WhitelabelCryptoError("decrypt_failed", "sealed token is malformed");
  }
  const raw = Buffer.from(body, "base64");
  if (raw.length < IV_BYTES + TAG_BYTES) {
    throw new WhitelabelCryptoError("decrypt_failed", "sealed token is too short");
  }
  const iv = raw.subarray(0, IV_BYTES);
  const tag = raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = raw.subarray(IV_BYTES + TAG_BYTES);
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAAD(aadFor(guildId));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new WhitelabelCryptoError("decrypt_failed", "authentication failed");
  }
}

/** New instance id: `wl_` + 24 lowercase hex chars. Unrelated to the guild id. */
export function newInstanceId(): string {
  return `wl_${randomBytes(12).toString("hex")}`;
}
