import * as z from "zod/mini";
import type { TagChannelMode } from "$types/database/tagRuleSet.js";

export const SnowflakeSchema = z.string().check(z.regex(/^\d{17,23}$/, "Invalid Snowflake"));

/* This accepts the api schema and parses it to the DB schema */
export const APIAllowedMentionsSchema = z.object({
  everyone: z._default(z.boolean(), false),
  userMode: z._default(z.enum(["all", "none", "specific"]), "none"),
  roleMode: z._default(z.enum(["all", "none", "specific"]), "none"),
  users: z.optional(z.array(SnowflakeSchema).check(z.maxLength(100, "Maximum of 100 user mentions"))),
  roles: z.optional(z.array(SnowflakeSchema).check(z.maxLength(100, "Maximum of 100 role mentions"))),
});

export const TagChannelModeSchema = z.enum(["all", "selected", "none"]);

/** Field schemas of a tag rule set, exported so apps can extend the object (e.g. with `_id`). */
export const TagRuleSetFields = {
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, "Rule set name must not be empty"),
      z.maxLength(50, "Rule set name must be at most 50 characters"),
    ),
  roles: z.array(SnowflakeSchema).check(z.maxLength(50, "Maximum of 50 roles")),
  tickets: z.boolean(),
  channelMode: TagChannelModeSchema,
  channels: z.array(SnowflakeSchema).check(z.maxLength(50, "Maximum of 50 channels")),
  forceHidden: z.boolean(),
};

export const TAG_RULE_SET_CHANNELS_ERROR = "Select at least one channel, or choose a different channel mode";

export function hasValidTagRuleSetChannels(set: {
  channelMode: TagChannelMode;
  channels: readonly string[];
}): boolean {
  return set.channelMode !== "selected" || set.channels.length > 0;
}

export const TagRuleSetSchema = z
  .object(TagRuleSetFields)
  .check(z.refine(hasValidTagRuleSetChannels, { message: TAG_RULE_SET_CHANNELS_ERROR, path: ["channels"] }));
