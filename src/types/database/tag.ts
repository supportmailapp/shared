export interface ITag {
  guildId: string;
  name: string;
  content: string;
  /**
   * Hex `_id` of a rule set in `IDBGuild.tagRuleSets`. `null` = Public.
   *
   * `undefined` only on documents the `tag-rule-sets` migration has not touched yet.
   */
  ruleSetId?: string | null;
  /** @deprecated Replaced by rule sets. Kept only until the `tag-rule-sets` migration has run everywhere. */
  onlyTickets?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
