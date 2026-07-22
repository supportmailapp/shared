// Pure, portable utilities shared across the SupportMail ecosystem.
//
// HARD RULE: zero env access, zero crypto, zero I/O, zero runtime-specific
// APIs. Must run identically under Bun, Node, and CF Workers. Anything that
// touches `process.env`, `$env/*`, node:crypto, or the filesystem belongs in
// the consuming app, not here.

import type { DaySchedule } from "$types/database/schedule.js";

/** Discord snowflakes are 17–20 digit numeric strings. */
export function isSnowflake(v: string): boolean {
  return /^\d{17,20}$/.test(v);
}

/**
 * Does the `1 << n` operation.
 *
 * Example: You wanna check if bit 3 is set in a bitfield, you can do:
 * ```ts
 * const bitToCheck = bitfieldBit(3); // 8
 * if (bitfield & bitToCheck) {
 *   // Bit 3 is set
 * }
 * ```
 */
export function bitfieldBit(n: number | bigint | string): bigint {
  return BigInt(1) << BigInt(n);
}

export const createDefaultSchedule = (): DaySchedule[] =>
  (["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => ({
    day,
    timeSlots: [],
  }));

export * from "./validators.js";
