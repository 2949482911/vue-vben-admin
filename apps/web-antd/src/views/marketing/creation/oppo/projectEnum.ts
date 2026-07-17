/**批投项目-推广目标枚举 */
export const EXTENSION_SELECT = [
  {
    label: '链接推广',
    value: 1,
  },
  {
    label: '应用推广-应用下载',
    value: 2,
  },
  {
    label: '快应用推广',
    value: 3,
  },
  {
    label: '应用推广-应用调起',
    value: 6,
  },
  {
    label: '小程序推广',
    value: 7,
  },
  {
    label: '直播推广',
    value: 8,
  },
];
// 是否限制日预算
export const DAYLIMIT_SELECT = [
  {
    label: '限制',
    value: 1,
  },
  {
    label: '不限制',
    value: 0,
  },
];
// 竞价策略
export const DELIVERMODE_SELECT = [
  {
    label: '稳定成本',
    value: 0,
  },
  {
    label: '最大转化',
    value: 1,
  },
  {
    label: '最优成本',
    value: 2,
  }
]
// 推广流量
export const FLOW_SELECT = [
  {
    label: '全流量场景',
    value: 1,
  },
  {
    label: '自有流量',
    value: 2,
  },
  {
    label: '联盟流量',
    value: 3,
  }
];
// 流量场景
export const FLOWSCENE_SELECT = [
  {
    label: '全流量场景',
    value: 1,
  },
  {
    label: '精选推荐',
    value: 2,
  },
  {
    label: '安装有礼',
    value: 3,
  },
  {
    label: '开机必备',
    value: 4,
  },
  {
    label: '搜索',
    value: 5,
  },

  {
    label: 'Banner',
    value: 7,
  },
  {
    label: '开屏',
    value: 8,
  },
  {
    label: '插屏',
    value: 9,
  },
  {
    label: '原生',
    value: 10,
  },
  {
    label: '激励视频',
    value: 11,
  },
  {
    label: '联盟通投',
    value: 12,
  },
  {
    label: '通知栏',
    value: 14,
  },
  {
    label: '网络消息',
    value: 15,
  },
  {
    label: '展示优选',
    value: 13,
  },
  {
    label: '信息流',
    value: 6,
  }
];
// 深度转化类型
export const DEEP_CV_SELECT = [
  {
    label: '默认',
    value: 0,
  },
  {
    label: 'APP下载',
    value: 1,
  },
  {
    label: 'APP激活',
    value: 2,
  },
  {
    label: '游戏注册',
    value: 4,
  },
  {
    label: '游戏付费',
    value: 5,
  },
  {
    label: '表单注册',
    value: 6,
  },
  {
    label: '注册',
    value: 7,
  },
  {
    label: '回传激活',
    value: 8
  },
  {
    label: '应用付费',
    value: 9,
  },
  {
    label: '回传留存',
    value: 10,
  },
  {
    label: '应用内授信',
    value: 12,
  },
  {
    label: 'deepLink拉活',
    value: 14,
  },
  {
    label: '系统留存',
    value: 15,
  },
  {
    label: '回传激活（DP）',
    value: 16,
  },
  {
    label: '回传注册（DP）',
    value: 17,
  },
  {
    label: '应用付费（DP）',
    value: 18,
  },
  { 
    label: '应用内自定义转化（DP）',
    value: 19,
  },
  {
    label: '应用内授信（DP）',
    value: 20,
  },
  {
    label: '应用内下单（DP）',
    value: 21,
  },
  {
    label: '快应用付费',
    value: 22,
  },
  {
    label: '游戏付费ROI1',
    value: 23,
  },
  {
    label: '回传留存（DP拉活）',
    value: 25,
  },
  {
    label: '系统新增激活',
    value: 26,
  },
  {
    label: '快应用关键行为',
    value: 32,
  },
  {
    label: '回传留存率（DP拉活）',
    value: 34,
  },
  {
    label: '关键行为',
    value: 35,
  },
  {
    label: '微信小游戏注册',
    value: 36,
  },
  {
    label: '微信小游戏付费',
    value: 37,
  },
  {
    label: '每次付费',
    value: 38,
  },
  {
    label: '回传留存率',
    value: 39,
  },
  {
    label: '应用付费率',
    value: 40,
  },
  {
    label: '游戏变现ROI1',
    value: 41,
  },
  {
    label: '游戏变现ROI7',
    value: 42,
  },
  {
    label: '游戏预约',
    value: 43,
  },
  {
    label: '长留自定义',
    value: 44,
  },
  {
    label: '每次付费',
    value: 45,
  },
  {
    label: '变现ROI14',
    value: 46,
  },
  {
    label: '快应用变现ROI1',
    value: 47,
  },
  {
    label: '应用关键行为',
    value: 48,
  },
  {
    label: '快应用OS关键行为',
    value: 49,
  },
  {
    label: '快游戏付费',
    value: 50,
  },
  {
    label: '快游戏付费ROI1',
    value: 51,
  }
];
// 落地页建站类型
export const PAGE_TYPE_SELECT = [
  {
    label: '自定义落地页',
    value: 0,
  },
  {
    label: '一叶智能',
    value: 1,
  },
  {
    label: '云脑建站',
    value: 2,
  },
  {
    label: '萤火虫建站',
    value: 4,
  },
  {
    label: '快应用建站',
    value: 5,
  },
  {
    label: '广告主自建页面 JS SDK',
    value: 6,
  },
  {
    label: 'H5 API 回传',
    value: 7,
  },
  {
    label: '信息流线索直达',
    value: 8,
  },
  {
    label: '商店详情页',
    value: 9,
  },
  {
    label: '萤火虫应用模板下载页',
    value: 11,
  },
  {
    label: '互动落地页',
    value: 12,
  }
];
// 智能扩量
export const SMART_EXPAND_SELECT = [
  {
    label: '未扩量',
    value: 0,
  },
  {
    label: '广告扩量',
    value: 1,
  },
  {
    label: '广告组拓量',
    value: 2,
  }
];
// 推广日期限制
export const DAY_LIMIT_SELECT = [
  {
    label: '不限制推广日期',
    value: 0
  },
  {
    label: '限制推广日期',
    value: 1  
  }
];
// 推广时段限制
export const TIME_LIMIT_SELECT = [
  {
    label: '限制推广时段',
    value: 1,
  },
  {
    label: '不限制推广时段',
    value: 0,
  },
];
// 是否打开快应用
export const OPPO_QUICK_APP_SELECT = [
  {
    label: '打开并加桌',
    value: 1,
  },
  {
    label: '关闭加桌',
    value: 0,
  },
];
// 小程序类型
export const QUICK_APP_TYPE_SELECT = [
  {
    label: '小程序',
    value: 0,
  },
  {
    label: '微信小游戏',
    value: 1,
  },
];
// 是否开启免一阶
export const OPPO_FREE_ORDER_SELECT = [
  {
    label: '开启',
    value: 1,
  },
  {
    label: '关闭',
    value: 0,
  },
];
// 商品广告类型
export const PRODUCT_AD_TYPE_SELECT = [
  {
    label: 'sdpa',
    value: 1,
  },
  {
    label: 'mdpa',
    value: 2,
  },
  {
    label: '产品化投放',
    value: 3,
  },
  {
    label:'DPA+RTA',
    value: 4,
  }
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
  },
];

