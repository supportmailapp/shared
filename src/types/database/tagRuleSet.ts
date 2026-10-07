/** Where a tag may be used outside of ticket threads. */
export type TagChannelMode = "all" | "selected" | "none";

/**
 * A named access rule set for tags, stored in `IDBGuild.tagRuleSets`.
 *
 * Role check AND location check must both pass. In ticket threads only
 * `tickets` is checked; outside tickets only `channelMode`/`channels`.
 */
export interface ITagRuleSet {
  /** Subdocument ObjectId as hex string. */
  _id: string;
  /** 1–50 chars, unique per guild (case-insensitive). */
  name: string;
  /** Role IDs; the member needs any of them. `[]` = nobody, guild ID (`@everyone`) = everybody. */
  roles: string[];
  /** Allowed inside ticket threads. @default true */
  tickets: boolean;
  /** Outside tickets. @default "all" */
  channelMode: TagChannelMode;
  /** Channel or category IDs. Only read when `channelMode === "selected"`. */
  channels: string[];
  /** Always reply ephemeral, regardless of the `hidden` option. @default false */
  forceHidden: boolean;
}
