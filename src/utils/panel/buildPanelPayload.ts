// Builds the Discord message payload for a SupportMail panel. Pure: no env, no I/O.
// Used by sm-api and the dashboard so a panel looks identical whichever bot sends it.

import {
  MessageFlags,
  type APIAllowedMentions,
  type RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import type { SMTopLevelMessageComponent } from "$types/database/panel.js";
import { ComponentParser } from "./componentParser.js";

export type BuildPanelPayloadInput = {
  data: SMTopLevelMessageComponent[];
  allowedMentions?: APIAllowedMentions | null;
  /** Ids of the guild's ticket categories. */
  categoryIds: string[];
  /** Ids of the guild's tags. */
  tagIds: string[];
};

export type BuildPanelPayloadResult =
  { ok: true; payload: RESTPostAPIChannelMessageJSONBody } | { ok: false; code: "reply_without_tag" };

/**
 * `ComponentParser` silently drops reply buttons without a valid tag, so reject them up front.
 * Walks the whole tree because reply buttons also live in containers and section accessories.
 */
function hasUnsetReply(node: unknown, tagIds: string[]): boolean {
  if (Array.isArray(node)) return node.some((n) => hasUnsetReply(n, tagIds));
  if (!node || typeof node !== "object") return false;
  const n = node as Record<string, unknown>;
  if (n.action === "reply" && !tagIds.includes(String(n.custom_id ?? ""))) return true;
  return Object.values(n).some((v) => hasUnsetReply(v, tagIds));
}

export function buildPanelPayload(input: BuildPanelPayloadInput): BuildPanelPayloadResult {
  const { data, allowedMentions, categoryIds, tagIds } = input;
  if (hasUnsetReply(data, tagIds)) return { ok: false, code: "reply_without_tag" };

  const parsed = new ComponentParser(data, { categories: categoryIds, tags: tagIds }).parse();

  return {
    ok: true,
    payload: {
      flags: MessageFlags.IsComponentsV2,
      components: parsed,
      allowed_mentions: allowedMentions ?? { parse: [] },
    },
  };
}
