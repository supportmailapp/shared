//#region src/utils/index.d.ts
/** Discord snowflakes are 17–20 digit numeric strings. */
declare function isSnowflake(v: string): boolean;
//#endregion
export { isSnowflake };