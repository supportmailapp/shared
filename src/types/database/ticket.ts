import { TicketState, TicketStatus } from "../utils/enums.js";

export interface ITicket {
  id: string;
  /**
   * Alias of the user if the ticket is anonymous
   */
  alias?: string;
  userId: string;
  guildId: string;
  forumId: string;
  categoryId?: string;
  postId: string;
  count: number;
  status: TicketStatus;
  closeComment?: string;
  lastActive: string; // For sorting purposes
  stateTag?: TicketState; // For tag management (indicates which tag should be applied atm)
  feedbackId?: string;
  createdAt: Date;
  updatedAt: Date;
}
