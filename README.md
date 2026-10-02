# shopee-mcp

Shopee Open Platform integration for efloor: daily sales sync into the
"efloor masterdata" Google Sheet, plus Shopee Ads monitoring/control — driven
by an MCP server, mirroring the existing `google-ads-mcp` setup.

See the full architecture plan in the Claude Code session that created this
repo (`shopee-developer-api-claude-smooth-fountain.md`) for the complete
design, safety gates, and phased rollout.

## Status

Scaffold only — directory structure and `.env` skeleton are in place.
Implementation (Shopee client, auth/token handling, Sheets sync, MCP server)
comes next, once credentials below are filled in.

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `SHOPEE_PARTNER_ID` / `SHOPEE_PARTNER_KEY` — from the Shopee Open
     Platform console, for your approved app.
   - `SHOPEE_API_HOST` — sandbox host while testing, live host once the shop
     is actually connected.
   - `SHOPEE_REDIRECT_URL` — the redirect URL registered on the app, used
     during the one-time shop authorization.
   - `MASTERDATA_SHEET_ID` — the efloor masterdata spreadsheet's id.
2. Create a Google Cloud service account, download its JSON key to
   `secrets/gcp-service-account.json` (gitignored), and share the masterdata
   spreadsheet with the service account's email as Editor.
3. Run `npm install` once dependencies are added (Shopee client + Google
   APIs client library).
4. Complete the one-time Shopee shop authorization (OAuth-style authorize
   redirect) to produce the first `access_token`/`refresh_token` pair —
   stored in `secrets/shopee-tokens.json` (gitignored), never in `.env`.

**Never commit `.env` or anything under `secrets/`** — both are gitignored.

## Layout

```
src/
  shopee/     — signed HTTP client, auth/token refresh+rotation, orders, ads, shop info
  sheets/     — Google Sheets API client, idempotent sales-sync logic
  adapters/   — MarketplaceAdapter interface (Shopee now, Tokopedia later)
  playbook/   — safety gates for autonomous ad changes
  logging/    — audit log of every automated write
  mcp/        — MCP server exposing tools to Claude
scripts/      — thin CLI wrappers over src/, for manual local runs
docs/         — operating playbook + baseline snapshot, same convention as
                efloor's docs/ads/
```

## Safety model

Every write action (sales sync, campaign budget/bid/status changes) supports
`dry_run: true` and must be run that way first. Live ad-spend changes are
tiered by risk (read-only → reversible changes → gated increases → never
autonomous) — see `docs/operating-playbook.md` once populated with real
account data.
