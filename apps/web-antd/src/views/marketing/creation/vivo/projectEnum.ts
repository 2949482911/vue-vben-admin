/**批投项目-推广目标枚举 */
export const PROJRCT_SELECT = [
  {
    label: '普通网址',
    value: 1,
  },
  {
    label: '应用推广',
    value: 2,
  },
  {
    label: '动态商品',
    value: 3,
  },
  {
    label: '快应用/快游戏',
    value: 8,
  },
  {
    label: '游戏预约',
    value: 9,
  },
  {
    label: '小程序',
    value: 11,
  },
];

/**批投项目-投放渠道/媒体类型枚举 */
export const MEDIA_SELECT = [
  {
    label: '应用商店',
    value: 0,
  },
  {
    label: '非应用商店',
    value: 1,
  },
  {
    label: '广告联盟',
    value: 2,
  }
];

/**批投项目-广告类型枚举 */
export const ADTYPE_SELECT = [
  {
    label: '展示广告',
    value: 0,
  },
  {
    label: '通知广告',
    value: 2,
  }
];

/**批投项目-通知形式枚举 */
export const NOTIFORMAT_SELECT = [
  {
    label: '通知栏',
    value: 0,
  }
];

/**批投项目-通知类型枚举 */
export const NOTIFICATIONTYPE_SELECT = [
  {
    label: '拉活-订阅人群',
    value: 1,
  },
  {
    label: '拉活-屏蔽人群',
    value: 2,
  }
];

/**批投项目-推广模式枚举 */
export const PROMOTION_SELECT = [
  {
    label: '常规投放',
    value: 0,
  },
  {
    label: '商品智投',
    value: 1,
  }
];

/**批投项目-转化监测枚举 */
export const CONVERSION_SELECT = [
  {
    label: '普通',
    value: 0,
  },
  {
    label: '增效',
    value: 1,
  }
];

/**批投广告组-推广链接类型枚举 */
export const PROMOTIONLINK_SELECT = [
  {
    label: '自定义URL',
    value: 2,
  },
  {
    label: '悟空建站',
    value: 3,
  },
  {
    label: '金桔猫',
    value: 6,
  },
  {
    label: '一叶智能',
    value: 7,
  },
  {
    label: '商品URL（仅商品智投支持）',
    value: 12,
  }
];

/**批投广告组-推广链接-商品URL类型枚举 */
export const COMMODITYURL_SELECT = [
  {
    label: '商品链接',
    value: 1,
  },
  {
    label: '品牌链接',
    value: 2,
  },
  {
    label: '商户链接',
    value: 3,
  },
  {
    label: '自定义链接',
    value: 4,
  }
];

/**批投广告组-是否微信一键关注枚举 */
export const VXFOLLOW_SELECT = [
  {
    label: '否',
    value: 0,
  },
  {
    label: '是',
    value: 1,
  }
];

/**批投广告组-计费类型枚举 */
export const BILLINGTYPE_SELECT = [
  {
    label: 'CPM',
    value: 1,
  },
  {
    label: 'CPC',
    value: 2,
  },
  {
    label: 'oCpc',
    value: 3,
  },
  {
    label: 'CPD',
    value: 4
  },
  {
    label: 'oCPD',
    value: 5,
  }
];

/**批投广告组-二阶段转化目标枚举 */
export const PHASETWOGOAL_SELECT = [
  { label: '下载', value: 1 },
  { label: '游戏注册', value: 2 },
  { label: '新增激活', value: 3 },
  { label: '表单提交', value: 4 },
  { label: '自定义激活', value: 5 },
  { label: '自定义注册', value: 6 },
  { label: '添加到桌面', value: 7 },
  { label: '自定义次留', value: 8 },
  { label: '游戏付费', value: 9 },
  { label: '自定义付费', value: 12 },
  { label: '自定义拉活', value: 13 },
  { label: '网页购买', value: 14 },
  { label: '游戏预约', value: 15 },
  { label: '按钮点击', value: 16 },
  { label: '游戏ROI-广告变现（前置目标=下载）', value: 17 },
  { label: '游戏ROI - 广告变现（前置目标=游戏注册）', value: 18 },
  { label: '游戏ROI-充值付费（前置目标=下载）', value: 19 },
  { label: '游戏ROI - 充值付费（前置目标=游戏注册）', value: 20 },
  { label: '每次付费', value: 22 },
  { label: '快应用付费', value: 23 },
  { label: '安装完成', value: 24 },
  { label: '自定义授信', value: 25 },
  { label: '拉活自定义次留', value: 27 },
  { label: '微信-识别二维码', value: 29 },
  { label: '微信-添加微信', value: 30 },
  { label: '微信-用户首次消息', value: 31 },
  { label: '有效咨询', value: 32 },
  { label: '微信小游戏注册', value: 33 },
  { label: '微信小游戏付费', value: 34 },
  { label: '游戏首日付费', value: 36 },
  { label: '游戏ROI1-充值付费', value: 48 },
  { label: '游戏ROI1-广告变现', value: 49 },
  { label: '留存天数', value: 51 },
  { label: '快应用/快游戏ROI1-广告变现', value: 52 },
  { label: '拉活-自定义付费', value: 53 },
  { label: '普通激活', value: 100 },
  { label: '新增激活', value: 101 },
  { label: '自定义激活', value: 102 },
  { label: '自定义注册', value: 103 },
  { label: '自定义次留', value: 104 },
  { label: '游戏注册', value: 105 },
  { label: '自定义拉活', value: 106 },
  { label: '自定义付费', value: 107 },
  { label: '自定义授信', value: 108 },
  { label: '游戏付费', value: 109 },
  { label: '普通激活', value: 110 },
  { label: '游戏ROI-充值付费', value: 111 },
  { label: '游戏ROI-广告变现', value: 113 },
  { label: '游戏首日付费', value: 115 },
  { label: '游戏ROI7-充值付费', value: 126 },
  { label: '下载', value: 127 },
  { label: '每次付费', value: 128 },
  { label: '游戏ROI1-广告变现', value: 129 },
  { label: '留存天数', value: 130 },
  { label: '游戏ROI1-充值付费', value: 131 },
];

