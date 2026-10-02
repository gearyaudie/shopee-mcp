// node --env-file=.env scripts/debug-env.mjs
// Prints lengths/fingerprints only — never the real partner key — to catch
// hidden whitespace, stray quotes, or copy-paste truncation in .env values.
import crypto from 'node:crypto';

function show(name, { secret = false } = {}) {
  const raw = process.env[name] ?? '';
  const hasLeadingOrTrailingWhitespace = raw !== raw.trim();
  if (secret) {
    const fingerprint = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 12);
    console.log(`${name}: length=${raw.length}, fingerprint=${fingerprint}, trimWarning=${hasLeadingOrTrailingWhitespace}`);
  } else {
    console.log(`${name}: "${raw}" length=${raw.length} trimWarning=${hasLeadingOrTrailingWhitespace}`);
  }
}

show('SHOPEE_PARTNER_ID');
show('SHOPEE_PARTNER_KEY', { secret: true });
show('SHOPEE_API_HOST');
show('SHOPEE_REDIRECT_URL');
