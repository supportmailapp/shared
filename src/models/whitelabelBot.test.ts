import mongoose from "mongoose";
import { afterAll, describe, expect, it } from "vitest";
import { WHITELABEL_COLLECTION, makeWhitelabelBotSchema } from "./whitelabelBot.js";

const schema = makeWhitelabelBotSchema({
  seal: (p, g) => `sealed:${g}:${p}`,
  open: (s, g) => {
    if (!s.startsWith(`sealed:${g}:`)) throw new Error("aad");
    return s.slice(`sealed:${g}:`.length);
  },
});
// Mongoose models are process-global: use a name no other test file or consumer
// registers, and delete it again when this file is done.
const MODEL_NAME = "WhitelabelBotSchemaTestModel";
const M = mongoose.model(MODEL_NAME, schema);

afterAll(() => {
  mongoose.deleteModel(MODEL_NAME);
});

describe("makeWhitelabelBotSchema", () => {
  it("setToken seals with the guild id, readToken opens", () => {
    const d = new M({ instanceId: "wl_x", guildId: "42" });
    d.setToken("abc");
    expect(d.token).toBe("sealed:42:abc");
    expect(d.readToken()).toBe("abc");
  });

  it("defaults and JSON never expose the token", () => {
    const d = new M({ instanceId: "wl_x", guildId: "42" });
    d.setToken("abc");
    expect(d.mode).toBe("main");
    expect(d.desiredStatus).toBe("stopped");
    expect(d.failure).toBeNull();
    expect(d.commandsHash).toBeNull();
    expect("token" in d.toJSON()).toBe(false);
    expect("token" in d.toObject()).toBe(false);
    expect(schema.path("token").options.select).toBe(false);
  });

  it("readToken throws when no token is loaded", () => {
    expect(() => new M({ instanceId: "wl_y", guildId: "43" }).readToken()).toThrow();
  });

  it("readToken throws when the sealed token belongs to another guild", () => {
    const d = new M({ instanceId: "wl_z", guildId: "44" });
    d.token = "sealed:other:abc";
    expect(() => d.readToken()).toThrow("aad");
  });

  it("declares unique indexes and a partial unique index on applicationId", () => {
    expect(WHITELABEL_COLLECTION).toBe("whitelabelBots");
    const indexes = schema.indexes();
    const app = indexes.find(([f]) => "applicationId" in f);
    expect(app?.[1]).toMatchObject({
      unique: true,
      partialFilterExpression: { applicationId: { $type: "string" } },
    });
    expect(schema.path("instanceId").options.unique).toBe(true);
    expect(schema.path("guildId").options.unique).toBe(true);
  });
});
