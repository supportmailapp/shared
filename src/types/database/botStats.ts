export interface IBotStats {
  guilds: number;
  /**
   * Total number of tickets ever created (can be accumulated based on `baseNumber + LogEventType.TicketCreated` events).
   *
   * This is not the same as `tickets` which represents currently open tickets.
   */
  tickets: number;
  users: number;
  /**
   * A number indicating how many tickets have been created that day.
   *
   * This is used to determine the new tickets count without querying the db for all tickets.
   */
  ticketsCreated: number;
  createdAt: Date; // MongoDB will automatically set this
  updatedAt: Date; // MongoDB will automatically set this
}
