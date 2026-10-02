// node --env-file=.env scripts/authorize.mjs                          -> prints the authorize URL
// node --env-file=.env scripts/authorize.mjs --code X --shop-id Y     -> exchanges the callback code for tokens
import { generateAuthorizeUrl, exchangeCodeForTokens, checkAuthStatus } from '../src/shopee/auth.js';

const args = process.argv.slice(2);
const codeIdx = args.indexOf('--code');
const shopIdx = args.indexOf('--shop-id');

if (codeIdx === -1) {
  console.log('Visit this URL as the efloor Shopee shop owner and approve access:\n');
  console.log(generateAuthorizeUrl());
  console.log(
    '\nShopee then redirects to SHOPEE_REDIRECT_URL with `code` and `shop_id` query params. Re-run:\n' +
      'node --env-file=.env scripts/authorize.mjs --code <code> --shop-id <shop_id>'
  );
} else {
  const code = args[codeIdx + 1];
  const shopId = args[shopIdx + 1];
  if (!code || !shopId) throw new Error('Usage: scripts/authorize.mjs --code <code> --shop-id <shop_id>');

  await exchangeCodeForTokens(code, shopId);
  console.log('Tokens saved to secrets/shopee-tokens.json\n');
  console.log(checkAuthStatus());
}
