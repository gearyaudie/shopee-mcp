// Shared interface so Tokopedia (phase 2) can slot in later without a
// rewrite of salesSync.js / the MCP tool layer. Those should consume this
// interface's normalized shapes, never a marketplace client directly.
//
// TODO (JSDoc as a stand-in for a formal type until this project picks a
// language/tooling choice):
//
// MarketplaceAdapter:
//   name: 'shopee' | 'tokopedia'
//   getOrders({ sinceDate, days }) -> Promise<NormalizedOrder[]>
//   getAdsPerformance({ campaignId, days }) -> Promise<NormalizedAdsReport>
//   adjustCampaignBudget({ campaignId, newBudget, dryRun }) -> Promise<AdjustResult>
//   adjustCampaignBid({ campaignId, target, dryRun }) -> Promise<AdjustResult>
//   setCampaignStatus({ campaignId, status, dryRun }) -> Promise<AdjustResult>
//   getAuthStatus() -> Promise<AuthStatus>
//
// NormalizedOrder: { orderId, date, sku, itemName, qty, unitPrice, status, ... }
// NormalizedAdsReport: { campaignId, spend, impressions, clicks, conversions, roasOrAcos }
