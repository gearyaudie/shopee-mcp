// Shop-level OAuth token handling — the single highest-risk correctness point
// in this project.
//
// TODO: implement:
// - generateAuthorizeUrl(): builds the one-time shop authorization URL
//   (partner_id, redirect, signed, timestamped) for the shop owner to visit.
// - exchangeCodeForTokens(code, shopId): exchanges the authorize callback's
//   `code` for the first access_token/refresh_token pair.
// - getValidAccessToken(): reads secrets/shopee-tokens.json, refreshes
//   proactively if access_token has <30 min left, and — critically —
//   immediately persists the NEW rotated refresh_token Shopee returns on
//   every refresh call. A missed rotation write silently breaks all future
//   refreshes.
// - checkAuthStatus(): reports days-until-refresh-token-expiry (~30 days),
//   surfaces a loud warning inside ~5 days of expiry since only a manual
//   re-authorization can recover after that.
//
// secrets/shopee-tokens.json shape:
// {
//   "shop_id": 123456,
//   "access_token": "...",
//   "refresh_token": "...",
//   "access_token_expires_at": "2026-01-01T00:00:00Z",
//   "refresh_token_expires_at": "2026-01-31T00:00:00Z",
//   "last_refreshed_at": "2026-01-01T00:00:00Z"
// }
// This file is the ONLY thing allowed to read/write that path.
