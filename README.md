# shopee-mcp

Shopee Open Platform integration for efloor: daily sales sync into the
"efloor masterdata" Google Sheet, plus Shopee Ads monitoring/control — driven
by an MCP server, mirroring the existing `google-ads-mcp` setup.

See the full architecture plan in the Claude Code session that created this
repo (`shopee-developer-api-claude-smooth-fountain.md`) for the complete
design, safety gates, and phased rollout.

## Status

`.env` filled in locally. Shopee client (`src/shopee/client.js`) and the
shop-authorization/token-refresh flow (`src/shopee/auth.js`) are implemented
and untested against a real app — next step is running the authorize flow
below. Sheets sync, orders, ads, and the MCP server are still stubs.

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `SHOPEE_PARTNER_ID` / `SHOPEE_PARTNER_KEY` — from the Shopee Open
     Platform console, for your approved app.
   - `SHOPEE_API_HOST` — sandbox host while testing, live host once the shop
     is actually connected.
   - `SHOPEE_REDIRECT_URL` — the redirect URL registered on the app, used
     during the one-time shop authorization.
   - `MASTERDATA_SHEET_ID` — the efloor masterdata spreadsheet's id.
2. Run `npm run authorize` — prints a URL. Visit it as the efloor Shopee shop
   owner and approve access. Shopee redirects to `SHOPEE_REDIRECT_URL` with
   `code` and `shop_id` query params; re-run with
   `npm run authorize -- --code <code> --shop-id <shop_id>` to exchange them
   for the first token pair, saved to `secrets/shopee-tokens.json`.
3. `npm run auth-status` any time to check token/refresh expiry.
   `npm run refresh-token` forces a refresh cycle (useful to confirm rotation
   is actually being persisted — run it twice in a row and diff the file).
4. Create a Google Cloud service account, download its JSON key to
   `secrets/gcp-service-account.json` (gitignored), and share the masterdata
   spreadsheet with the service account's email as Editor.

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
