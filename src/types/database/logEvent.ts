import { LogEventType } from "../utils/enums.js";

export interface IBaseLogEvent {
  typ: LogEventType;
  guildId: string;
  timestamp: Date;
  reason?: string;
  extra?: Record<string, string | number | boolean>;
}

type TicketCreatedEvent = IBaseLogEvent & {
  typ: LogEventType.TicketCreated;
  extra: {
    ticketId: string;
  };
};

type TicketClosedEvent = IBaseLogEvent & {
  typ: LogEventType.TicketClosed;
  extra: {
    ticketId: string;
    /**
     * User ID of the person who closed the ticket.
     */
    userId: string;
  };
};

type TicketReopenedEvent = IBaseLogEvent & {
  typ: LogEventType.TicketReopened;
  extra: {
    ticketId: string;
    /**
     * User ID of the person who reopened the ticket.
     */
    userId: string;
  };
};

type TicketDeletedEvent = IBaseLogEvent & {
  typ: LogEventType.TicketDeleted;
  extra: {
    ticketId: string;
    /**
     * User ID of the person who deleted the ticket.
     */
    userId: string;
  };
};

type TestLogEvent = IBaseLogEvent & {
  typ: LogEventType.TestEvent;
};

type TInternalConfigLoadEvent = IBaseLogEvent & {
  typ: LogEventType.InternalConfigLoad;
  extra: {
    /**
     * Comma-separated list of config keys that were loaded (e.g. "guild,blacklist,feedback").
     */
    keys: string;
    /**
     * User ID of the person who triggered the config load, if applicable.
     */
    userId?: string;
  };
};

export type TInternalLogEvent = TInternalConfigLoadEvent;

export type ALogEvent = IBaseLogEvent;

export type TLogEvent =
  | TestLogEvent
  | TInternalLogEvent
  | TicketCreatedEvent
  | TicketClosedEvent
  | TicketReopenedEvent
  | TicketDeletedEvent;
