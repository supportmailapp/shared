import { ButtonStyle, ComponentType, MessageFlags } from "discord-api-types/v10";
import { describe, expect, it } from "vitest";
import type { SMTopLevelMessageComponent } from "../../types/database/panel.js";
import { buildPanelPayload } from "./buildPanelPayload.js";
import { validateEmoji } from "./componentParser.js";

const text: SMTopLevelMessageComponent = { type: ComponentType.TextDisplay, content: "hello" };

const buttonRow = (button: Record<string, unknown>) =>
  ({
    type: ComponentType.ActionRow,
    components: [{ type: ComponentType.Button, style: ButtonStyle.Primary, label: "Go", ...button }],
  }) as unknown as SMTopLevelMessageComponent;

describe("buildPanelPayload", () => {
  it("sets the components v2 flag and default allowed mentions", () => {
    const res = buildPanelPayload({ data: [text], categoryIds: [], tagIds: [] });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.payload.flags).toBe(MessageFlags.IsComponentsV2);
    expect(res.payload.allowed_mentions).toEqual({ parse: [] });
  });

  it("maps a ticket:create button to createTicket/panel", () => {
    const res = buildPanelPayload({
      data: [buttonRow({ action: "ticket:create", custom_id: "cat1" })],
      categoryIds: ["cat1"],
      tagIds: [],
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const row = res.payload.components?.[0] as { components: { custom_id: string }[] };
    expect(row.components[0]!.custom_id.startsWith("createTicket/panel")).toBe(true);
  });

  it("rejects a reply button whose tag is unknown", () => {
    const res = buildPanelPayload({
      data: [buttonRow({ action: "reply", custom_id: "nope" })],
      categoryIds: [],
      tagIds: ["t1"],
    });
    expect(res).toEqual({ ok: false, code: "reply_without_tag" });
  });
});

describe("validateEmoji", () => {
  it("parses a custom emoji", () => {
    expect(validateEmoji("<a:wave:123456789012345678>")).toEqual({
      animated: true,
      name: "wave",
      id: "123456789012345678",
    });
  });

  it("parses a unicode emoji and rejects plain text", () => {
    expect(validateEmoji("\u{1F600}")).toEqual({ name: "\u{1F600}" });
    expect(validateEmoji("hello")).toBeUndefined();
  });
});
