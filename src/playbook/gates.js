// Gate definitions for autonomous ad changes, mirroring the Gates table in
// efloor's docs/ads/operating-playbook.md. Thresholds below are placeholders
// until real Shopee order/spend volume exists to calibrate them.
//
// Escalation tiers:
//   Tier 0 (always autonomous): all read-only tools.
//   Tier 1 (autonomous once gated, logged): budget/bid decreases, pausing
//     underperformers.
//   Tier 2 (dry_run + explicit user go-ahead even if gate met): budget/bid
//     increases, resuming a paused campaign.
//   Tier 3 (never autonomous): creating/deleting campaigns, touching
//     protected settings, changes beyond the per-change cap.
//
// TODO: implement evaluateGate(action, context) -> { allowed, tier, reason }
// once real campaign data exists to set numeric thresholds (e.g. minimum
// days of stable performance, minimum order volume before trusting ROAS).
