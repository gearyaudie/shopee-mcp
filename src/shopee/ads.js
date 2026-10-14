// Shopee Ads / Marketing API wrappers — READ-ONLY for now, per the safe-first
// rollout (see docs/operating-playbook.md once populated).
//
// CAUTION: these endpoint paths and field names are from training knowledge,
// not a live doc fetch (open.shopee.com is unreachable from this dev
// environment's network policy). Treat the first real run as the actual
// verification step — Shopee's response shape is the ground truth, not this
// file's assumptions. If a field below comes back undefined/missing, check
// scripts/weekly-ads-review.mjs's raw-response dump to see what's really
// there and fix the mapping.
import { shopeeRequest } from './client.js';
import { getValidAccessToken, getShopId } from './auth.js';

export async function getCampaignList({ adType = 'all', offset = 0, limit = 100 } = {}) {
  const accessToken = await getValidAccessToken();
  const shopId = await getShopId();

  const data = await shopeeRequest({
    path: '/api/v2/ads/get_product_level_campaign_id_list',
    authType: 'shop',
    accessToken,
    shopId,
    query: { ad_type: adType, offset, limit },
  });

  return data.response?.campaign_list ?? [];
}

export async function getCampaignSettings(campaignIds) {
  if (campaignIds.length === 0) return [];
  const accessToken = await getValidAccessToken();
  const shopId = await getShopId();

  const data = await shopeeRequest({
    path: '/api/v2/ads/get_product_campaign_settings_info',
    authType: 'shop',
    accessToken,
    shopId,
    query: { campaign_id_list: campaignIds.join(',') },
  });

  return data.response?.campaign_list ?? [];
}

export async function getCampaignPerformance({ campaignIds, days = 7 }) {
  if (campaignIds.length === 0) return [];
  const accessToken = await getValidAccessToken();
  const shopId = await getShopId();

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const data = await shopeeRequest({
    path: '/api/v2/ads/get_product_campaign_daily_performance',
    authType: 'shop',
    accessToken,
    shopId,
    query: {
      campaign_id_list: campaignIds.join(','),
      start_date: fmt(startDate),
      end_date: fmt(endDate),
    },
  });

  return data.response?.campaign_list ?? [];
}
