# CLAUDE.md

Guidance for Claude Code in `shared/` (`@supportmailapp/shared`). See `README.md` for exports, install and publishing.

## Commands

Run pnpm from Windows (PowerShell or Git Bash on Windows), not WSL.

```bash
pnpm test        # vitest run
pnpm typecheck   # tsc --noEmit
pnpm build       # tsdown -> dist/
```

## Tiers

- `/types`, `/protocol`, `/utils`: pure and portable (browser, CF Workers, Bun, Node).
- `/models`: **server-only (Node/Bun)**. It imports `node:crypto` and `node:fs` (whitelabel token crypto and key loading), so it must never be imported from browser or Workers code.
  Exports schema factories and the whitelabel crypto helpers, never registered models. `mongoose` is a `peerDependency`.

## Whitelabel token crypto (`src/models/whitelabelCrypto.ts`)

Key is 32 random bytes stored as canonical base64 text. Sealed format is `v1.` + base64(iv(12)|tag(16)|ct), AES-256-GCM, AAD `whitelabel-token:v1:<guildId>`. Do not change the sealed format.
