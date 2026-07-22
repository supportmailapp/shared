import { z } from "zod/mini";

export const SnowflakeSchema = z.string().check(z.regex(/^\d{17,23}$/, "Invalid Snowflake"));

/* This accepts the api schema and parses it to the DB schema */
export const APIAllowedMentionsSchema = z.object({
  everyone: z._default(z.boolean(), false),
  userMode: z._default(z.enum(["all", "none", "specific"]), "none"),
  roleMode: z._default(z.enum(["all", "none", "specific"]), "none"),
  users: z.optional(z.array(SnowflakeSchema).check(z.maxLength(100, "Maximum of 100 user mentions"))),
  roles: z.optional(z.array(SnowflakeSchema).check(z.maxLength(100, "Maximum of 100 role mentions"))),
});

export type APIAllowedMentions = z.output<typeof APIAllowedMentionsSchema>;
