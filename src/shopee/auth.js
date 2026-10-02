import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { shopeeRequest } from './client.js';

const PARTNER_ID = process.env.SHOPEE_PARTNER_ID;
const PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY;
const API_HOST = process.env.SHOPEE_API_HOST;
const REDIRECT_URL = process.env.SHOPEE_REDIRECT_URL;

const TOKENS_PATH = path.resolve('secrets/shopee-tokens.json');
const REFRESH_WARNING_DAYS = 5;
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 30 * 60 * 1000;
const REFRESH_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function sign(baseString) {
  return crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');
}

function loadTokens() {
  if (!fs.existsSync(TOKENS_PATH)) return null;
  return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
}

function saveTokens(tokens) {
  fs.mkdirSync(path.dirname(TOKENS_PATH), { recursive: true });
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

// Not an API call — builds the browser URL the shop owner visits to approve
// this app. Signed the same way as any 'public' Shopee v2 endpoint.
export function generateAuthorizeUrl() {
  if (!PARTNER_ID || !PARTNER_KEY || !API_HOST || !REDIRECT_URL) {
    throw new Error('Missing env vars — need SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY, SHOPEE_API_HOST, SHOPEE_REDIRECT_URL');
  }
  const authPath = '/api/v2/shop/auth_partner';
  const timestamp = Math.floor(Date.now() / 1000);
  const base = `${PARTNER_ID}${authPath}${timestamp}`;

  const url = new URL(authPath, API_HOST);
  url.searchParams.set('partner_id', PARTNER_ID);
  url.searchParams.set('timestamp', String(timestamp));
  url.searchParams.set('sign', sign(base));
  url.searchParams.set('redirect', REDIRECT_URL);
  return url.toString();
}

function persistTokenResponse(data, shopId) {
  const now = Date.now();
  saveTokens({
    shop_id: Number(shopId),
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    access_token_expires_at: new Date(now + data.expire_in * 1000).toISOString(),
    // Shopee doesn't return the refresh token's own expiry — it's a fixed
    // 30-day window from issuance, so we track it ourselves from persist time.
    refresh_token_expires_at: new Date(now + REFRESH_TOKEN_LIFETIME_MS).toISOString(),
    last_refreshed_at: new Date(now).toISOString(),
  });
}

export async function exchangeCodeForTokens(code, shopId) {
  const data = await shopeeRequest({
    path: '/api/v2/auth/token/get',
    method: 'POST',
    authType: 'public',
    body: { code, shop_id: Number(shopId), partner_id: Number(PARTNER_ID) },
  });
  persistTokenResponse(data, shopId);
  return data;
}

export async function refreshAccessToken() {
  const tokens = loadTokens();
  if (!tokens) throw new Error('No stored Shopee tokens — run the shop authorization flow first (npm run authorize).');

  const data = await shopeeRequest({
    path: '/api/v2/auth/access_token/get',
    method: 'POST',
    authType: 'public',
    body: {
      refresh_token: tokens.refresh_token,
      shop_id: tokens.shop_id,
      partner_id: Number(PARTNER_ID),
    },
  });

  // Critical: Shopee rotates refresh_token on every use. Persisting the new
  // one here — not the old one — is what keeps this integration alive past
  // the 30-day window. A missed write here breaks all future refreshes.
  persistTokenResponse(data, tokens.shop_id);
  return data;
}

export async function getValidAccessToken() {
  const tokens = loadTokens();
  if (!tokens) throw new Error('No stored Shopee tokens — run the shop authorization flow first (npm run authorize).');

  const expiresAt = new Date(tokens.access_token_expires_at).getTime();
  if (expiresAt - Date.now() < ACCESS_TOKEN_REFRESH_BUFFER_MS) {
    await refreshAccessToken();
    return loadTokens().access_token;
  }
  return tokens.access_token;
}

export async function getShopId() {
  const tokens = loadTokens();
  if (tokens) return tokens.shop_id;
  const envShopId = process.env.SHOPEE_SHOP_ID;
  return envShopId ? Number(envShopId) : null;
}

export function checkAuthStatus() {
  const tokens = loadTokens();
  if (!tokens) {
    return { authorized: false, message: 'No tokens on file — shop authorization has not been completed.' };
  }

  const refreshExpiresAt = new Date(tokens.refresh_token_expires_at).getTime();
  const daysLeft = Math.floor((refreshExpiresAt - Date.now()) / (24 * 60 * 60 * 1000));

  return {
    authorized: true,
    shopId: tokens.shop_id,
    accessTokenExpiresAt: tokens.access_token_expires_at,
    refreshTokenExpiresAt: tokens.refresh_token_expires_at,
    refreshTokenDaysLeft: daysLeft,
    warning:
      daysLeft <= REFRESH_WARNING_DAYS
        ? `Refresh token expires in ${daysLeft} day(s) — re-run the shop authorization flow soon or this integration stops working.`
        : null,
  };
}
