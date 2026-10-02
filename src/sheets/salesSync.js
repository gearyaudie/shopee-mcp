// Idempotent sales sync into the "Shopee Sync" tab of efloor masterdata.
//
// NEVER write into the hand-maintained ledger tab (currently named something
// like "SEPTEMBER 2026 EFLOOR SHOPEE/TOKPED") — it has manual COGS/profit
// formulas and inconsistent order-id usage. This owns a dedicated tab only.
//
// TODO:
// 1. Read existing order_sn values from the "Shopee Sync" tab (one ranged
//    read) to build a dedupe set.
// 2. Fetch orders via src/shopee/orders.js for the sync window.
// 3. New order_sn -> append row. Existing order_sn with a changed
//    order_status -> update that row in place (targeted range update), don't
//    duplicate.
// 4. dryRun: true -> compute the diff in memory, return it, make zero Sheets
//    API write calls.
// 5. Return a summary: { ordersSeen, new, updated, skipped }.
//
// Before finalizing the tab's columns, re-verify the sheet's actual current
// header row / tab list via the Sheets API client (src/sheets/client.js) —
// don't assume the column list in docs/operating-playbook.md is final.
//
// Proposed columns (starting point, confirm against the real sheet first):
// order_sn | order_status | order_date | sku | item_name | variation | qty |
// unit_price | item_total | order_total | buyer_username | shipping_carrier |
// synced_at | channel
