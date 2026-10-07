// Tag rule set semantics. Pure: type-only imports, no env, no I/O.
// Single source of truth for v2 enforcement; see the tag-rule-sets spec.

import type { ITagRuleSet } from "$types/database/tagRuleSet.js";

/** Max rule sets per guild. */
export const TAG_RULE_SET_LIMIT = 10;

export type TagAccessContext = {
  /** Must include the guild ID (`@everyone`). */
  memberRoleIds: ReadonlySet<string>;
  /** `[channelId, parentId?, categoryId?]`. A thread's parent channel and that channel's category. */
  channelChain: readonly string[];
  isTicket: boolean;
};

export type TagAccessDenyReason = "role" | "channel" | "missingSet";

export type TagAccessResult = { ok: true; forceHidden: boolean } | { ok: false; reason: TagAccessDenyReason };

/** A new rule set: no restriction until an admin narrows it. */
export function createDefaultTagRuleSet(guildId: string, name: string): Omit<ITagRuleSet, "_id"> {
  return { name, roles: [guildId], tickets: true, channelMode: "all", channels: [], forceHidden: false };
}

/** Equivalent of the removed `ITag.onlyTickets: true`. */
export function createTicketsOnlyTagRuleSet(guildId: string): Omit<ITagRuleSet, "_id"> {
  return { ...createDefaultTagRuleSet(guildId, "Tickets only"), channelMode: "none" };
}

function isLocationAllowed(set: ITagRuleSet, ctx: TagAccessContext): boolean {
  if (ctx.isTicket) return set.tickets;
  switch (set.channelMode) {
    case "all":
      return true;
    case "none":
      return false;
    case "selected":
      return ctx.channelChain.some((id) => set.channels.includes(id));
  }
}

/**
 * Decides whether a member may use a tag governed by `set` in the given context.
 * A missing set denies (fail closed). Public tags (`ruleSetId === null`) must not call this.
 */
export function evaluateTagAccess(set: ITagRuleSet | null | undefined, ctx: TagAccessContext): TagAccessResult {
  if (!set) return { ok: false, reason: "missingSet" };
  if (!set.roles.some((id) => ctx.memberRoleIds.has(id))) return { ok: false, reason: "role" };
  if (!isLocationAllowed(set, ctx)) return { ok: false, reason: "channel" };
  return { ok: true, forceHidden: set.forceHidden };
}
