// Low-level signed HTTP client for Shopee Open Platform v2.
//
// TODO: implement HMAC-SHA256 request signing per Shopee's v2 spec —
// sign(partner_id + path + timestamp [+ access_token + shop_id]) using
// SHOPEE_PARTNER_KEY, per the endpoint's auth tier (public / shop-level /
// merchant-level sign differently). Reads SHOPEE_API_HOST, SHOPEE_PARTNER_ID,
// SHOPEE_PARTNER_KEY from env. Needs real partner credentials to build and
// test against — see .env.example.
