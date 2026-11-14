// Panel component parsing: turns the stored SupportMail panel shape into Discord API components.
// Pure: no env, no I/O. Shared by sm-api and the dashboard so both build identical payloads.

import {
  ButtonStyle,
  ComponentType,
  type APIMessageTopLevelComponent,
  type APIComponentInContainer,
  type APIMediaGalleryItem,
  type APIThumbnailComponent,
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithURL,
  type APISectionAccessoryComponent,
  type APIStringSelectComponent,
} from "discord-api-types/v10";
import type { IPartialEmoji } from "$types/utils/helpers.js";
import type {
  SMActionRowButton,
  SMComponentInActionRow,
  SMCustomAction,
  SMMediaItem,
  SMThumbnailComponent,
  SMTopLevelMessageComponent,
} from "$types/database/panel.js";
import { FullTwemojiRegex } from "./twemojiRegex.js";

export const CustomEmojiRegex = /^<?(a)?:([a-zA-Z0-9_~]{2,32}):(\d{17,23})>?$/i;

/**
 * Validates and parses emoji from a text string.
 * Attempts to match both custom Discord-style emojis and Twemoji formats.
 *
 * @param text - The text string to validate for emoji content
 * @returns An object containing emoji properties (animated, name, id) if a valid emoji is found, otherwise undefined
 *
 * @example
 * // Custom emoji
 * validateEmoji('<a:name:123456789>'); // { animated: true, name: 'name', id: '123456789' }
 *
 * @example
 * // Twemoji
 * validateEmoji('😀'); // { name: '😀' }
 *
 * @example
 * // Invalid emoji
 * validateEmoji(''); // undefined
 */
export function validateEmoji(text: string): IPartialEmoji | undefined {
  if (!text || text.length == 0) return;
  text = text.trim();
  const customEmoji = text.match(CustomEmojiRegex);
  if (customEmoji) {
    return { animated: !!customEmoji[1], name: customEmoji[2]!, id: customEmoji[3]! };
  }

  const twemojiMatch = text.match(FullTwemojiRegex())?.[0];
  if (twemojiMatch) {
    return { name: twemojiMatch };
  }
  return;
}

export class ComponentParser {
  static readonly ButtonActionMapping = {
    "ticket:create": "createTicket/panel",
    reply: "replyTo",
  } as const satisfies Record<Exclude<SMCustomAction, "link">, string>;
  static readonly SelectOptionActionMapping = {
    "ticket:create": "createTicket",
    reply: "replyTo",
  } as const satisfies Record<Exclude<SMCustomAction, "link">, string>;
  private categories: string[];
  private tags: string[];

  constructor(
    private components: SMTopLevelMessageComponent[],
    additional: { categories?: string[]; tags?: string[] } = {},
  ) {
    this.categories = additional.categories ?? [];
    this.tags = additional.tags ?? [];
  }

  parse(): APIMessageTopLevelComponent[] {
    return this.components.map((comp) => this.parseComponent(comp)).filter((c) => c != undefined);
  }

  private parseComponent(comp: SMTopLevelMessageComponent): APIMessageTopLevelComponent | undefined {
    switch (comp.type) {
      case ComponentType.ActionRow:
        return {
          type: comp.type,
          components: comp.components
            .map((c) => this.parseComponentInActionRow(c))
            .filter((c) => c != undefined),
        };
      case ComponentType.Container:
        return {
          type: comp.type,
          components: comp.components.map((c) => this.parseComponentInContainer(c)),
          accent_color: comp.accent_color,
          spoiler: !!comp.spoiler,
        };
      case ComponentType.MediaGallery:
        return {
          type: comp.type,
          items: comp.items.map((item) => this.parseMediaItem(item)),
        };
      case ComponentType.Section:
        if (!comp.accessory) {
          return undefined; // a sections needs an accessory
        }
        const accessory = this.parseSectionAccessory(comp.accessory);
        if (!accessory) {
          return undefined; // invalid accessory
        }
        return {
          type: comp.type,
          components: comp.components.map((c) => ({ type: ComponentType.TextDisplay, content: c.content })),
          accessory: accessory,
        };
      case ComponentType.Separator:
        return {
          type: comp.type,
          divider: !!comp.divider,
          spacing: comp.spacing,
        };
      case ComponentType.TextDisplay:
        return {
          type: comp.type,
          content: comp.content,
        };
    }
  }

  private parseComponentInContainer(comp: SMTopLevelMessageComponent): APIComponentInContainer {
    // the same as parseComponent but without the Container type, so we can just call it recursively
    return this.parseComponent(comp) as APIComponentInContainer;
  }

  private parseButton(
    comp: SMActionRowButton,
  ): APIButtonComponentWithCustomId | APIButtonComponentWithURL | undefined {
    if (comp.style === ButtonStyle.Link && comp.action === "link") {
      return {
        type: ComponentType.Button,
        style: 5,
        label: comp.label,
        emoji: comp.emoji ? validateEmoji(comp.emoji) : undefined,
        url: comp.url,
        disabled: comp.disabled,
      } satisfies APIButtonComponentWithURL;
    } else if (comp.style !== ButtonStyle.Link && comp.action !== "link") {
      if (
        (comp.action === "ticket:create" &&
          !!comp.custom_id &&
          !this.categories.includes(comp.custom_id ?? "")) ||
        (comp.action === "reply" && !this.tags.includes(comp.custom_id ?? ""))
      ) {
        return undefined; // invalid action/category
      }
      const actionPrefix = ComponentParser.ButtonActionMapping[comp.action];
      return {
        type: ComponentType.Button,
        style: comp.style,
        label: comp.label,
        emoji: comp.emoji ? validateEmoji(comp.emoji) : undefined,
        custom_id: `${actionPrefix}${comp.custom_id ? `?${comp.custom_id}` : ""}`,
        disabled: comp.disabled,
      } satisfies APIButtonComponentWithCustomId;
    }
    return undefined;
  }

  private parseComponentInActionRow(comp: SMComponentInActionRow) {
    if (comp.type === ComponentType.Button) {
      return this.parseButton(comp);
    }

    return {
      type: ComponentType.StringSelect,
      custom_id: "panelSelect",
      options: comp.options.map((opt) => ({
        label: opt.label,
        value: `${ComponentParser.SelectOptionActionMapping[opt.action]}${opt.value ? `/${opt.value}` : ""}`,
        description: opt.description || undefined,
        emoji: opt.emoji ? validateEmoji(opt.emoji) : undefined,
      })),
      placeholder: comp.placeholder,
      min_values: 1,
      max_values: 1,
    } satisfies APIStringSelectComponent;
  }

  private parseMediaItem(item: SMMediaItem, asThumbnail: true): APIThumbnailComponent;
  private parseMediaItem(item: SMMediaItem, asThumbnail?: false): APIMediaGalleryItem;
  private parseMediaItem(
    item: SMMediaItem,
    asThumbnail: boolean = false,
  ): APIThumbnailComponent | APIMediaGalleryItem {
    if (asThumbnail) {
      return {
        type: ComponentType.Thumbnail,
        media: { url: item.url },
        description: item.description,
        spoiler: !!item.spoiler,
      };
    }
    return {
      media: { url: item.url },
      description: item.description,
      spoiler: !!item.spoiler,
    };
  }

  private parseSectionAccessory(
    comp: SMActionRowButton | SMThumbnailComponent,
  ): APISectionAccessoryComponent | undefined {
    if (comp.type === ComponentType.Button) {
      return this.parseButton(comp);
    }
    return this.parseMediaItem(comp, true);
  }
}
