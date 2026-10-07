import { describe, expect, it } from "vitest";
import type { ITagRuleSet } from "../types/database/tagRuleSet.js";
import {
  createDefaultTagRuleSet,
  createTicketsOnlyTagRuleSet,
  evaluateTagAccess,
  TAG_RULE_SET_LIMIT,
  type TagAccessContext,
} from "./tagAccess.js";

const GUILD = "100000000000000001";
const STAFF_ROLE = "200000000000000002";
const STAFF_CH = "300000000000000003";
const CATEGORY = "400000000000000004";
const OTHER_CH = "500000000000000005";
const THREAD = "600000000000000006";
const FORUM = "700000000000000007";

const set = (over: Partial<ITagRuleSet> = {}): ITagRuleSet => ({
  _id: "a".repeat(24),
  ...createDefaultTagRuleSet(GUILD, "Test"),
  ...over,
});

const ctx = (over: Partial<TagAccessContext> = {}): TagAccessContext => ({
  memberRoleIds: new Set([GUILD]),
  channelChain: [OTHER_CH],
  isTicket: false,
  ...over,
});

describe("createDefaultTagRuleSet", () => {
  it("allows everyone everywhere and is not hidden", () => {
    expect(createDefaultTagRuleSet(GUILD, "Staff only")).toEqual({
      name: "Staff only",
      roles: [GUILD],
      tickets: true,
      channelMode: "all",
      channels: [],
      forceHidden: false,
    });
  });
});

describe("createTicketsOnlyTagRuleSet", () => {
  it("is the migration target for onlyTickets", () => {
    expect(createTicketsOnlyTagRuleSet(GUILD)).toEqual({
      name: "Tickets only",
      roles: [GUILD],
      tickets: true,
      channelMode: "none",
      channels: [],
      forceHidden: false,
    });
  });
});

describe("TAG_RULE_SET_LIMIT", () => {
  it("is 10", () => expect(TAG_RULE_SET_LIMIT).toBe(10));
});

describe("evaluateTagAccess", () => {
  it("fails closed when the set is missing", () => {
    expect(evaluateTagAccess(undefined, ctx())).toEqual({ ok: false, reason: "missingSet" });
    expect(evaluateTagAccess(null, ctx())).toEqual({ ok: false, reason: "missingSet" });
  });

  it("default set allows everyone in channels and tickets", () => {
    expect(evaluateTagAccess(set(), ctx())).toEqual({ ok: true, forceHidden: false });
    expect(evaluateTagAccess(set(), ctx({ isTicket: true, channelChain: [THREAD, FORUM] }))).toEqual({
      ok: true,
      forceHidden: false,
    });
  });

  it("empty roles deny everybody", () => {
    expect(evaluateTagAccess(set({ roles: [] }), ctx())).toEqual({ ok: false, reason: "role" });
  });

  it("specific role allows members with it and denies others", () => {
    const s = set({ roles: [STAFF_ROLE] });
    expect(evaluateTagAccess(s, ctx({ memberRoleIds: new Set([GUILD, STAFF_ROLE]) })).ok).toBe(true);
    expect(evaluateTagAccess(s, ctx())).toEqual({ ok: false, reason: "role" });
  });

  it("reports the role reason before the channel reason", () => {
    expect(evaluateTagAccess(set({ roles: [], channelMode: "none" }), ctx())).toEqual({
      ok: false,
      reason: "role",
    });
  });

  it("selected mode matches the channel itself, a thread's parent, and a category", () => {
    const s = set({ channelMode: "selected", channels: [STAFF_CH, CATEGORY] });
    expect(evaluateTagAccess(s, ctx({ channelChain: [STAFF_CH] })).ok).toBe(true);
    expect(evaluateTagAccess(s, ctx({ channelChain: [THREAD, STAFF_CH] })).ok).toBe(true);
    expect(evaluateTagAccess(s, ctx({ channelChain: [OTHER_CH, CATEGORY] })).ok).toBe(true);
  });

  it("selected mode denies channels outside the list", () => {
    const s = set({ channelMode: "selected", channels: [STAFF_CH] });
    expect(evaluateTagAccess(s, ctx())).toEqual({ ok: false, reason: "channel" });
  });

  it("none mode denies every non-ticket channel", () => {
    expect(evaluateTagAccess(set({ channelMode: "none" }), ctx())).toEqual({ ok: false, reason: "channel" });
  });

  it("tickets only check the tickets flag; the channel list never applies in tickets", () => {
    const s = set({ tickets: false, channelMode: "selected", channels: [FORUM] });
    expect(evaluateTagAccess(s, ctx({ isTicket: true, channelChain: [THREAD, FORUM] }))).toEqual({
      ok: false,
      reason: "channel",
    });
    expect(
      evaluateTagAccess(set({ tickets: true, channelMode: "none" }), ctx({ isTicket: true })).ok,
    ).toBe(true);
  });

  it("tickets: false with mode all denies tickets and allows channels", () => {
    const s = set({ tickets: false });
    expect(evaluateTagAccess(s, ctx({ isTicket: true })).ok).toBe(false);
    expect(evaluateTagAccess(s, ctx()).ok).toBe(true);
  });

  it("passes forceHidden through on allow", () => {
    expect(evaluateTagAccess(set({ forceHidden: true }), ctx())).toEqual({ ok: true, forceHidden: true });
  });
});
