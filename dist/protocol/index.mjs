//#region src/protocol/index.ts
/** Type guard: full snapshot (first message on connect). */
function isSnapshot(e) {
	return e.type === "snapshot";
}
/** Type guard: single-cluster delta. */
function isDelta(e) {
	return e.type === "delta";
}
/** True when a delta removes a cluster (rather than upserting one). */
function isRemoval(e) {
	return typeof e.removed === "number";
}
//#endregion
export { isDelta, isRemoval, isSnapshot };
