import "discord-api-types/v10";
import { z } from "zod/mini";
//#region src/types/utils/enums.ts
let ReportNotificationType = /* @__PURE__ */ function(ReportNotificationType) {
	ReportNotificationType[ReportNotificationType["ActionTaken"] = 0] = "ActionTaken";
	ReportNotificationType[ReportNotificationType["ReportSummary"] = 1] = "ReportSummary";
	ReportNotificationType[ReportNotificationType["ModeratorInfo"] = 2] = "ModeratorInfo";
	return ReportNotificationType;
}({});
const BlacklistScopes = {
	global: 1,
	tickets: 2,
	reports: 4,
	tags: 8
};
const BlacklistScopesMap = {
	[BlacklistScopes.global.toString()]: "global",
	[BlacklistScopes.tickets.toString()]: "tickets",
	[BlacklistScopes.reports.toString()]: "reports",
	[BlacklistScopes.tags.toString()]: "tags"
};
const MinBlacklistScope = BlacklistScopes.tickets;
const MaxBlacklistScope = BlacklistScopes.tags;
let ReportStatus = /* @__PURE__ */ function(ReportStatus) {
	ReportStatus[ReportStatus["ignored"] = 0] = "ignored";
	ReportStatus[ReportStatus["open"] = 1] = "open";
	ReportStatus[ReportStatus["timeouted"] = 2] = "timeouted";
	ReportStatus[ReportStatus["kicked"] = 3] = "kicked";
	ReportStatus[ReportStatus["banned"] = 4] = "banned";
	ReportStatus[ReportStatus["messageDeleted"] = 5] = "messageDeleted";
	ReportStatus[ReportStatus["resolved"] = 6] = "resolved";
	return ReportStatus;
}({});
let TicketStatus = /* @__PURE__ */ function(TicketStatus) {
	TicketStatus[TicketStatus["closed"] = 0] = "closed";
	TicketStatus[TicketStatus["open"] = 1] = "open";
	TicketStatus[TicketStatus["closeRequested"] = 2] = "closeRequested";
	return TicketStatus;
}({});
let TicketState = /* @__PURE__ */ function(TicketState) {
	TicketState[TicketState["unanswered"] = 1] = "unanswered";
	TicketState[TicketState["pendingQR"] = 2] = "pendingQR";
	TicketState[TicketState["uResponded"] = 3] = "uResponded";
	TicketState[TicketState["awaitingRes"] = 4] = "awaitingRes";
	return TicketState;
}({});
let SpecialChannelType = /* @__PURE__ */ function(SpecialChannelType) {
	SpecialChannelType[SpecialChannelType["Category"] = 0] = "Category";
	SpecialChannelType[SpecialChannelType["Channel"] = 1] = "Channel";
	return SpecialChannelType;
}({});
let ClientAPIErrorCodes = /* @__PURE__ */ function(ClientAPIErrorCodes) {
	ClientAPIErrorCodes[ClientAPIErrorCodes["MissingPermissions"] = 0] = "MissingPermissions";
	ClientAPIErrorCodes[ClientAPIErrorCodes["CategoryCreateFailed"] = 1] = "CategoryCreateFailed";
	ClientAPIErrorCodes[ClientAPIErrorCodes["ForumCreationFailed"] = 2] = "ForumCreationFailed";
	ClientAPIErrorCodes[ClientAPIErrorCodes["GuildNotFound"] = 3] = "GuildNotFound";
	ClientAPIErrorCodes[ClientAPIErrorCodes["CommunityNotEnabled"] = 4] = "CommunityNotEnabled";
	ClientAPIErrorCodes[ClientAPIErrorCodes["CategoryNotFound"] = 5] = "CategoryNotFound";
	return ClientAPIErrorCodes;
}({});
/**
* An enum representing the type of entity.
*/
let EntityType = /* @__PURE__ */ function(EntityType) {
	EntityType[EntityType["role"] = 0] = "role";
	EntityType[EntityType["user"] = 1] = "user";
	EntityType[EntityType["guild"] = 2] = "guild";
	return EntityType;
}({});
let LogEventType = /* @__PURE__ */ function(LogEventType) {
	LogEventType["TestEvent"] = "testEvent";
	LogEventType["InternalConfigLoad"] = "internalConfigLoad";
	LogEventType["TicketCreated"] = "ticketCreate";
	LogEventType["TicketClosed"] = "ticketClose";
	LogEventType["TicketReopened"] = "ticketReopen";
	LogEventType["TicketDeleted"] = "ticketDelete";
	return LogEventType;
}({});
let UserRole = /* @__PURE__ */ function(UserRole) {
	/**
	* Represents a regular user with no special permissions.
	*
	* This is the default role when no role is given.
	*/
	UserRole[UserRole["User"] = 0] = "User";
	/**
	* Represents a user with administrative permissions.
	*/
	UserRole[UserRole["Admin"] = 1] = "Admin";
	/**
	* Represents a user with permissions to moderate and manage appeals as well as reports.
	*/
	UserRole[UserRole["Moderator"] = 2] = "Moderator";
	return UserRole;
}({});
//#endregion
//#region src/types/utils/helperTypes.ts
/**
* Does the `1 << n` operation.
*
* Example: You wanna check if bit 3 is set in a bitfield, you can do:
* ```ts
* const bitToCheck = bitfieldBit(3); // 8
* if (bitfield & bitToCheck) {
*   // Bit 3 is set
* }
* ```
*/
function bitfieldBit(n) {
	return BigInt(1) << BigInt(n);
}
//#endregion
//#region src/types/utils/validators.ts
const SnowflakeSchema = z.string().check(z.regex(/^\d{17,23}$/, "Invalid Snowflake"));
const APIAllowedMentionsSchema = z.object({
	everyone: z._default(z.boolean(), false),
	userMode: z._default(z.enum([
		"all",
		"none",
		"specific"
	]), "none"),
	roleMode: z._default(z.enum([
		"all",
		"none",
		"specific"
	]), "none"),
	users: z.optional(z.array(SnowflakeSchema).check(z.maxLength(100, "Maximum of 100 user mentions"))),
	roles: z.optional(z.array(SnowflakeSchema).check(z.maxLength(100, "Maximum of 100 role mentions")))
});
//#endregion
export { APIAllowedMentionsSchema, BlacklistScopes, BlacklistScopesMap, ClientAPIErrorCodes, EntityType, LogEventType, MaxBlacklistScope, MinBlacklistScope, ReportNotificationType, ReportStatus, SnowflakeSchema, SpecialChannelType, TicketState, TicketStatus, UserRole, bitfieldBit };
