// Shopee Ads / Marketing API wrappers.
//
// TODO (read-only first, per the agreed safe-first rollout):
//   getCampaignList(), getCampaignPerformance({ campaignId, days })
// TODO (gated writes, later phase — only once Ads write scope is confirmed
// and pause/budget-decrease has run safely for a while):
//   setCampaignBudget({ campaignId, newBudget, dryRun })
//   setCampaignBid({ campaignId, target, dryRun })
//   setCampaignStatus({ campaignId, status, dryRun })
// Every write must run through src/playbook/gates.js before any live call,
// and log to src/logging/actionLog.js on every live write.
