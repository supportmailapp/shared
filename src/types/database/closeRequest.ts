export interface CloseRequestComment {
  text?: string;
  private?: boolean;
}

export interface ICloseRequest {
  ticketId: string;
  postId: string;
  author: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  closeTime?: string; // Only given if should be auto-closed
  dmMessage: string;
  guildMessage: string;
  comment?: CloseRequestComment;
}
