export interface IKnowledgeEntry {
  /**
   * The guild ID where the knowledge entry belongs.
   */
  guildId: string;
  /**
   * the content of an uploaded md/txt file.
   *
   * if not set, question and answer must be set.
   *
   * Note: For one guild, all content fields must not exceed 64KB in total.
   */
  content?: string;
  /**
   * The question part of the knowledge entry.
   *
   * if not set, content must be set and answer can't be set.
   */
  question?: string;
  /**
   * The answer part of the knowledge entry.
   *
   * if not set, content must be set and question can't be set.
   */
  answer?: string;
  createdAt: Date;
  updatedAt: Date;
}
