// MCP server entrypoint. Registers the tools below, each a thin wrapper over
// src/adapters/shopeeAdapter.js + src/sheets/salesSync.js, so the MCP tool
// layer and the manual scripts/ CLI wrappers call identical logic.
//
// TODO once src/shopee/* and src/sheets/* are implemented:
//   sync_daily_sales        — src/sheets/salesSync.js, dry_run supported
//   weekly_ads_review       — read-only ads report
//   get_ads_performance     — narrower read-only ads report
//   adjust_campaign_budget  — gated write, dry_run first
//   adjust_campaign_bid     — gated write, dry_run first
//   pause_campaign / resume_campaign — gated write, dry_run first
//   check_campaign_conflicts — read-only sanity check
//   list_protected_settings — read-only
//   get_auth_status         — read-only, token/refresh expiry
