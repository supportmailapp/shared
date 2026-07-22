// Pure, portable utilities shared across the SupportMail ecosystem.
//
// HARD RULE: zero env access, zero crypto, zero I/O, zero runtime-specific
// APIs. Must run identically under Bun, Node, and CF Workers. Anything that
// touches `process.env`, `$env/*`, node:crypto, or the filesystem belongs in
// the consuming app, not here.

/** Discord snowflakes are 17–20 digit numeric strings. */
export function isSnowflake(v: string): boolean {
  return /^\d{17,20}$/.test(v);
}
