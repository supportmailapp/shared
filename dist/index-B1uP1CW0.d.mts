import { APIAllowedMentions, APIBaseComponent, APIButtonComponentWithCustomId, APIButtonComponentWithURL, APIContainerComponent, APIFileComponent, APIMediaGalleryComponent, APIMessageTopLevelComponent, APISectionComponent, APISeparatorComponent, APITextDisplayComponent, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { z } from "zod/mini";
//#region src/types/utils/enums.d.ts
declare enum ReportNotificationType {
  ActionTaken = 0,
  ReportSummary = 1,
  ModeratorInfo = 2
}
declare const BlacklistScopes: {
  global: number;
  tickets: number;
  reports: number;
  tags: number;
};
declare const BlacklistScopesMap: {
  readonly [x: string]: "global" | "tickets" | "reports" | "tags";
};
declare const MinBlacklistScope: number;
declare const MaxBlacklistScope: number;
declare enum ReportStatus {
  ignored = 0,
  open = 1,
  timeouted = 2,
  kicked = 3,
  banned = 4,
  messageDeleted = 5,
  resolved = 6
}
declare enum TicketStatus {
  closed = 0,
  open = 1,
  closeRequested = 2
}
declare enum TicketState {
  unanswered = 1,
  pendingQR = 2,
  uResponded = 3,
  awaitingRes = 4
}
declare enum SpecialChannelType {
  Category = 0,
  Channel = 1
}
declare enum ClientAPIErrorCodes {
  MissingPermissions = 0,
  CategoryCreateFailed = 1,
  ForumCreationFailed = 2,
  GuildNotFound = 3,
  CommunityNotEnabled = 4,
  CategoryNotFound = 5
}
/**
 * An enum representing the type of entity.
 */
declare enum EntityType {
  role = 0,
  user = 1,
  guild = 2
}
declare enum LogEventType {
  TestEvent = "testEvent",
  InternalConfigLoad = "internalConfigLoad",
  TicketCreated = "ticketCreate",
  TicketClosed = "ticketClose",
  TicketReopened = "ticketReopen",
  TicketDeleted = "ticketDelete"
}
declare enum UserRole {
  /**
   * Represents a regular user with no special permissions.
   *
   * This is the default role when no role is given.
   */
  User = 0,
  /**
   * Represents a user with administrative permissions.
   */
  Admin = 1,
  /**
   * Represents a user with permissions to moderate and manage appeals as well as reports.
   */
  Moderator = 2
}
//#endregion
//#region src/types/utils/forms.d.ts
type ModalComponentType = ComponentType.TextInput | ComponentType.TextDisplay | ComponentType.StringSelect | ComponentType.FileUpload;
type IBaseFormComponent<T extends ModalComponentType> = {
  /**
   * The type of the component.
   */
  type: T;
  /**
   * The label of the form field.
   *
   * Max. chars: 45
   */
  label: string;
  /**
   * A random unqiue identifier for the component. Default should to a snowflake-like string.
   */
  id: string;
  /**
   * Whether the component is required or not.
   */
  required?: boolean;
  /**
   * The description of the form field.
   *
   * Max. chars: 100
   */
  description?: string;
  /**
   * The placeholder text for the component.
   */
  placeholder: string;
};
interface ITextDisplayComponent extends Pick<IBaseFormComponent<ComponentType.TextDisplay>, "id" | "type"> {
  content: string;
}
interface ITextInputComponent extends IBaseFormComponent<ComponentType.TextInput> {
  style: TextInputStyle;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
}
interface IBaseSelectMenuComponent<T extends ModalComponentType> extends IBaseFormComponent<T> {
  minValues?: number;
  maxValues?: number;
}
interface IStringSelectComponent extends IBaseSelectMenuComponent<ComponentType.StringSelect> {
  options: IStringSelectOption[];
}
interface IStringSelectOption {
  /**
   * Automatically applied by monogdb.
   */
  _id: string;
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  default?: boolean;
}
interface ClientStringSelectOption extends IStringSelectOption {
  local?: true;
}
interface IFileUploadComponent extends Omit<IBaseFormComponent<ComponentType.FileUpload>, "placeholder"> {
  /**
   * The label sent in the file thread along with their respective file(s).
   *
   * Max. chars: 100
   *
   * Example: "Evidence Upload"
   *
   * 3 Uploads:
   * - file1.png - 2MB
   * - file2.jpg - 3MB
   * - file3.mp4 - 7MB
   *
   * Total Size: 12MB
   *
   * Messages:
   * 1. Evidence Upload - file1.png, file2.jpg
   * 2. Evidence Upload - file3.mp4 (because it would exceed the size limit if added to message 1)
   *
   * ---
   *
   * If not set or empty, `this.label` of the field will be used instead.
   */
  messageLabel?: string;
  /**
   * Represents `minFiles` for the file upload component.
   */
  minValues?: number;
  /**
   * Represents `maxFiles` for the file upload component.
   */
  maxValues?: number;
}
type IFormComponent = ITextDisplayComponent | ITextInputComponent | IStringSelectComponent | IFileUploadComponent;
type AnyAPIFormComponent = IFormComponent & {
  _id?: string;
  local?: true;
};
type AnyAPIFeedbackFormComponent = Exclude<AnyAPIFormComponent, {
  type: ComponentType.FileUpload;
}>;
/**
 * API Form Component with local flag
 *
 * local means, the `id` needs to be replaced with a new generated snowflake on the server.
 */
type APIFormComponent<T extends ComponentType> = Extract<AnyAPIFormComponent, {
  type: T;
}>;
type FormComponentKeys = keyof ITextDisplayComponent | keyof ITextInputComponent | keyof IStringSelectComponent | keyof IFileUploadComponent;
//#endregion
//#region src/types/utils/helperTypes.d.ts
type SpecialChannel = {
  t: SpecialChannelType;
  id: string;
};
type Entity<T extends EntityType> = {
  typ: T;
  id: string;
};
type UserEntity = Entity<EntityType.user>;
type GuildEntity = Entity<EntityType.guild>;
type RoleEntity = Entity<EntityType.role>;
type MentionableEntity = UserEntity | RoleEntity;
type AnyEntity = UserEntity | GuildEntity | RoleEntity;
type IPartialEmoji = {
  name: string;
  id?: string;
  animated?: boolean;
};
/** @deprecated Use the new `IFormComponent` */
interface ICustomModalField {
  /** Min: 1 | Max: 5 */
  position: number;
  label: string;
  placeholder?: string;
  style: TextInputStyle;
  minL?: number;
  maxL?: number;
  _required: boolean;
}
type TopLevelMessageComponent = Exclude<APIMessageTopLevelComponent, APIFileComponent | APIMediaGalleryComponent>;
/**
 * Does the `1 << n` operation.
 *
 * Example: You wanna check if bit 3 is set in a bitfield, you can do:
 * ```ts
 * const bitToCheck = bitfieldBit(3); // 8
 * if (bitfield & bitToCheck) {
 *   // Bit 3 is set
 * }
 * ```
 */
declare function bitfieldBit(n: number | bigint | string): bigint;
//#endregion
//#region src/types/utils/validators.d.ts
declare const SnowflakeSchema: z.ZodMiniString<string>;
declare const APIAllowedMentionsSchema: z.ZodMiniObject<{
  everyone: z.ZodMiniDefault<z.ZodMiniBoolean<boolean>>;
  userMode: z.ZodMiniDefault<z.ZodMiniEnum<{
    all: "all";
    none: "none";
    specific: "specific";
  }>>;
  roleMode: z.ZodMiniDefault<z.ZodMiniEnum<{
    all: "all";
    none: "none";
    specific: "specific";
  }>>;
  users: z.ZodMiniOptional<z.ZodMiniArray<z.ZodMiniString<string>>>;
  roles: z.ZodMiniOptional<z.ZodMiniArray<z.ZodMiniString<string>>>;
}, z.core.$strip>;
type APIAllowedMentions$1 = z.output<typeof APIAllowedMentionsSchema>;
//#endregion
//#region src/types/database/user.d.ts
interface IDBUser {
  id: string;
  language: string;
  autoRedirect: boolean;
  t_left: number;
  tips: boolean;
  /**
   * @deprecated - Use `UserToken` Schema instead.
   */
  accessToken?: string;
  roles?: UserRole[];
  updatedAt: Date;
  createdAt: Date;
}
//#endregion
//#region src/types/database/guild.d.ts
interface IAnonym {
  /**
   * Indicates if the user can create an ticket anonymously.
   */
  user: boolean;
  enabled: boolean;
  /**
   * @deprecated Not used currently. Will be re-enabled with premium.
   */
  alias?: string;
}
interface IStatusTags {
  [key: string]: string | undefined;
  open?: string;
  closed?: string;
  unanswered?: string;
  pendingQR?: string;
  uResponded?: string;
  awaitingRes?: string;
}
type PausedUntil = {
  value: boolean;
  date: Date | null;
};
interface ITicketConfig {
  enabled: boolean;
  pausedUntil?: PausedUntil | null;
  forumId: string | null;
  tags?: IStatusTags;
  anonym: IAnonym;
  autoForwarding: boolean;
  allowedBots?: string[];
  pings?: MentionableEntity[];
  /**
   * Webhook ID for the log in a ticket post when a /send command is used.
   *
   * This is used to log the message in the ticket post when a mod sends a message using the `/send` command.
   */
  webhookDocId?: string;
  creationMessage?: string | null;
  closeMessage?: string | null;
}
interface ReportChannelSettings {
  setting: "IN" | "EX";
  ids: SpecialChannel[];
}
interface ReportLimitsConfig {
  /** Number of open reports a user can receive @default 1 @maxConfig `10` */
  perUserReceive?: number;
  /** Number of open reports a user can create @default 5 @maxConfig `50` */
  perUserCreate?: number;
  /** Number of open reports the guild can have @default 20 @maxConfig `100` */
  opens?: number;
}
interface IReportConfig {
  enabled: boolean;
  pausedUntil?: PausedUntil | null;
  channelId: string | null;
  actionsEnabled: boolean;
  autoResolve?: boolean;
  channels?: ReportChannelSettings;
  pings?: MentionableEntity[];
  immune?: MentionableEntity[];
  mods?: MentionableEntity[];
  limits?: ReportLimitsConfig;
  notifications?: ReportNotificationType[];
}
interface IGuildFlags {
  /**
   * Indicates if the guild is blacklisted (restricted from using the app)
   */
  blacklisted: boolean;
  /**
   * Date when the config should be deleted after the bot left the guild
   */
  deleteAfter: Date | null;
  /**
   * Indicates if the guild is a partner guild
   */
  partner: boolean;
}
type BlacklistImmunityEntry = [EntityType, string];
interface IDBGuild {
  /**
   * The Guild ID.
   */
  id: string;
  icon: string;
  name: string;
  lang: string;
  ticketConfig: ITicketConfig;
  reportConfig: IReportConfig;
  blacklistImmune?: BlacklistImmunityEntry[];
  ai?: {
    /**
     * Indicates if AI features are enabled in the guild (premium feature)
     *
     * @default false
     */
    enabled: boolean;
    /**
     * Max tokens for AI responses
     *
     * @default 1000
     */
    maxTokens: number;
    /**
     * Temperature for AI responses
     *
     * @default 0.7
     */
    temperature: number;
  };
  flags: IGuildFlags;
  createdAt: Date;
}
//#endregion
//#region src/types/database/message.d.ts
interface IDBMessage {
  watch: string;
  edit: string;
  guildId: string;
  ticketId: string;
}
//#endregion
//#region src/types/database/blacklistEntry.d.ts
interface IBlacklistEntry {
  /**
   * The blacklisted ID (role | user | guild)
   */
  id: string;
  /**
   * Indicates who is blacklisted
   *
   * - 1 = role
   * - 2 = user
   * - 3 = guild
   */
  _type: EntityType;
  /**
   * The guild ID where the entity is blacklisted
   */
  guildId?: string;
  /**
   * Indicates from what the user is restricted.
   *
   * - `0` = global
   * - `1` = all (locally)
   * - `2` = tickets
   * - `3` = reports
   * - `4` = tags
   *
   * @deprecated Use `scopes` instead.
   */
  scope: number;
  /**
   * A bitfield indicating the active scopes for this entry. Indicates for what the entity is blacklisted.
   *
   * @see {BlacklistScopes}
   *
   * For example, to check if tickets are blacklisted:
   * ```ts
   * const isTicketsBlacklisted = (entry.scopes & BlacklistScopes.tickets) === BlacklistScopes.tickets;
   * // Or use the helper function
   * const isTicketsBlacklisted = isScopeBlacklisted(entry, BlacklistScopes.tickets);
   * ```
   */
  scopes: bigint;
  updatedAt: Date;
  createdAt: Date;
}
//#endregion
//#region src/types/database/ticket.d.ts
interface ITicket {
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
  lastActive: string;
  stateTag?: TicketState;
  feedbackId?: string;
  createdAt: Date;
  updatedAt: Date;
}
//#endregion
//#region src/types/database/report.d.ts
interface IReport {
  reportId: string;
  userId: string;
  guildId: string;
  authorId: string;
  reason: string;
  /**
   * The log message associated with the report.
   *
   * Format: `"channelId-messageId"`
   */
  logMessage?: string;
  /**
   * The reported message reference.
   *
   * Format: `"channelId-messageId"`
   */
  message?: string;
  status: ReportStatus;
  comment?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolveComment?: string;
  attachments?: {};
  createdAt: Date;
  updatedAt: Date;
}
//#endregion
//#region src/types/database/closeRequest.d.ts
interface CloseRequestComment {
  text?: string;
  private?: boolean;
}
interface ICloseRequest {
  ticketId: string;
  postId: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  closeTime?: string;
  dmMessage: string;
  guildMessage: string;
  comment?: CloseRequestComment;
}
//#endregion
//#region src/types/database/tag.d.ts
interface ITag {
  guildId: string;
  name: string;
  content: string;
  onlyTickets: boolean;
  createdAt: Date;
  updatedAt: Date;
}
//#endregion
//#region src/types/database/userTokens.d.ts
interface IUserToken {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  /**
   * The clearance level of the user
   *
   * "user" or missing - regular user access
   * "mod" - moderator access
   * "admin" - admin access
   */
  clearance?: "user" | "mod" | "admin";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
//#endregion
//#region src/types/database/botStats.d.ts
interface IBotStats {
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
  createdAt: Date;
  updatedAt: Date;
}
//#endregion
//#region src/types/database/logEvent.d.ts
interface IBaseLogEvent {
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
type TInternalLogEvent = TInternalConfigLoadEvent;
type ALogEvent = IBaseLogEvent;
type TLogEvent = TestLogEvent | TInternalLogEvent | TicketCreatedEvent | TicketClosedEvent | TicketReopenedEvent | TicketDeletedEvent;
//#endregion
//#region src/types/database/knowledge.d.ts
interface IKnowledgeEntry {
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
//#endregion
//#region src/types/database/ticketCategories.d.ts
interface ITicketCategory {
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
type APITicketCategory = Omit<ITicketCategory, "customMessageId"> & {
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
//#endregion
//#region src/types/database/feedback.d.ts
interface IFeedbackTags {
  [key: string]: string | undefined;
  one?: string;
  two?: string;
  three?: string;
  four?: string;
  five?: string;
}
type IFeedbackFormComponent = Exclude<IFormComponent, IFileUploadComponent>;
interface IFeedbackConfig {
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
type APIFeedbackConfig = Omit<IFeedbackConfig, "components"> & {
  /**
   * Custom components to show in the feedback form.
   *
   * Note, File components are not supported in feedback forms.
   */
  components?: AnyAPIFeedbackFormComponent[];
};
interface IFeedbackAnswer {
  /**
   * The ID of the question this answer corresponds to.
   */
  questionId: string;
  label: string;
  answer: string;
}
interface IFeedbackUpload {
  /**
   * The ID of the question this answer corresponds to.
   */
  questionId: string;
  label: string;
  uploads: string[];
}
interface IFeedback {
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
type APIFeedback = Omit<IFeedback, "timestamp"> & {
  /** ISO 8601 timestamp */
  timestamp: string;
};
//#endregion
//#region src/types/database/commandConfig.d.ts
/**
 * A general interface for command configurations.
 */
interface ICommandConfig {
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
type APICommandConfig = Omit<ICommandConfig, "permissions"> & {
  permissions: string;
};
//#endregion
//#region src/types/database/panel.d.ts
type SMMediaItem = {
  url: string;
  description?: string;
  spoiler?: boolean;
};
type SMThumbnailComponent = SMMediaItem & {
  type: ComponentType.Thumbnail;
};
type StringifyEmoji<T> = Omit<T, "emoji"> & {
  emoji?: string;
};
type SMActionRowButton = {
  /**
   * This will indicate the custom ID of the button, of given.
   * If the action is "link", this must be a URL button.
   *
   * This action will be used in the custom ID before sending to Discord.
   *
   * The actions are mapped to customId prefixes:
   * - "ticket:create" -> "ticketCreate"
   * - "reply" -> "replyTo"
   * - "link" -> URL button, no custom ID
   */
  action: SMCustomAction;
} & (StringifyEmoji<APIButtonComponentWithCustomId> | StringifyEmoji<APIButtonComponentWithURL>);
type SMSectionComponent = Omit<APISectionComponent, "accessory"> & {
  accessory?: SMActionRowButton | SMThumbnailComponent;
};
type SMMediaGalleryComponent = Omit<APIMediaGalleryComponent, "items"> & {
  items: SMMediaItem[];
};
type SMCustomAction = "ticket:create" | "reply" | "link";
type SMSelectOption = {
  /**
   * Automatically applied by monogdb.
   */
  _id: string;
  action: Exclude<SMCustomAction, "link">;
  value: string;
  label: string;
  emoji?: string;
  description?: string;
};
type ClientSMSelectOption = SMSelectOption & {
  _id?: string;
  local?: true;
};
type ClientSMSelect = Omit<SMSelect, "options"> & {
  options: ClientSMSelectOption[];
};
type SMSelect = {
  type: ComponentType.StringSelect;
  custom_id: "panelSelect";
  options: SMSelectOption[];
  placeholder?: string;
};
type SMComponentInActionRow = SMActionRowButton | SMSelect;
type SMActionRowComponent = APIBaseComponent<ComponentType.ActionRow> & {
  /**
   * The components in the ActionRow
   */
  components: SMComponentInActionRow[];
};
type SMComponentInContainer = SMMediaGalleryComponent | SMSectionComponent | APISeparatorComponent | APITextDisplayComponent | SMActionRowComponent;
type SMContainerComponent = Omit<APIContainerComponent, "components"> & {
  components: SMComponentInContainer[];
};
type SMTopLevelMessageComponent = SMContainerComponent | SMMediaGalleryComponent | SMSectionComponent | APISeparatorComponent | APITextDisplayComponent | SMActionRowComponent;
type AnySMComponent = SMActionRowButton | SMSelect | SMActionRowComponent | SMContainerComponent | SMMediaGalleryComponent | SMSectionComponent | APISeparatorComponent | APITextDisplayComponent;
type SMAllowedMentions = Omit<APIAllowedMentions, "replied_user">;
interface IPanel {
  guildId: string;
  channelId?: string;
  messageId?: string;
  allowedMentions?: Omit<APIAllowedMentions, "replied_user">;
  data: SMTopLevelMessageComponent[];
  createdAt: Date;
  updatedAt: Date;
}
interface APIPanel extends Omit<IPanel, "createdAt" | "updatedAt" | "allowedMentions"> {
  allowedMentions: APIAllowedMentions$1;
  createdAt?: string;
  updatedAt?: string;
}
//#endregion
export { PausedUntil as $, APITicketCategory as A, BlacklistScopes as At, CloseRequestComment as B, TicketState as Bt, APIFeedbackConfig as C, IFileUploadComponent as Ct, IFeedbackFormComponent as D, ITextDisplayComponent as Dt, IFeedbackConfig as E, IStringSelectOption as Et, TInternalLogEvent as F, MaxBlacklistScope as Ft, IDBMessage as G, IReport as H, UserRole as Ht, TLogEvent as I, MinBlacklistScope as It, IDBGuild as J, BlacklistImmunityEntry as K, IBotStats as L, ReportNotificationType as Lt, IKnowledgeEntry as M, ClientAPIErrorCodes as Mt, ALogEvent as N, EntityType as Nt, IFeedbackTags as O, ITextInputComponent as Ot, IBaseLogEvent as P, LogEventType as Pt, ITicketConfig as Q, IUserToken as R, ReportStatus as Rt, APIFeedback as S, IBaseSelectMenuComponent as St, IFeedbackAnswer as T, IStringSelectComponent as Tt, ITicket as U, ICloseRequest as V, TicketStatus as Vt, IBlacklistEntry as W, IReportConfig as X, IGuildFlags as Y, IStatusTags as Z, SMSelectOption as _, APIFormComponent as _t, IPanel as a, SnowflakeSchema as at, APICommandConfig as b, ClientStringSelectOption as bt, SMAllowedMentions as c, GuildEntity as ct, SMContainerComponent as d, MentionableEntity as dt, ReportChannelSettings as et, SMCustomAction as f, RoleEntity as ft, SMSelect as g, bitfieldBit as gt, SMSectionComponent as h, UserEntity as ht, ClientSMSelectOption as i, APIAllowedMentionsSchema as it, ITicketCategory as j, BlacklistScopesMap as jt, IFeedbackUpload as k, ModalComponentType as kt, SMComponentInActionRow as l, ICustomModalField as lt, SMMediaItem as m, TopLevelMessageComponent as mt, AnySMComponent as n, IDBUser as nt, SMActionRowButton as o, AnyEntity as ot, SMMediaGalleryComponent as p, SpecialChannel as pt, IAnonym as q, ClientSMSelect as r, APIAllowedMentions$1 as rt, SMActionRowComponent as s, Entity as st, APIPanel as t, ReportLimitsConfig as tt, SMComponentInContainer as u, IPartialEmoji as ut, SMThumbnailComponent as v, AnyAPIFeedbackFormComponent as vt, IFeedback as w, IFormComponent as wt, ICommandConfig as x, FormComponentKeys as xt, SMTopLevelMessageComponent as y, AnyAPIFormComponent as yt, ITag as z, SpecialChannelType as zt };