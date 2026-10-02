// Shopee Order API wrappers.
//
// TODO: getOrderList({ sinceDate, days }) -> order_sn list + status
//       getOrderDetail(orderSns) -> line items, amounts, buyer info, status
// Normalize into the NormalizedOrder shape consumed by sheets/salesSync.js
// and the MarketplaceAdapter interface (src/adapters/marketplaceAdapter.js).