/**批投项目-广告类型枚举 */
export const ADTYPE_SELECT = [
  {
    label: '普通广告',
    value: 0,
  },
  {
    label: '预约广告',
    value: 1,
  },
  {
    label: '商品广告(sdpa广告)',
    value: 2
  },
  {
    label: 'mdpa广告',
    value: 3
  }
];
// 应用页类型
export const APP_PAGE_SELECT = [
  {
    label: 'INTEND_ACTION',
    value: 1
  },
  {
    label: 'ACTIVITY',
    value: 4
  },
  {
    label: 'SCHEME_URL',
    value: 5
  }
];
// ocpx自动化开关
export const OPTIMIZE_SWITCH_SELECT = [
  {
    label: '未开启',
    value: 0
  },
  {
    label: '开启',
    value: 1
  }
];
// ocpx优化类型
export const OPTIMIZE_TYPE_SELECT = [
  {
    label: '七日留存',
    value: 1
  },
  {
    label: '次留率（优选）',
    value: 2
  },
  {
    label: '4日LTV',
    value: 3
  }
];
// 规格
export const GLOBAL_SPECID_SELECT = [
  {
    label: '横版大图',
    value: 1
  },
  {
    label: '横版小图',
    value: 20
  },
  {
    label: '横版组图',
    value: 30
  },
  {
    label: '竖版大图',
    value: 50
  },
  {
    label: '横版视频',
    value: 60
  },
  {
    label: '竖版视频',
    value: 63
  }
]
/**批投项目-通知形式枚举 */
export const NOTIFORMAT_SELECT = [
  {
    label: '通知栏',
    value: 0,
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
];

/**批投广告组-计费类型枚举 */
export const BILLINGTYPE_SELECT = [
  {
    label: 'CPD',
    value: 1,
  },
  {
    label: 'CPC',
    value: 2,
  },
  {
    label: 'CPM',
    value: 3,
  },
  {
    label: 'CPS',
    value: 4,
  },
  {
    label: 'OCPC',
    value: 5,
  },
  {
    label: 'CPA',
    value: 6,
  },
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
  },
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
  },
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
  },
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
  },
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
    label: '锁屏广告',
    value: 6,
  },
  {
    label: '搜索sug页（非商店搜索）',
    value: 10,
  },
  {
    label: '通知广告',
    value: 12,
  },
];

/**批投广告创意素材组-展现形式枚举（应用商店） */
export const STORE_DISPLAY_FORMATS = [
  {
    label: '推荐列表',
    value: 20,
  },
  {
    label: '搜索提词',
    value: 21,
  },
];

