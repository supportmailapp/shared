import type { IFormComponent } from "../utils/forms.js";
import type { MentionableEntity } from "../utils/helperTypes.js";

export interface ITicketCategory {
  /**
   * The ID of the guild (server) this ticket category belongs to.
   */
  guildId: string;
  /**
   * Whether this ticket category is currently enabled.
   */
  enabled: boolean;
  /**
   * The position index of this category in the list of categories.
   */
  index: number;
  /**
   * The display name of this ticket category.
   *
   * - Max length: 45 characters
   * - Min length: 3 character
   */
  label: string;
  /**
   * Optional emoji associated with this category.
   */
  emoji?: string;
  /**
   * The Tag ID that should be used for this category.
   *
   * Because it's in a forum channel...
   */
  tag?: string;
  /**
   * Optional array of entities to ping when a ticket of this category is created.
   */
  pings?: MentionableEntity[];
  /**
   * Custom Form components to be displayed in the ticket creation modal.
   */
  components: IFormComponent[];
  creationMessage?: string | null;
  closeMessage?: string | null;
}

// The type used when sending/receiving ticket categories via the API
export type APITicketCategory = Omit<ITicketCategory, "customMessageId"> & {
  /**
   * If from the server, the MongoDB ObjectId as a string.
   *
   * If local, an ISO string representing the creation date. Gets replaced when saved to the database.
   */
  _id: string;
  /**
   * If set, then this ticket category is only stored locally and not in the database.
   *
   * it is automatically created when saving a new ticket category.
   */
  local?: true;
  customMessageId?: string;
};
