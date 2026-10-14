// node --env-file=.env scripts/check-ads-eligibility.mjs
// Minimal read call to confirm this app/shop actually has Ads API scope
// before trusting weekly-ads-review's output. A clean empty/populated list
// means read access works; an error (especially permission-shaped) means the
// Ads API scope isn't granted on this app yet.
import { getCampaignList } from '../src/shopee/ads.js';

try {
  const campaigns = await getCampaignList({ limit: 1 });
  console.log(`Ads API read access confirmed. Found ${campaigns.length} campaign(s) in the first page.`);
} catch (err) {
  console.error('Ads API call failed — likely missing scope, or the endpoint/params need correcting:');
  console.error(err.message);
  process.exit(1);
}
