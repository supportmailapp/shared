import type {
  APIFileComponent,
  APIMediaGalleryComponent,
  APIMessageTopLevelComponent,
  TextInputStyle,
} from "discord-api-types/v10";
import { EntityType, SpecialChannelType } from "./enums.js";
import type { APIAllowedMentionsSchema } from "$utils/validators.js";
import type * as z from "zod/mini";
export * from "./forms.js";

export type SpecialChannel = {
  t: SpecialChannelType;
  id: string;
};

export type Entity<T extends EntityType> = {
  typ: T;
  id: string;
};

export type UserEntity = Entity<EntityType.user>;
export type GuildEntity = Entity<EntityType.guild>;
export type RoleEntity = Entity<EntityType.role>;
export type MentionableEntity = UserEntity | RoleEntity;
export type AnyEntity = UserEntity | GuildEntity | RoleEntity;

export type IPartialEmoji = {
  name: string;
  id?: string;
  animated?: boolean;
};

/** @deprecated Use the new `IFormComponent` */
export interface ICustomModalField {
  /** Min: 1 | Max: 5 */
  position: number;
  label: string;
  placeholder?: string;
  style: TextInputStyle;
  minL?: number;
  maxL?: number;
  _required: boolean;
}

export type TopLevelMessageComponent = Exclude<
  APIMessageTopLevelComponent,
  APIFileComponent | APIMediaGalleryComponent
>;

export type APIAllowedMentions = z.output<typeof APIAllowedMentionsSchema>;
