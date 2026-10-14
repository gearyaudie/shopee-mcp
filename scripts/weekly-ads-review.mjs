// node --env-file=.env scripts/weekly-ads-review.mjs [days]
// Read-only. Lists campaigns, joins their current settings (budget/status)
// with recent performance (spend/clicks/GMV/roi), so you can see whether a
// budget increase actually moved the numbers.
//
// If any expected field prints as `undefined`, the --raw dump at the bottom
// shows Shopee's actual response shape — use that to correct src/shopee/ads.js
// (see the caution note at the top of that file).
import { getCampaignList, getCampaignSettings, getCampaignPerformance } from '../src/shopee/ads.js';

const days = Number(process.argv[2] ?? 7);
const showRaw = process.argv.includes('--raw');

const campaigns = await getCampaignList();
console.log(`${campaigns.length} campaign(s) found.\n`);

if (campaigns.length === 0) {
  console.log('Nothing to review — either no campaigns exist, or this app/shop lacks Ads API read scope.');
  process.exit(0);
}

const campaignIds = campaigns.map((c) => c.campaign_id ?? c.campaignId).filter(Boolean);

const [settings, performance] = await Promise.all([
  getCampaignSettings(campaignIds),
  getCampaignPerformance({ campaignIds, days }),
]);

const settingsById = new Map(settings.map((s) => [s.campaign_id ?? s.campaignId, s]));
const perfById = new Map(performance.map((p) => [p.campaign_id ?? p.campaignId, p]));

console.log(`Last ${days} day(s):\n`);
for (const id of campaignIds) {
  const s = settingsById.get(id) ?? {};
  const p = perfById.get(id) ?? {};
  console.log(
    `Campaign ${id} | status=${s.campaign_status ?? '?'} | budget/day=${s.campaign_budget ?? '?'} | ` +
      `spend=${p.expense ?? '?'} | clicks=${p.clicks ?? '?'} | impressions=${p.impression ?? '?'} | ` +
      `GMV=${p.broad_gmv ?? '?'} | orders=${p.broad_order ?? '?'} | ROI=${p.broad_roi ?? '?'}`
  );
}

if (showRaw) {
  console.log('\n--- raw settings ---');
  console.log(JSON.stringify(settings, null, 2));
  console.log('\n--- raw performance ---');
  console.log(JSON.stringify(performance, null, 2));
}
