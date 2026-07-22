# @supportmailapp/shared

Shared TypeScript for the SupportMail Discord bot ecosystem. Published to GitHub Packages, ESM-only, built with [tsdown](https://tsdown.dev). Supersedes the old `sm-types` git submodule over time.

## Exports

Subpath exports, one per tier:

| Import                            | Holds                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@supportmailapp/shared/types`    | Pure types + enums. Zero deps — safe anywhere (browser, CF Workers, Bun, Node).                                                                   |
| `@supportmailapp/shared/protocol` | `sm-manager` status WebSocket types + guards (`isSnapshot`, `isDelta`, `isRemoval`). Mirrors the Go wire types; `PROTOCOL.md` is source of truth. |
| `@supportmailapp/shared/utils`    | Pure portable helpers. Zero env/crypto/IO.                                                                                                        |
| `@supportmailapp/shared/models`   | Mongoose schema **factories** (not ready-made models). See below.                                                                                 |

## Models: factory boundary

The `/models` tier exports schema _builders_, never registered models — because env-specific crypto (`v2`: Bun `process.env.DB_ENCRYPTION_KEY`; `dashboard`: SvelteKit `$env/static/private`) and the per-process model singleton guard must live in the consuming app. `mongoose` is a `peerDependency` so the app's single instance is used.

Currently holds only `makeUserTokenSchema` (needs injected crypto). Pure schemas (guild, report, tag, …) stay duplicated per app for now.

```ts
import mongoose from "mongoose";
import { makeUserTokenSchema } from "@supportmailapp/shared/models";

// encrypt/decrypt resolved from the app's own env — see each app's userTokens.ts
const schema = makeUserTokenSchema({ encrypt, decrypt });

const { models } = mongoose;
export const UserToken = models.UserToken
  ? mongoose.model("UserToken")
  : mongoose.model("UserToken", schema, "userTokens");
```

## Installation

Needs a `read:packages` token.

**pnpm / npm** — `.npmrc`:

```bash
@supportmailapp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**Bun** — `bunfig.toml`:

```toml
[install.scopes]
"@supportmailapp" = { token = "$GITHUB_TOKEN", url = "https://npm.pkg.github.com/" }
```

If `bunfig.toml` sets `minimumReleaseAge`, exempt this package or fresh publishes are blocked:

```toml
minimumReleaseAgeExcludes = ["@supportmailapp/shared"]
```

## Development

```bash
pnpm build       # tsdown → dist/ (ESM + .d.ts; also regenerates the exports map)
pnpm dev         # watch
pnpm typecheck
pnpm format
```

## Publishing

GitHub Actions (`.github/workflows/release.yml`), published with the built-in `GITHUB_TOKEN` — no PAT.

- **Release** (normal): bump `version` in the commit you tag, create the GitHub release → publishes that version.
- **Manual dispatch**: run the workflow with a `version` input to override for that run only.
