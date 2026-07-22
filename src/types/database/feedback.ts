import type { AnyAPIFeedbackFormComponent, IFileUploadComponent, IFormComponent } from "../utils/forms.js";
import type { ICustomModalField } from "../utils/helpers.js";

export interface IFeedbackTags {
  [key: string]: string | undefined; // This missing means TS issues
  one?: string;
  two?: string;
  three?: string;
  four?: string;
  five?: string;
}

export type IFeedbackFormComponent = Exclude<IFormComponent, IFileUploadComponent>;

export interface IFeedbackConfig {
  guildId: string;
  channelId?: string;
  isEnabled: boolean;
  /**
   * Custom questions to ask the user after closing the ticket.
   *
   * @deprecated Use `components` instead.
   */
  questions?: ICustomModalField[];
  /**
   * Custom components to show in the feedback form.
   *
   * Note, File components are not supported in feedback forms.
   */
  components?: IFeedbackFormComponent[];
  thankYou?: string;
  /**
   * Tags in the forum to apply based on the rating given.
   */
  tags?: IFeedbackTags;
}

export type APIFeedbackConfig = Omit<IFeedbackConfig, "components"> & {
  /**
   * Custom components to show in the feedback form.
   *
   * Note, File components are not supported in feedback forms.
   */
  components?: AnyAPIFeedbackFormComponent[];
};

export interface IFeedbackAnswer {
  /**
   * The ID of the question this answer corresponds to.
   */
  questionId: string;
  label: string;
  answer: string;
}
export interface IFeedbackUpload {
  /**
   * The ID of the question this answer corresponds to.
   */
  questionId: string;
  label: string;
  uploads: string[];
}

export interface IFeedback {
  guildId: string;
  ticketId: string;
  rating: number;
  /**
   * A mapping of question IDs to answers.
   */
  answers: IFeedbackAnswer[];
  /**
   * `channelid-messageid`
   */
  logMessage?: string;
  timestamp: Date;
  /**
   * All file uploads fields and their uploads.
   *
   * Due to the nature of expiring attachment links, we post the attachment URLs in the feedback channel, otherwise it ain't possible.
   */
  uploads?: IFeedbackUpload[];
}

export type APIFeedback = Omit<IFeedback, "timestamp"> & {
  /** ISO 8601 timestamp */
  timestamp: string;
};
