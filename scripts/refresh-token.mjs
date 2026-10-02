// node --env-file=.env scripts/refresh-token.mjs
// Forces a manual refresh cycle and prints the new expiry — run this twice in
// a row to verify rotation is actually being persisted (see plan's
// Verification section).
import { refreshAccessToken, checkAuthStatus } from '../src/shopee/auth.js';

await refreshAccessToken();
console.log('Refreshed.\n');
console.log(checkAuthStatus());
