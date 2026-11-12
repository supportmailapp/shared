import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WHITELABEL_KEY_CREDENTIAL,
  WhitelabelCryptoError,
  loadWhitelabelKey,
  newInstanceId,
  openWhitelabelToken,
  parseWhitelabelKey,
  sealWhitelabelToken,
} from "./whitelabelCrypto.js";

const key = Buffer.alloc(32, 7);

describe("whitelabel token crypto", () => {
  it("round-trips", () => {
    const s = sealWhitelabelToken(key, "tok.en", "111111111111111111");
    expect(s.startsWith("v1.")).toBe(true);
    expect(openWhitelabelToken(key, s, "111111111111111111")).toBe("tok.en");
  });

  it("uses a fresh iv per seal", () => {
    expect(sealWhitelabelToken(key, "a", "1")).not.toBe(sealWhitelabelToken(key, "a", "1"));
  });

  it("rejects another guild id (AAD)", () => {
    const s = sealWhitelabelToken(key, "a", "111111111111111111");
    expect(() => openWhitelabelToken(key, s, "222222222222222222")).toThrow(WhitelabelCryptoError);
  });

  it("rejects a wrong key, a tampered byte and an unknown version", () => {
    const s = sealWhitelabelToken(key, "a", "1");
    expect(() => openWhitelabelToken(Buffer.alloc(32, 8), s, "1")).toThrow(/decrypt_failed|decrypt/);
    expect(() => openWhitelabelToken(key, s.slice(0, -2) + "AA", "1")).toThrow(WhitelabelCryptoError);
    expect(() => openWhitelabelToken(key, "v2." + s.slice(3), "1")).toThrow(WhitelabelCryptoError);
  });

  it("errors carry a code and the message starts with it", () => {
    const s = sealWhitelabelToken(key, "a", "1");
    try {
      openWhitelabelToken(key, s, "2");
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(WhitelabelCryptoError);
      expect((e as WhitelabelCryptoError).code).toBe("decrypt_failed");
      expect((e as Error).message.startsWith("decrypt_failed")).toBe(true);
    }
  });

  it("rejects truncated input", () => {
    expect(() => openWhitelabelToken(key, "v1.AAAA", "1")).toThrow(WhitelabelCryptoError);
  });

  it("parseWhitelabelKey accepts 32 bytes only", () => {
    expect(parseWhitelabelKey(Buffer.alloc(32).toString("base64")).length).toBe(32);
    expect(() => parseWhitelabelKey(Buffer.alloc(16).toString("base64"))).toThrow(/key_invalid|32/);
  });

  it("loadWhitelabelKey prefers the credential file, trims whitespace", () => {
    const dir = mkdtempSync(join(tmpdir(), "wl-key-"));
    try {
      const fileKey = Buffer.alloc(32, 5);
      writeFileSync(join(dir, WHITELABEL_KEY_CREDENTIAL), `${fileKey.toString("base64")}\n`);
      const envValue = Buffer.alloc(32, 1).toString("base64");
      const loaded = loadWhitelabelKey({ credentialsDir: dir, envValue, allowEnv: true });
      expect(loaded.equals(fileKey)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loadWhitelabelKey throws key_missing when the credential dir has no file", () => {
    const dir = mkdtempSync(join(tmpdir(), "wl-key-"));
    try {
      expect(() => loadWhitelabelKey({ credentialsDir: dir, allowEnv: false })).toThrow(/key_missing/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loadWhitelabelKey ignores the env value unless allowEnv", () => {
    const envValue = Buffer.alloc(32, 1).toString("base64");
    expect(() => loadWhitelabelKey({ envValue, allowEnv: false })).toThrow(/key_missing/);
    expect(loadWhitelabelKey({ envValue, allowEnv: true }).length).toBe(32);
  });

  it("newInstanceId matches /^wl_[0-9a-f]{24}$/ and differs between calls", () => {
    const a = newInstanceId();
    const b = newInstanceId();
    expect(a).toMatch(/^wl_[0-9a-f]{24}$/);
    expect(b).toMatch(/^wl_[0-9a-f]{24}$/);
    expect(a).not.toBe(b);
  });
});
