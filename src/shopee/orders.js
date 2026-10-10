import { shopeeRequest } from './client.js';
import { getValidAccessToken, getShopId } from './auth.js';

const ORDER_DETAIL_BATCH_SIZE = 50;

export async function getOrderList({ days = 3, pageSize = 50, orderStatus } = {}) {
  const accessToken = await getValidAccessToken();
  const shopId = await getShopId();

  const timeTo = Math.floor(Date.now() / 1000);
  const timeFrom = timeTo - days * 24 * 60 * 60;

  const orders = [];
  let cursor = '';
  let more = true;

  while (more) {
    const query = {
      time_range_field: 'create_time',
      time_from: timeFrom,
      time_to: timeTo,
      page_size: pageSize,
      cursor,
    };
    if (orderStatus) query.order_status = orderStatus;

    const data = await shopeeRequest({
      path: '/api/v2/order/get_order_list',
      authType: 'shop',
      accessToken,
      shopId,
      query,
    });

    orders.push(...(data.response?.order_list ?? []));
    more = data.response?.more ?? false;
    cursor = data.response?.next_cursor ?? '';
  }

  return orders;
}

export async function getOrderDetail(orderSns) {
  if (orderSns.length === 0) return [];
  const accessToken = await getValidAccessToken();
  const shopId = await getShopId();

  const details = [];
  for (let i = 0; i < orderSns.length; i += ORDER_DETAIL_BATCH_SIZE) {
    const chunk = orderSns.slice(i, i + ORDER_DETAIL_BATCH_SIZE);
    const data = await shopeeRequest({
      path: '/api/v2/order/get_order_detail',
      authType: 'shop',
      accessToken,
      shopId,
      query: {
        order_sn_list: chunk.join(','),
        response_optional_fields: 'item_list,total_amount,buyer_username,order_status,create_time,update_time',
      },
    });
    details.push(...(data.response?.order_list ?? []));
  }

  return details;
}
