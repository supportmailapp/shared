import { describe, expect, it } from "vitest";
import { hasValidTagRuleSetChannels, TagRuleSetSchema } from "./validators.js";

const GUILD = "100000000000000001";
const CH = "300000000000000003";
const valid = {
  name: "Staff only",
  roles: [GUILD],
  tickets: true,
  channelMode: "all",
  channels: [],
  forceHidden: false,
};

describe("TagRuleSetSchema", () => {
  it("accepts the default shape", () => {
    expect(TagRuleSetSchema.safeParse(valid).success).toBe(true);
  });

  it("trims the name", () => {
    expect(TagRuleSetSchema.parse({ ...valid, name: "  Staff  " }).name).toBe("Staff");
  });

  it("rejects an empty or whitespace-only name", () => {
    expect(TagRuleSetSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });

  it("rejects names longer than 50 characters", () => {
    expect(TagRuleSetSchema.safeParse({ ...valid, name: "x".repeat(51) }).success).toBe(false);
  });

  it("requires at least one channel in selected mode, reported on `channels`", () => {
    const res = TagRuleSetSchema.safeParse({ ...valid, channelMode: "selected", channels: [] });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0]?.path).toEqual(["channels"]);
  });

  it("accepts selected mode with a channel", () => {
    expect(TagRuleSetSchema.safeParse({ ...valid, channelMode: "selected", channels: [CH] }).success).toBe(true);
  });

  it("rejects non-snowflake ids", () => {
    expect(TagRuleSetSchema.safeParse({ ...valid, roles: ["abc"] }).success).toBe(false);
  });

  it("rejects an unknown channel mode", () => {
    expect(TagRuleSetSchema.safeParse({ ...valid, channelMode: "some" }).success).toBe(false);
  });

  it("rejects more than 50 roles", () => {
    const roles = Array.from({ length: 51 }, (_, i) => String(100000000000000000n + BigInt(i)));
    expect(TagRuleSetSchema.safeParse({ ...valid, roles }).success).toBe(false);
  });
});

describe("hasValidTagRuleSetChannels", () => {
  it("only fails for selected mode without channels", () => {
    expect(hasValidTagRuleSetChannels({ channelMode: "selected", channels: [] })).toBe(false);
    expect(hasValidTagRuleSetChannels({ channelMode: "none", channels: [] })).toBe(true);
    expect(hasValidTagRuleSetChannels({ channelMode: "all", channels: [] })).toBe(true);
  });
});
