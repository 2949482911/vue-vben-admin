/**
 * 订单类型
 */
export const ORDER_STATUS_MAP: Map<number, {
  label: string;
  value: number,
  color: string
}> = new Map<number, { label: string; value: number; color: string }>(
[
  [1, {
    label: `media.order.order_status.one`,
    value: 1,
    color: 'red'
  }],
  [0, {
    label: `media.order.order_status.one`,
    value: 0,
    color: 'red'
  }],
  [10, {
    label: `media.order.order_status.ten`,
    value: 10,
    color: 'green'
  }],
  [30, {
    label: `media.order.order_status.thirty`,
    value: 30,
    color: 'blue'
  }],
  [40, {
    label: `media.order.order_status.forty`,
    value: 40,
    color: 'orange'
  }],
  [50, {
    label: `media.order.order_status.fifty`,
    value: 50,
    color: 'red'
  }],
  [70, {
    label: `media.order.order_status.seventy`,
    value: 70,
    color: 'red'
  }],
  [80, {
    label: `media.order.order_status.eighty`,
    value: 80,
    color: 'red'
  }],
]
);


// 支付类型
export const KUAISHOU_PAY_METHOD: Map<number, {
  label: string;
  value: number,
  color: string
}> = new Map<number, { label: string; value: number; color: string }>(
  [[0, {
    label: `fixed.pay_method.zero`,
    value: 1,
    color: 'red'
  }],
    [1, {
      label: `fixed.pay_method.one`,
      value: 1,
      color: 'green'
    }],
    [2, {
      label: `fixed.pay_method.two`,
      value: 2,
      color: 'blue'
    }],
    [
      3, {
      label: `fixed.pay_method.three`,
      value: 3,
      color: 'orange'
    }],
    [99, {
      label: `fixed.pay_method.nine-nine`,
      value: 99,
      color: 'red'
    }],
    [88, {
      label: `fixed.pay_method.eight-eight`,
      value: 88,
      color: 'red'
    }]]
);