/**批投广告创意素材组-展现形式枚举（非应用商店） */
export const NO_STORE_DISPLAY_FORMATS = [
  {
    label: '通知广告',
    value: 12,
  },
  {
    label: '信息流',
    value: 1,
  },
];

/**批投广告创意素材组-展现形式枚举（广告联盟） */
export const ALLQIANCE_PRESENTATION_FORMAT = [
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
    label: '激励视频',
    value: 9,
  },
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
  },
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
  },
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
  },
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
  },
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
  },
];

// ======================== Label 辅助函数 ========================

/** 根据 value 从 options 数组中查找对应的 label */
function findLabel(options: Array<{ label: string; value: any }>, value: any): string {
  const item = options.find((opt) => opt.value === value);
  return item?.label ?? String(value ?? '');
}

export function getExtensionLabel(value: any) { return findLabel(EXTENSION_SELECT, value); }
export function getDayLimitLabel(value: any) { return findLabel(DAYLIMIT_SELECT, value); }
export function getDeliveryModeLabel(value: any) { return findLabel(DELIVERMODE_SELECT, value); }
export function getFlowLabel(value: any) { return findLabel(FLOW_SELECT, value); }
export function getFlowSceneLabel(value: any) { return findLabel(FLOWSCENE_SELECT, value); }
export function getDeepCvLabel(value: any) { return findLabel(DEEP_CV_SELECT, value); }
export function getPageTypeLabel(value: any) { return findLabel(PAGE_TYPE_SELECT, value); }
export function getSmartExpandLabel(value: any) { return findLabel(SMART_EXPAND_SELECT, value); }
export function getDayLimitFlagLabel(value: any) { return findLabel(DAY_LIMIT_SELECT, value); }
export function getTimeLimitLabel(value: any) { return findLabel(TIME_LIMIT_SELECT, value); }
export function getQuickAppLabel(value: any) { return findLabel(OPPO_QUICK_APP_SELECT, value); }
export function getQuickAppTypeLabel(value: any) { return findLabel(QUICK_APP_TYPE_SELECT, value); }
export function getFreeOrderLabel(value: any) { return findLabel(OPPO_FREE_ORDER_SELECT, value); }
export function getProductAdTypeLabel(value: any) { return findLabel(PRODUCT_AD_TYPE_SELECT, value); }
export function getAdTypeLabel(value: any) { return findLabel(ADTYPE_SELECT, value); }
export function getAppPageLabel(value: any) { return findLabel(APP_PAGE_SELECT, value); }
export function getOptimizeSwitchLabel(value: any) { return findLabel(OPTIMIZE_SWITCH_SELECT, value); }
export function getOptimizeTypeLabel(value: any) { return findLabel(OPTIMIZE_TYPE_SELECT, value); }
export function getGlobalSpecIdLabel(value: any) { return findLabel(GLOBAL_SPECID_SELECT, value); }
export function getBillingTypeLabel(value: any) { return findLabel(BILLINGTYPE_SELECT, value); }

// 内联枚举（未导出为常量，但表单中有使用）
const OCPC_OPTM_TYPE_OPTIONS = [
  { label: '无', value: 0 },
  { label: '转化', value: 1 },
  { label: '点击', value: 2 },
];
export function getOcpcOptmTypeLabel(value: any) { return findLabel(OCPC_OPTM_TYPE_OPTIONS, value); }

const DYNAMIC_CR_OPTIONS = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
];
export function getDynamicCrLabel(value: any) { return findLabel(DYNAMIC_CR_OPTIONS, value); }

// ======================== 字段名 → Label 函数 Map ========================

/** 按字段名（与 OppoCampaignData / OppoAdgroupData / OppoPromotionData 属性名一致）获取对应的 Label 转换函数 */
export const fieldLabelMap: Record<string, (value: any) => string> = {
  // Campaign
  extensionType: getExtensionLabel,
  dayLimit: getDayLimitLabel,
  deliveryMode: getDeliveryModeLabel,
  // Adgroup
  extensionFlow: getFlowLabel,
  flowScene: getFlowSceneLabel,
  billingType: getBillingTypeLabel,
  advertiseType: getAdTypeLabel,
  autoOpenFlag: getQuickAppLabel,
  deepOcpcType: getDeepCvLabel,
  ocpcOptmType: getOcpcOptmTypeLabel,
  ocpcType: getDeepCvLabel,
  pageType: getPageTypeLabel,
  smartExpandType: getSmartExpandLabel,
  timeLimit: getTimeLimitLabel,
  linkDeskFlag: getQuickAppLabel,
  appletType: getQuickAppTypeLabel,
  defaultSecondStage: getFreeOrderLabel,
  adsDpaProductDTO_dpaProductType: getProductAdTypeLabel,
  pushAppPageType: getAppPageLabel,
  ocpxOptimizeSwitch: getOptimizeSwitchLabel,
  ocpxOptimizeType: getOptimizeTypeLabel,
  // Promotion
  globalSpecId: getGlobalSpecIdLabel,
  dynamicCr: getDynamicCrLabel,
};
