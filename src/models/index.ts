// Shared Mongoose schema factories.
//
// SCOPE (deliberate): this tier holds ONLY schemas that need env-specific
// crypto injected — today just userTokens. Pure schemas (guild, report, tag, …)
// stay duplicated in each app for now; they carry no env/crypto and their small
// drift isn't worth the reconcile cost yet. Revisit if the duplication bites.
//
// Exports schema *builders*, never ready-made models. Env-specific concerns
// (encryption key source, extra fields, the per-process model singleton guard)
// stay in the consuming app. mongoose is a peerDependency so the app's single
// mongoose instance is used — two instances break the
// `models.X ? model(X) : model(X, schema)` guard.

export { makeUserTokenSchema, type UserTokenSchemaOptions } from "./userTokens.js";
