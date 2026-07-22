//#region src/protocol/index.d.ts
/**
 * The manager's public view of one cluster.
 *
 * `status` is the opaque per-cluster payload the cluster attaches to its
 * HEARTBEAT (shard pings, guild/member counts, …). The manager forwards it
 * verbatim and never parses it, so its shape is defined by the bot, not the
 * manager. Typed as `unknown` here; narrow it in the statuspage with a
 * bot-specific type when consuming.
 */
interface ClusterState {
  clusterId: number;
  /** Shard IDs owned by this cluster. Omitted when empty. */
  shards?: number[];
  generation: number;
  alive: boolean;
  /** Unix ms of the last heartbeat; 0 if never seen. */
  lastBeat: number;
  /** Opaque bot-defined payload. Omitted when absent. */
  status?: unknown;
}
/**
 * Full active-fleet snapshot. Sent exactly once, as the first message on
 * connect, so a late joiner is brought up to date without any replay.
 */
interface SnapshotEvent {
  type: "snapshot";
  /** Omitted (not []) when the active fleet is empty — the Go side is omitempty. */
  clusters?: ClusterState[];
}
/**
 * A single cluster changed. Exactly one of `cluster` / `removed` is present:
 * `cluster` = upsert this cluster's state; `removed` = this clusterId went
 * away (disconnect or heartbeat-reap).
 */
interface DeltaEvent {
  type: "delta";
  cluster?: ClusterState;
  removed?: number;
}
/**
 * Bot-defined shape of `ClusterState.status`. NOT part of the manager wire —
 * the manager forwards this verbatim and never parses it. It is whatever the
 * SupportMail bot attaches to its HEARTBEAT. Keep in sync with the bot.
 *
 * Note the double nesting: this payload has its own `clusterId`/`shards`
 * (redundant with the outer ClusterState) and puts the actual stats under a
 * nested `status` object. Example wire value:
 *   { clusterId: 0, shards: [0,1],
 *     status: { guilds: 2, members: 202, shards: [{id,ping,status}, …] } }
 */
interface ShardStatusData {
  id: number;
  ping: number;
  /** Discord.js shard status enum value (ShardStatus in $lib). */
  status: number;
}
interface ClusterStatusPayload {
  clusterId?: number;
  /** Shard-ID list owned by the cluster (redundant with ClusterState.shards). */
  shards?: number[];
  /** Actual per-cluster stats — the fields the UI renders. */
  status?: {
    guilds?: number;
    members?: number;
    shards?: ShardStatusData[];
  };
}
/** One message on the wire. Discriminate on `type`. */
type StatusEvent = SnapshotEvent | DeltaEvent;
/** Type guard: full snapshot (first message on connect). */
declare function isSnapshot(e: StatusEvent): e is SnapshotEvent;
/** Type guard: single-cluster delta. */
declare function isDelta(e: StatusEvent): e is DeltaEvent;
/** True when a delta removes a cluster (rather than upserting one). */
declare function isRemoval(e: DeltaEvent): e is DeltaEvent & {
  removed: number;
};
//#endregion
export { ClusterState, ClusterStatusPayload, DeltaEvent, ShardStatusData, SnapshotEvent, StatusEvent, isDelta, isRemoval, isSnapshot };