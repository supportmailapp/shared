import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

  it("parseWhitelabelKey rejects non-canonical and non-base64 input", () => {
    const good = Buffer.alloc(32, 9).toString("base64");
    expect(good.endsWith("=")).toBe(true);
    expect(parseWhitelabelKey(`  ${good}\n`).length).toBe(32);
    // not base64 at all, url-safe alphabet, inner whitespace, empty
    for (const bad of [
      "not base64!",
      "%%%%",
      `${good.slice(0, 20)}-_${good.slice(22)}`,
      `${good.slice(0, 10)} ${good.slice(10)}`,
      "",
    ]) {
      expect(() => parseWhitelabelKey(bad)).toThrow(/key_invalid/);
    }
    // missing padding, extra padding, non-zero trailing bits (still decodes to 32 bytes leniently)
    expect(() => parseWhitelabelKey(good.slice(0, -1))).toThrow(/key_invalid/);
    expect(() => parseWhitelabelKey(`${good}=`)).toThrow(/key_invalid/);
    expect(() => parseWhitelabelKey(`${good.slice(0, 42)}B=`)).toThrow(/key_invalid/);
    expect(() => parseWhitelabelKey(Buffer.alloc(33).toString("base64"))).toThrow(/key_invalid/);
  });

  it("parseWhitelabelKey never echoes the input", () => {
    try {
      parseWhitelabelKey("super-secret-not-base64!");
      expect.unreachable();
    } catch (e) {
      expect((e as Error).message).not.toContain("super-secret");
    }
  });

  it("seal and open reject a key that is not 32 bytes", () => {
    const sealed = sealWhitelabelToken(key, "a", "1");
    for (const len of [0, 16, 31, 33, 64]) {
      const bad = Buffer.alloc(len, 7);
      expect(() => sealWhitelabelToken(bad, "a", "1")).toThrow(/key_invalid/);
      expect(() => openWhitelabelToken(bad, sealed, "1")).toThrow(/key_invalid/);
    }
  });

  it("loadWhitelabelKey rejects a malformed credential file and does not fall back to env", () => {
    const dir = mkdtempSync(join(tmpdir(), "wl-key-"));
    try {
      const envValue = Buffer.alloc(32, 1).toString("base64");
      for (const content of ["", "\n", "garbage!!", Buffer.alloc(16).toString("base64")]) {
        writeFileSync(join(dir, WHITELABEL_KEY_CREDENTIAL), content);
        expect(() => loadWhitelabelKey({ credentialsDir: dir, envValue, allowEnv: true })).toThrow(/key_invalid/);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loadWhitelabelKey keeps the original errno as cause when the file is unreadable", () => {
    const dir = mkdtempSync(join(tmpdir(), "wl-key-"));
    try {
      // A directory in place of the file: readFileSync fails with EISDIR, not ENOENT.
      mkdirSync(join(dir, WHITELABEL_KEY_CREDENTIAL));
      try {
        loadWhitelabelKey({ credentialsDir: dir, allowEnv: false });
        expect.unreachable();
      } catch (e) {
        expect(e).toBeInstanceOf(WhitelabelCryptoError);
        expect((e as WhitelabelCryptoError).code).toBe("key_missing");
        const cause = (e as Error).cause as NodeJS.ErrnoException;
        expect(cause).toBeInstanceOf(Error);
        expect(cause.code).toBeTruthy();
        expect(cause.code).not.toBe("ENOENT");
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
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
