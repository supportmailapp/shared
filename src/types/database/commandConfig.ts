import type { SpecialChannel } from "../utils/helperTypes.js";

/**
 * A general interface for command configurations.
 */
export interface ICommandConfig {
  /**
   * The unique command ID.
   */
  id?: string;
  /**
   * The name(s) of the command.
   *
   * Schema: `/<command>/<subgroup|subcommand>/<subcommand>`
   *
   * ### Examples:
   * - `/foo` - `"foo"`
   * - `/foo bar` - `"foo/bar"`
   * - `/foo bar baz` - `"foo/bar/baz"`
   */
  commandPath: string;
  /**
   * The guild ID this command is for.
   *
   * - If `guildId == null`, this is unique globally.
   * - If `guildId != null`, this is unique per guild.
   */
  guildId: string | null;
  /**
   * The channels this command can be used in.
   */
  channels: SpecialChannel[];
  /**
   * The roles this command can be used by.
   *
   * - If the id matches the guild ID, it's \@everyone.
   * - If empty, don't check for roles.
   * - If `roles`, `users`, and `permissions` are all empty, check for MANAGE_GUILD permissions!
   */
  roles: string[];
  /**
   * The users this command can be used by.
   *
   * - If empty, don't check for users.
   * - If `roles`, `users`, and `permissions` are all empty, check for MANAGE_GUILD permissions!
   */
  users: string[];
  /**
   * The permissions this command can be used with.
   *
   * - If empty (0n), don't check for permissions.
   * - If `roles`, `users`, and `permissions` are all empty, check for MANAGE_GUILD permissions! This is using discord's bitfield system.
   */
  permissions: bigint;
}

export type APICommandConfig = Omit<ICommandConfig, "permissions"> & {
  permissions: string;
};
