import type {
  APIAllowedMentions,
  APIBaseComponent,
  APIButtonComponentWithCustomId,
  APIButtonComponentWithURL,
  APIContainerComponent,
  APIMediaGalleryComponent,
  APISectionComponent,
  APISeparatorComponent,
  APITextDisplayComponent,
  ComponentType,
} from "discord-api-types/v10";
import type { APIAllowedMentions as SMAPIAllowedMentions } from "../utils/validators.js";

export type SMMediaItem = {
  url: string;
  description?: string;
  spoiler?: boolean;
};

export type SMThumbnailComponent = SMMediaItem & {
  type: ComponentType.Thumbnail;
};

type StringifyEmoji<T> = Omit<T, "emoji"> & { emoji?: string };

export type SMActionRowButton = {
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

export type SMSectionComponent = Omit<APISectionComponent, "accessory"> & {
  accessory?: SMActionRowButton | SMThumbnailComponent;
};

export type SMMediaGalleryComponent = Omit<APIMediaGalleryComponent, "items"> & {
  items: SMMediaItem[];
};

export type SMCustomAction = "ticket:create" | "reply" | "link";

export type SMSelectOption = {
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

export type ClientSMSelectOption = SMSelectOption & {
  _id?: string;
  local?: true;
};

export type ClientSMSelect = Omit<SMSelect, "options"> & {
  options: ClientSMSelectOption[];
};

export type SMSelect = {
  type: ComponentType.StringSelect;
  custom_id: "panelSelect";
  options: SMSelectOption[];
  placeholder?: string;
};
export type SMComponentInActionRow = SMActionRowButton | SMSelect;
export type SMActionRowComponent = APIBaseComponent<ComponentType.ActionRow> & {
  /**
   * The components in the ActionRow
   */
  components: SMComponentInActionRow[];
};

export type SMComponentInContainer =
  | SMMediaGalleryComponent
  | SMSectionComponent
  | APISeparatorComponent
  | APITextDisplayComponent
  | SMActionRowComponent;

export type SMContainerComponent = Omit<APIContainerComponent, "components"> & {
  components: SMComponentInContainer[];
};

export type SMTopLevelMessageComponent =
  | SMContainerComponent
  | SMMediaGalleryComponent
  | SMSectionComponent
  | APISeparatorComponent
  | APITextDisplayComponent
  | SMActionRowComponent;

export type AnySMComponent =
  | SMActionRowButton
  | SMSelect
  | SMActionRowComponent
  | SMContainerComponent
  | SMMediaGalleryComponent
  | SMSectionComponent
  | APISeparatorComponent
  | APITextDisplayComponent;

export type SMAllowedMentions = Omit<APIAllowedMentions, "replied_user">;

export interface IPanel {
  guildId: string;
  channelId?: string;
  messageId?: string;
  allowedMentions?: Omit<APIAllowedMentions, "replied_user">;
  data: SMTopLevelMessageComponent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface APIPanel extends Omit<IPanel, "createdAt" | "updatedAt" | "allowedMentions"> {
  allowedMentions: SMAPIAllowedMentions;
  createdAt?: string;
  updatedAt?: string;
}
