import crypto from 'node:crypto';

const PARTNER_ID = process.env.SHOPEE_PARTNER_ID;
const PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY;
const API_HOST = process.env.SHOPEE_API_HOST;

function assertConfigured() {
  if (!PARTNER_ID || !PARTNER_KEY || !API_HOST) {
    throw new Error(
      'Missing Shopee env vars — set SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY, SHOPEE_API_HOST in .env'
    );
  }
}

function sign(baseString) {
  return crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');
}

// Shopee v2 signs a different base string depending on the endpoint's auth
// tier: 'public' endpoints (token exchange/refresh) sign partner_id+path+ts;
// 'shop' endpoints additionally fold access_token+shop_id into both the
// signed base string and the query params.
function buildSignedParams({ path, timestamp, authType, accessToken, shopId }) {
  let base = `${PARTNER_ID}${path}${timestamp}`;
  const params = { partner_id: PARTNER_ID, timestamp };

  if (authType === 'shop') {
    if (!accessToken || !shopId) {
      throw new Error(`shopeeRequest: authType 'shop' requires accessToken and shopId (path ${path})`);
    }
    base += `${accessToken}${shopId}`;
    params.access_token = accessToken;
    params.shop_id = shopId;
  }

  params.sign = sign(base);
  return params;
}

export async function shopeeRequest({
  path,
  method = 'GET',
  authType = 'public',
  accessToken,
  shopId,
  query = {},
  body,
}) {
  assertConfigured();
  const timestamp = Math.floor(Date.now() / 1000);
  const signedParams = buildSignedParams({ path, timestamp, authType, accessToken, shopId });

  const url = new URL(path, API_HOST);
  for (const [key, value] of Object.entries({ ...signedParams, ...query })) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Shopee API error [${data.error}] on ${path}: ${data.message}`);
  }
  return data;
}
