//#region src/utils/index.ts
/** Discord snowflakes are 17–20 digit numeric strings. */
function isSnowflake(v) {
	return /^\d{17,20}$/.test(v);
}
//#endregion
export { isSnowflake };
