// node --env-file=.env scripts/list-recent-orders.mjs [days]
// Read-only — lists real orders from the connected shop. No writes anywhere.
import { getOrderList, getOrderDetail } from '../src/shopee/orders.js';

const days = Number(process.argv[2] ?? 7);
const orders = await getOrderList({ days });
console.log(`Found ${orders.length} order(s) in the last ${days} day(s).\n`);

if (orders.length > 0) {
  const details = await getOrderDetail(orders.map((o) => o.order_sn));
  for (const order of details) {
    const itemCount = order.item_list?.length ?? 0;
    console.log(
      `${order.order_sn} | ${order.order_status} | created=${order.create_time} | items=${itemCount} | total=${order.total_amount}`
    );
  }
}
