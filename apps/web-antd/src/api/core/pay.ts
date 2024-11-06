import type { OrderItem, OrderSearchParams } from '#/api/models/pay';

import { requestClient } from '#/api/request';

export async function fetchOrderList(params: OrderSearchParams) {
  return requestClient.get<OrderItem[]>('/pay/order/list', params);
}