/**批投广告组-投放状态枚举 */
export const DELIVER_SELECT = [
  {
    label: '快速投放',
    value: 1,
  },
  {
    label: '匀速投放',
    value: 2,
  }
];

/**批投广告组-检索类型枚举 */
export const RETRIEVE_SELECT = [
  {
    label: '普通广告',
    value: 0,
  },
  {
    label: '智能拓量广告',
    value: 1,
  },
  {
    label: '系统推荐定向广告',
    value: 2,
  }
];

/**批投广告组-检索类型枚举 */
export const ORIENTATION_SELECT = [
  {
    label: '性别',
    value: 10,
  },
  {
    label: '年龄',
    value: 11,
  },
  {
    label: '地域',
    value: 13,
  },
  {
    label: '人群包',
    value: 20,
  },
  {
    label: '兴趣行为',
    value: 55,
  }
];

/**批投广告组-检索类型枚举 */
export const BID_SELECT = [
  {
    label: '稳定拿量',
    value: 0,
  },
  {
    label: '优先拿量',
    value: 1,
  }
];

/**批投广告创意素材组-展现形式枚举 */
export const DISPLAYFORM_SELECT = [
  {
    label: '推荐列表',
    value: 20,
  },
  {
    label: '搜索提词',
    value: 21,
  },
  {
    label: '信息流',
    value: 1,
  },
  {
    label: '开屏',
    value: 2,
  },
  {
    label: 'banner',
    value: 3,
  },
  {
    label: '插屏',
    value: 4,
  },
  {
    label: '原生广告',
    value: 5,
  },
  {
    label: '锁屏广告',
    value: 6,
  },
  {
    label: '激励视频',
    value: 9,
  },
  {
    label: '搜索sug页（非商店搜索）',
    value: 10,
  },
  {
    label: '通知广告',
    value: 12,
  }
];

/**批投广告创意素材组-综搜广告属性枚举 */
export const COMPREHENSIVESEARCH_SELECT = [
  {
    label: '推荐列表',
    value: 20,
  },
  {
    label: '搜索提词',
    value: 21,
  },
  {
    label: '信息流',
    value: 1,
  },
  {
    label: '开屏',
    value: 2,
  },
  {
    label: 'banner',
    value: 3,
  },
  {
    label: '插屏',
    value: 4,
  },
  {
    label: '原生广告',
    value: 5,
  },
  {
    label: '锁屏广告',
    value: 6,
  },
  {
    label: '激励视频',
    value: 9,
  },
  {
    label: '搜索sug页（非商店搜索）',
    value: 10,
  },
  {
    label: '通知广告',
    value: 12,
  }
];

/**批投广告组-通知广告提醒方式枚举 */
export const ADREMINDER_SELECT = [
  {
    label: '关闭',
    value: 0,
  },
  {
    label: '强提醒',
    value: 1,
  },
  {
    label: '弱提醒',
    value: 2,
  }
];

/**批投广告组-视频类型拓展归因枚举 */
export const ATTRIBUTION_SELECT = [
  {
    label: '关闭',
    value: 0,
  },
  {
    label: '3秒播放归因',
    value: 3,
  }
];

/**批投广告组-详情页类型枚举 */
export const DETAILPAGE_SELECT = [
  {
    label: '定制/自定义',
    value: 2,
  },
  {
    label: '悟空建站',
    value: 3,
  },
  {
    label: '自定义H5',
    value: 4,
  },
  {
    label: '金桔猫商品落地页',
    value: 6,
  },
  {
    label: '一叶智能',
    value: 7,
  },
  {
    label: '商品URL',
    value: 12,
  }
];

/**批投广告组-流量优选开关枚举 */
export const FLOWSWITCH_SELECT = [
  {
    label: '关闭',
    value: 0,
  },
  {
    label: '开启',
    value: 1,
  }
];
