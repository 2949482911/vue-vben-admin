/**
 * 订单状态
 */
export const BILIBILI_ORDER_STATUS_MAP: Map<number, {
  label: string;
  value: number;
  color: string;
}> = new Map<number, { label: string; value: number; color: string }>(
  [
    [1, {
      label: '待支付',
      value: 1,
      color: 'orange'
    }],
    [2, {
      label: '支付失败',
      value: 2,
      color: 'red'
    }],
    [3, {
      label: '待发货',
      value: 3,
      color: 'green'
    }],
    [4, {
      label: '待收货',
      value: 4,
      color: 'blue'
    }],
    [5, {
      label: '已完成',
      value: 5,
      color: 'cyan'
    }],
    [6, {
      label: '已关闭（支付前关闭)',
      value: 6,
      color: 'pink'
    }],
    [
      7, {
      label: '已关闭（支付成功关闭)',
      value: 7,
      color: 'purple'
    }
    ],
    [8, {
      label: '已删除',
      value: 8,
      color: 'red'
    }],
    [102, {
      label: '待支付定金',
      value: 102,
      color: 'orange'
    }],
    [103, {
      label: '待支付尾款',
      value: 103,
      color: 'pink'
    }],
    [106, {
      label: '未付定金取消',
      value: 106,
      color: 'red'
    }],
    [107, {
      label: '已付定金取消',
      value: 107,
      color: 'green'
    }],
    [108, {
      label: '未付尾款取消',
      value: 108,
      color: 'purple'
    }]
  ]
);


/**
 * pay method
 */
export const BILIBILI_PAY_METHOD_MAP: Map<number, {
  label: string;
  value: number;
  color: string;
}> = new Map<number, { label: string; value: number; color: string }>(
  [
    [1, {
      label: '支付宝',
      value: 1,
      color: 'green'
    }],
    [2, {
      label: '微信支付',
      value: 2,
      color: 'blue'
    }],
    [3, {
      label: 'qq钱包',
      value: 3,
      color: 'cyan'
    }],
    [4, {
      label: 'B币',
      value: 4,
      color: 'pink'
    }],
    [5, {
      label: '花呗分期',
      value: 5,
      color: 'orange'
    }],
    [6, {
      label: '交通银行',
      value: 6,
      color: 'purple'
    }],
    [7, {
      label: '支付宝国际',
      value: 7,
      color: 'red'
    }],
    [8, {
      label: '微信跨境',
      value: 8,
      color: 'yellow'
    }],
    [9, {
      label: '微信支付分',
      value: 9,
      color: 'gray'
    }],
    [10, {
      label: '花呗',
      value: 10,
      color: 'magenta'
    }],
    [11, {
      label: '招行一网通支付',
      value: 11,
      color: 'lime'
    }],
    [12, {
      label: '新微信支付',
      value: 12,
      color: 'gold'
    }],
  ]
)


/**
 * order type
 */
export const BILIBILI_ORDER_TYPE: Map<number, {
  label: string;
  value: number;
  color: string;
}>  = new Map<number, {label: string; value: number; color: string}>(
  [
    [0, {
      label: '购物车订单',
      value: 0,
      color: 'green'
    }],
    [1, {
      label: '单商品订单',
      value: 1,
      color: 'blue'
    }],
    [2, {
      label: '预售订单',
      value: 2,
      color: 'cyan'
    }],
    [6, {
      label: '盲盒订单',
      value: 6,
      color: 'pink'
    }],
    [9, {
      label: '混合订单',
      value: 9,
      color: 'orange'
    }],
    [13, {
      label: '游戏点卡订单',
      value: 13,
      color: 'purple'
    }],
    [14, {
      label: '惊喜赏订单',
      value: 14,
      color: 'red'
    }],
    [17, {
      label: '虚拟订单',
      value: 17,
      color: 'yellow'
    }],
  ]
);
