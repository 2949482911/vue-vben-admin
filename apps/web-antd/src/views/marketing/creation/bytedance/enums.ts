


/**
 * BYTEDANCE_MARKETING_TYPE
 * 巨量引擎营销类型模板
 */
export const BYTEDANCE_MARKETING_TYPE = [
  {
    label: '基础模板',
    value: 'base_template',
  },
  {
    label: "商品营销抖音号",
    //
    value: 'marketing_product_douyin_template'
  }
];


export const CampaignOperation  =[
  {
    label : '启用',
    value: 'ENABLE'
  },
  {
    label : '禁用',
    value: 'DISABLE'
  },
]


export const DeliveryMode = [
  {
    label: '手动投放',
    value: 'MANUAL',
  },
  {
    label: '自动投放',
    value: 'PROCEDURAL',
  },
]


/**
 * APP 应用
LINK 销售线索投放
MICRO_GAME 小程序
SHOP 电商
QUICK_APP快应用
NATIVE_ACTION 内容营销
DPA商品目录，投放搜索蓝海项目时不支持DPA目的
 */
export const BytedanceCampaign_landing_type = [
  {
    label: '应用',
    value: 'APP',
  },
  {
    label: '销售线索投放',
    value: 'LINK',
  },
  {
    label: '小程序',
    value: 'MICRO_GAME',
  },
  {
    label: '电商',
    value: 'SHOP',
  },
  {
    label: '快应用',
    value: 'QUICK_APP',
  },
  {
    label: '内容营销',
    value: 'NATIVE_ACTION',
  },
  {
    label: '商品目录',
    value: 'DPA',
  },
]

/**
 * DOWNLOAD 应用下载、LAUNCH 应用调起、RESERVE 预约下载
 */

export const BytedanceCampaign_app_promotion_type = [
  {
    label: '应用下载',
    value: 'DOWNLOAD',
  },
  {
    label: '应用调起',
    value: 'LAUNCH',
  },
  {
    label: '预约下载',
    value: 'RESERVE',
  },
]


/**
 * VIDEO_AND_IMAGE 短视频/图片，LIVE直播
 */
export const BytedanceCampaign_marketing_goal = [
  {
    label: '短视频/图片',
    value: 'VIDEO_AND_IMAGE',
  },
  {
    label: '直播',
    value: 'LIVE',
  },
]


/**
 * 允许值：ALL 通投 SEARCH 搜索
 */
export const BytedanceCampaign_ad_type = [
  {
    label: '通投',
    value: 'ALL',
  },
  {
    label: '搜索',
    value: 'SEARCH',
  },
]

/**
 * NORMAL 常规投放（默认值）

DURATION 极速智投（仅支持搜索，ad_type = SEARCH）

UBX_INTELLIGENT 智能托管（仅支持UBA项目）
 */
export const BytedanceCampaign_delivery_type = [
  {
    label: '常规投放',
    value: 'NORMAL',
  },
  {
    label: '极速速投',
    value: 'DURATION',
  },
  {
    label: '智能托管',
    value: 'UBX_INTELLIGENT',
  },
]



/**
ON 开启
OFF 关闭
 */
export const BytedanceCampaign_aigc_dynamic_creative_switch = [
  {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]



export const BytedanceCampaign_star_auto_material_addition_switch = [
    {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]


export const BytedanceCampaign_star_auto_delivery_switch = [
   {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]



export const BytedanceCampaign_audience_extend = [
   {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]




export const BytedanceCampaign_auto_extend_traffic = [
   {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]



/**
 * FEED_TO_SEARCH 搜索快投（默认值）
 * CUSTOM 自定义出价，仅pricing出价方式设置为非O类场景时支持且默认
 * WITH_PROMOTION 随项目/单元出价（仅pricing出价方式设置为O类场景时支持且默认）
 */
export const BytedanceCampaign_keyword_bid_type = [
  {
    label: '搜索快投',
    value: 'FEED_TO_SEARCH',
  },
  {
    label: '自定义出价',
    value: 'CUSTOM',
  },
  {
    label: '随项目/单元出价',
    value: 'WITH_PROMOTION',
  },
]



/**
 * PHRASE 短语匹配
EXTENSIVE 广泛匹配
 * PRECISION 精准匹配
 */
export const BytedanceCampaign_keyword_match_type= [
  {
    label: '短语匹配',
    value: 'PHRASE',
  },
  {
    label: '广泛匹配',
    value: 'EXTENSIVE',
  },
  {
    label: '精准匹配',
    value: 'PRECISION',
  },
]



export const BytedanceCampaign_blue_flow_package_setting = [
    {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]



/**
 * 许值：SINGLE 启用sDPA、NO_MAP不启用（默认值）、MULTI_PRODUCTS多品投放new
 */
export const BytedanceCampaign_product_setting = [
  {
    label: '启用sDPA',
    value: 'SINGLE',
  },
  {
    label: '不启用',
    value: 'NO_MAP',
  },
  {
    label: '多品投放',
    value: 'MULTI_PRODUCTS',
  },
]



/**
 * APP_STORE_DELIVERY 优先商店下载、 DEFAULT 默认下载（默认值）
 */
export const BytedanceCampaign_download_mode = [
  {
    label: '优先商店下载',
    value: 'APP_STORE_DELIVERY',
  },
  {
    label: '默认下载',
    value: 'DEFAULT',
  },
]


/**
 * DOWNLOAD_URL 直接下载、EXTERNAL_URL 落地页下载
 * EXTERNAL_URL 落地页调起、QUICK_APP_URL 直接调起
 */
export const BytedanceCampaign_download_type = [
  {
    label: '直接下载',
    value: 'DOWNLOAD_URL',
  },
  {
    label: '落地页下载',
    value: 'EXTERNAL_URL',
  },
  {
    label: '落地页调起',
    value: 'EXTERNAL_URL',
  },
  {
    label: '直接调起',
    value: 'QUICK_APP_URL',
  },
]


/**
 * DIRECT_OPEN 直接调起（默认值）、EXTERNAL_OPEN 落地页调起
 */
export const BytedanceCampaign_launch_type = [
  {
    label: '直接调起',
    value: 'DIRECT_OPEN',
  },
  {
    label: '落地页调起',
    value: 'EXTERNAL_OPEN',
  },
]


/**
 * AWEME_HOME_PAGE：抖音号（原名：抖音主页）

LANDING_PAGE_LINK：落地页
 */

export const BytedanceCampaign_promotion_type = [
  {
    label: '抖音号（原名：抖音主页）',
    value: 'AWEME_HOME_PAGE',
  },
  {
    label: '落地页',
    value: 'LANDING_PAGE_LINK',
  },
]



/**
 * 允许值: NONE不启用, DPA商品库所含链接, CUSTOM自定义链接
 */
export const BytedanceCampaign_open_url_type = [
  {
    label: '不启用',
    value: 'NONE',
  },
  {
    label: '商品库所含链接',
    value: 'DPA',
  },
  {
    label: '自定义链接',
    value: 'CUSTOM',
  },
]



/**
 * UNIVERSAL_LINK（默认值）、APPLINK
 */
export const BytedanceCampaign_ulink_url_type = [
  {
    label: '通用链接',
    value: 'UNIVERSAL_LINK',
  },
  {
    label: '应用链接',
    value: 'APPLINK',
  },
]


/**
 * ORANGE 橙子落地页

THIRDPARTY 自研落地页

ENTERPRISE 企业号落地页

AWEME 抖音主页

MICRO_APP字节小程序

WECHAT_APPLET微信小程序
 */
export const BytedanceCampaign_asset_type = [
  {
    label: '橙子落地页',
    value: 'ORANGE',
  },
  {
    label: '自研落地页',
    value: 'THIRDPARTY',
  },
  {
    label: '企业号落地页',
    value: 'ENTERPRISE',
  },
  {
    label: '抖音主页',
    value: 'AWEME',
  },
  {
    label: '字节小程序',
    value: 'MICRO_APP',
  },
  {
    label: '微信小程序',
    value: 'WECHAT_APPLET',
  },
]


/**
 * ORANGE_AND_AWEME优选投放橙子落地页和抖音主页
 */
export const BytedanceCampaign_multi_asset_type = [
  {
    label: '优选投放橙子落地页和抖音主页',
    value: 'ORANGE_AND_AWEME',
  },
]



/**
 * WECHAT_GAME 微信小游戏

WECHAT_APP微信小程序

BYTE_GAME字节小游戏

BYTE_APP字节小程序

AWEME抖音号new（支持自动/手动投放链路，白名单能力，白名单key为micro_app_aweme）
 */
export const BytedanceCampaign_micro_promotion_type = [
  {
    label: '微信小游戏',
    value: 'WECHAT_GAME',
  },
  {
    label: '微信小程序',
    value: 'WECHAT_APP',
  },
  {
    label: '字节小游戏',
    value: 'BYTE_GAME',
  },
  {
    label: '字节小程序',
    value: 'BYTE_APP',
  },
  {
    label: '抖音号new（支持自动/手动投放链路，白名单能力，白名单key为micro_app_aweme）',
    value: 'AWEME',
  },
]



/**
 *  DPA_LINK 落地页、DPA_APP 应用下载
 */
export const BytedanceCampaign_dpa_adtype = [
  {
    label: '落地页',
    value: 'DPA_LINK',
  },
  {
    label: '应用下载',
    value: 'DPA_APP',
  },
]


/**
 * 1启用；2 不启用（默认值）
 */
export const BytedanceCampaign_paid_switch = [
  {
    label: '启用',
    value: '1',
  },
  {
    label: '不启用',
    value: '2',
  },
]



export const BytedanceCampaign_value_optimized_type = [
     {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]



/**
 * 1000 、5000 、12000 、20000、30000、40000、50000、60000
 */
export const BytedanceCampaign_landing_page_stay_time = [
  {
    label: '1000',
    value: '1000',
  },
  {
    label: '5000',
    value: '5000',
  },
  {
    label: '12000',
    value: '12000',
  },
  {
    label: '20000',
    value: '20000',
  },
  {
    label: '30000',
    value: '30000',
  },
  {
    label: '40000',
    value: '40000',
  },
  {
    label: '50000',
    value: '50000',
  },
  {
    label: '60000',
    value: '60000',
  },

]


/**
 * 允许值： MANUAL 首选媒体，UNIVERSAL_SMART 通投智选
 */
export const BytedanceCampaign_inventory_catalog = [
  {
    label: '首选媒体',
    value: 'MANUAL',
  },
  {
    label: '通投智选',
    value: 'UNIVERSAL_SMART',
  },
]



/**
 * INVENTORY_FEED 今日头条

INVENTORY_VIDEO_FEED西瓜视频

INVENTORY_AWEME_FEED 抖音短视频

INVENTORY_TOMATO_NOVEL 番茄小说

INVENTORY_UNION_SLOT穿山甲

UNION_BOUTIQUE_GAME ohayoo精品游戏

INVENTORY_SEARCH搜索

INVENTORY_HOMED_AGGREGATE住小帮，仅landing_type=APP 应用、LINK 销售线索投放、SHOP 电商、DPA DPA时支持
 */
export const BytedanceCampaign_inventory_type = [
  {
    label: '今日头条',
    value: 'INVENTORY_FEED',
  },
  {
    label: '西瓜视频',
    value: 'INVENTORY_VIDEO_FEED',
  },
  {
    label: '抖音短视频',
    value: 'INVENTORY_AWEME_FEED',
  },
  {
    label: '番茄小说',
    value: 'INVENTORY_TOMATO_NOVEL',
  },
  {
    label: '穿山甲',
    value: 'INVENTORY_UNION_SLOT',
  },
  {
    label: 'ohayoo精品游戏',
    value: 'UNION_BOUTIQUE_GAME',
  },
  {
    label: '搜索',
    value: 'INVENTORY_SEARCH',
  },
  {
    label: '住小帮，仅landing_type=APP 应用、LINK 销售线索投放、SHOP 电商、DPA DPA时支持',
    value: 'INVENTORY_HOMED_AGGREGATE',
  },
]



/**
 * ORIGINAL_VIDEO 原生视频、REWARDED_VIDEO 激励视频、SPLASH_VIDEO 开屏视频
 */
export const BytedanceCampaign_union_video_type = [
  {
    label: '原生视频',
    value: 'ORIGINAL_VIDEO',
  },
  {
    label: '激励视频',
    value: 'REWARDED_VIDEO',
  },
  {
    label: '开屏视频',
    value: 'SPLASH_VIDEO',
  },
]



/**
 * SCHEDULE_FROM_NOW 从今天起长期投放
SCHEDULE_START_END 设置开始和结束日期
SCHEDULE_7_DAYS 7日稳投
 */
export const BytedanceCampaign_schedule_type = [
  {
    label: '从今天起长期投放',
    value: 'SCHEDULE_FROM_NOW',
  },
  {
    label: '设置开始和结束日期',
    value: 'SCHEDULE_START_END',
  },
  // {
  //   label: '7日稳投',
  //   value: 'SCHEDULE_7_DAYS',
  // },
]



export const BytedanceCampaign_filter_night_switch = [
  {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]



/**
 *
 * DEEP_BID_DEFAULT 不启用/首次付费，该值含义在不同场景下存在差异，建议您提前查询「获取可用深度优化方式」接口获取，可根据接口返回的deep_bid_type_name中文名区分实际含义
DEEP_BID_PACING 自动优化（external_action=表单提交&&deep_external_action=回访_信息确认/有效获客/回访_加为好友|| external_action=支付_存在意向&&deep_external_action=正价课购买|| external_action=付费&&deep_external_action=正价课购买时，deep_bid_type支持自动优化）
DEEP_BID_MIN自定义手动出价
ROI_COEFFICIENTROI系数出价
ROI_DIRECT_MAILROI直投（电商营销目的下）（landing_type=shop/app/DPA&&external_action=app内下单、app内付费&&deep_external_action为空时，支持ROI直投/不启用）
BID_PER_ACTION 每次付费出价
SOCIAL_ROIROI三出价
FIRST_AND_SEVEN_PAY_ROI首日+7日付费ROI（landing_type=app&&external_action=app内付费时支持）
PER_AND_SEVEN_PAY_ROI每次+7日付费ROI（landing_type=app&&external_action=app内付费时支持）
BID_PER_ACTION每次付费出价，适用于每次付费的转化
FORM_BID优选表单出价，白名单能力（landing_type=link、external_action=表单提交/多转化、deep_external_action为空、value_optimized_type目标优化类型=OFF不启用时，支持优选表单出价/不启用）
PHONE_CONNECT_BID电话接通出价，（landing_type=link&&external_action=表单提交，deep_external_action=电话接通时，deep_bid_type仅支持PHONE_CONNECT_BID）
 */
export const BytedanceCampaign_deep_bid_type = [
  {
    label: '不启用/首次付费',
    value: 'DEEP_BID_DEFAULT',
  },
  {
    label: '自动优化（手动出价方式下）',
    value: 'DEEP_BID_PACING',
  },
  {
    label: '自定义手动出价',
    value: 'DEEP_BID_MIN',
  },
  {
    label: 'ROI系数出价',
    value: 'ROI_COEFFICIENT',
  },
  {
    label: 'ROI直投（电商营销目的下）',
    value: 'ROI_DIRECT_MAIL',
  },
  {
    label: 'ROI付费出价',
    value: 'BID_PER_ACTION',
  },
  {
    label: 'ROI三出价',
    value: 'SOCIAL_ROI',
  },
  {
    label: '首日+7日付费ROI',
    value: 'FIRST_AND_SEVEN_PAY_ROI',
  },
  {
    label: '每次+7日付费ROI',
    value: 'PER_AND_SEVEN_PAY_ROI',
  },
  {
    label: '每次付费出价',
    value: 'BID_PER_ACTION',
  },
  {
    label: '优选表单出价，白名单能力',
    value: 'FORM_BID',
  },

  {
    label: '电话接通出价',
    value: 'PHONE_CONNECT_BID',
  },
]



/**
 * CUSTOM 稳定成本，单元潜力探索-常规版策略即对应CUSTOM稳定成本策略
UBP多品仅支持竞价策略为「稳定成本」
NO_BID 最大转化投放，以下场景不支持（具体可见Nobid（最大转化投放）产品手册）
UPPER_CONTROL 最优成本，
 */
export const BytedanceCampaign_bid_type = [
  {
    label: '稳定成本',
    value: 'CUSTOM',
  },
  {
    label: '最大转化投放',
    value: 'NO_BID',
  },
  {
    label: '最优成本',
    value: 'UPPER_CONTROL',
  },
]



export const BytedanceCampaign_project_custom = [
    {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]



/**
 * BUDGET_MODE_INFINITE 不限
BUDGET_MODE_DAY 日预算
当delivery_mode = PROCEDURAL自动投放 &&landing_type营销目的 = APP/MICRO_GAME/LINK时仅支持日预算
搜索极速智投-自定义投放时间（从今天起长期投放/设置开始和结束日期），支持传入 budget_mode = 日预算 BUDGET_MODE_DAY
BUDGET_MODE_TOTAL 总预算
仅当delivery_type = DURATION搜索极速智投-7日稳投时可传入此枚举，否则报错。即当ad_type = SEARCH && delivery_type = DURATION && schedule_type = SCHEDULE_7_DAYS 时，可设置总预算
 */
export const BytedanceCampgin_budget_mode = [
  {
    label: '不限',
    value: 'BUDGET_MODE_INFINITE',
  },
  {
    label: '日预算',
    value: 'BUDGET_MODE_DAY',
  },
  {
    label: '总预算',
    value: 'BUDGET_MODE_TOTAL',
  },
]

/**
PRICING_CPM 按展示付费
PRICING_CPC 按点击付费
当bid_type = NO_BID时，传入报错
bid_type = CUSTOM 稳定成本、dpa_adtype = DPA_LINK 时报错
PRICING_OCPM 目标转化出价-按展示付费（默认值），该方式根据转化进行优化，按照展示进行计费，为您优选流量，最大化转化效果

PRICING_OCPC 目标转化出价-按点击付费，该方式根据转化进行优化，按照点击进行计费，为您优选流量，最大化转化效果
 */
export const BytedanceCampaign_pricing = [
  {
    label: '按展示付费',
    value: 'PRICING_CPM',
  },
  {
    label: '按点击付费',
    value: 'PRICING_CPC',
  },
  {
    label: '目标转化出价-按展示付费',
    value: 'PRICING_OCPM',
  },
  {
    label: '目标转化出价-按点击付费',
    value: 'PRICING_OCPC',
  },
]


export const BytedanceCampaign_layer_roi_switch = [
     {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]

export const BytedanceCampaign_budget_optimize_switch = [
     {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]
export const BytedanceCampaign_search_continue_delivery = [
     {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]


/**
 * SERVER_SEND 服务器端上传（默认值）, CLIENT_SEND 客户端上传
 */
export const BytedanceCampaign_send_type =[
  {
    label: '服务器端上传',
    value: 'SERVER_SEND',
  },
  {
    label: '客户端上传',
    value: 'CLIENT_SEND',
  },
]




// 广告枚举


/**
 * 不启用 OFF（默认值），自动生成 AUTO，手动选择 SELECT
 */
export const BytedancePromotion_anchor_related_type = [
  {
    label: '不启用 OFF（默认值）',
    value: 'OFF',
  },
  {
    label: '自动生成 AUTO',
    value: 'AUTO',
  },
  {
    label: '手动选择 SELECT',
    value: 'SELECT',
  },
]



export const BytedancePromotion_intelligent_generation = [
  {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]



export const BytedancePromotion_is_comment_disable= [
 {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]

export const BytedancePromotion_ad_download_status= [
 {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]


/**
 * BUDGET_MODE_DAY日预算（默认值）, BUDGET_MODE_TOTAL总预算
 */
export const BytedancePromotion_budget_mode = [
  {
    label: '日预算',
    value: 'BUDGET_MODE_DAY',
  },
  {
    label: '总预算',
    value: 'BUDGET_MODE_TOTAL',
  },
]


/**
 * PDD 拼多多

TB 淘宝

JD 京东

OTHER 其他
 */
export const BytedancePromotion_shop_platform = [
  {
    label: '拼多多',
    value: 'PDD',
  },
  {
    label: '淘宝',
    value: 'TB',
  },
  {
    label: '京东',
    value: 'JD',
  },
  {
    label: '其他',
    value: 'OTHER',
  },
]



export const BytedancePromotion_auto_extend_traffic = [
     {
    label: '开启',
    value: 'ON',
  },
  {
    label: '关闭',
    value: 'OFF',
  },
]


/**
 * PHRASE（短语匹配）EXTENSIVE（广泛匹配）PRECISION（精准匹配）
 */
export const BytedancePromotion_match_type = [
  {
    label: '短语匹配',
    value: 'PHRASE',
  },
  {
    label: '广泛匹配',
    value: 'EXTENSIVE',
  },
  {
    label: '精准匹配',
    value: 'PRECISION',
  },
]

// ======================== Label 辅助函数 ========================

function findLabel(options: Array<{ label: string; value: any }>, value: any): string {
  const item = options.find((opt) => opt.value === value);
  return item?.label ?? String(value ?? '');
}

export function getLandingTypeLabel(value: any) { return findLabel(BytedanceCampaign_landing_type, value); }
export function getAppPromotionTypeLabel(value: any) { return findLabel(BytedanceCampaign_app_promotion_type, value); }
export function getMarketingGoalLabel(value: any) { return findLabel(BytedanceCampaign_marketing_goal, value); }
export function getAdTypeLabel(value: any) { return findLabel(BytedanceCampaign_ad_type, value); }
export function getDeliveryTypeLabel(value: any) { return findLabel(BytedanceCampaign_delivery_type, value); }
export function getAigcDynamicCreativeSwitchLabel(value: any) { return findLabel(BytedanceCampaign_aigc_dynamic_creative_switch, value); }
export function getStarAutoMaterialAdditionSwitchLabel(value: any) { return findLabel(BytedanceCampaign_star_auto_material_addition_switch, value); }
export function getStarAutoDeliverySwitchLabel(value: any) { return findLabel(BytedanceCampaign_star_auto_delivery_switch, value); }
export function getAudienceExtendLabel(value: any) { return findLabel(BytedanceCampaign_audience_extend, value); }
export function getAutoExtendTrafficCampaignLabel(value: any) { return findLabel(BytedanceCampaign_auto_extend_traffic, value); }
export function getKeywordBidTypeLabel(value: any) { return findLabel(BytedanceCampaign_keyword_bid_type, value); }
export function getKeywordMatchTypeLabel(value: any) { return findLabel(BytedanceCampaign_keyword_match_type, value); }
export function getBlueFlowPackageSettingLabel(value: any) { return findLabel(BytedanceCampaign_blue_flow_package_setting, value); }
export function getProductSettingLabel(value: any) { return findLabel(BytedanceCampaign_product_setting, value); }
export function getDownloadModeLabel(value: any) { return findLabel(BytedanceCampaign_download_mode, value); }
export function getDownloadTypeLabel(value: any) { return findLabel(BytedanceCampaign_download_type, value); }
export function getLaunchTypeLabel(value: any) { return findLabel(BytedanceCampaign_launch_type, value); }
export function getPromotionTypeLabel(value: any) { return findLabel(BytedanceCampaign_promotion_type, value); }
export function getOpenUrlTypeLabel(value: any) { return findLabel(BytedanceCampaign_open_url_type, value); }
export function getUlinkUrlTypeLabel(value: any) { return findLabel(BytedanceCampaign_ulink_url_type, value); }
export function getAssetTypeLabel(value: any) { return findLabel(BytedanceCampaign_asset_type, value); }
export function getMultiAssetTypeLabel(value: any) { return findLabel(BytedanceCampaign_multi_asset_type, value); }
export function getMicroPromotionTypeLabel(value: any) { return findLabel(BytedanceCampaign_micro_promotion_type, value); }
export function getDpaAdtypeLabel(value: any) { return findLabel(BytedanceCampaign_dpa_adtype, value); }
export function getPaidSwitchLabel(value: any) { return findLabel(BytedanceCampaign_paid_switch, value); }
export function getValueOptimizedTypeLabel(value: any) { return findLabel(BytedanceCampaign_value_optimized_type, value); }
export function getLandingPageStayTimeLabel(value: any) { return findLabel(BytedanceCampaign_landing_page_stay_time, value); }
export function getInventoryCatalogLabel(value: any) { return findLabel(BytedanceCampaign_inventory_catalog, value); }
export function getInventoryTypeLabel(value: any) { return findLabel(BytedanceCampaign_inventory_type, value); }
export function getUnionVideoTypeLabel(value: any) { return findLabel(BytedanceCampaign_union_video_type, value); }
export function getScheduleTypeLabel(value: any) { return findLabel(BytedanceCampaign_schedule_type, value); }
export function getFilterNightSwitchLabel(value: any) { return findLabel(BytedanceCampaign_filter_night_switch, value); }
export function getDeepBidTypeLabel(value: any) { return findLabel(BytedanceCampaign_deep_bid_type, value); }
export function getBidTypeLabel(value: any) { return findLabel(BytedanceCampaign_bid_type, value); }
export function getProjectCustomLabel(value: any) { return findLabel(BytedanceCampaign_project_custom, value); }
export function getBudgetModeCampaignLabel(value: any) { return findLabel(BytedanceCampgin_budget_mode, value); }
export function getPricingLabel(value: any) { return findLabel(BytedanceCampaign_pricing, value); }
export function getLayerRoiSwitchLabel(value: any) { return findLabel(BytedanceCampaign_layer_roi_switch, value); }
export function getBudgetOptimizeSwitchLabel(value: any) { return findLabel(BytedanceCampaign_budget_optimize_switch, value); }
export function getSearchContinueDeliveryLabel(value: any) { return findLabel(BytedanceCampaign_search_continue_delivery, value); }
export function getSendTypeLabel(value: any) { return findLabel(BytedanceCampaign_send_type, value); }
export function getAnchorRelatedTypeLabel(value: any) { return findLabel(BytedancePromotion_anchor_related_type, value); }
export function getIntelligentGenerationLabel(value: any) { return findLabel(BytedancePromotion_intelligent_generation, value); }
export function getIsCommentDisableLabel(value: any) { return findLabel(BytedancePromotion_is_comment_disable, value); }
export function getAdDownloadStatusLabel(value: any) { return findLabel(BytedancePromotion_ad_download_status, value); }
export function getBudgetModePromotionLabel(value: any) { return findLabel(BytedancePromotion_budget_mode, value); }
export function getShopPlatformLabel(value: any) { return findLabel(BytedancePromotion_shop_platform, value); }
export function getAutoExtendTrafficPromotionLabel(value: any) { return findLabel(BytedancePromotion_auto_extend_traffic, value); }
export function getMatchTypeLabel(value: any) { return findLabel(BytedancePromotion_match_type, value); }

const CAMPAIGN_OPERATION_OPTIONS = [
  { label: '启用', value: 'ENABLE' },
  { label: '停用', value: 'DISABLE' },
];
export function getCampaignOperationLabel(value: any) { return findLabel(CAMPAIGN_OPERATION_OPTIONS, value); }

const DELIVERY_MODE_OPTIONS = [
  { label: '手动', value: 'MANUAL' },
  { label: '自动', value: 'PROCEDURAL' },
];
export function getDeliveryModeLabel(value: any) { return findLabel(DELIVERY_MODE_OPTIONS, value); }

export const fieldLabelMap: Record<string, (value: any) => string> = {
  // Campaign level (project)
  landing_type: getLandingTypeLabel,
  app_promotion_type: getAppPromotionTypeLabel,
  marketing_goal: getMarketingGoalLabel,
  ad_type: getAdTypeLabel,
  delivery_type: getDeliveryTypeLabel,
  aigc_dynamic_creative_switch: getAigcDynamicCreativeSwitchLabel,
  star_auto_material_addition_switch: getStarAutoMaterialAdditionSwitchLabel,
  star_auto_delivery_switch: getStarAutoDeliverySwitchLabel,
  audience_extend: getAudienceExtendLabel,
  auto_extend_traffic: getAutoExtendTrafficCampaignLabel,
  keyword_bid_type: getKeywordBidTypeLabel,
  keyword_match_type: getKeywordMatchTypeLabel,
  blue_flow_package_setting: getBlueFlowPackageSettingLabel,
  product_setting: getProductSettingLabel,
  download_mode: getDownloadModeLabel,
  download_type: getDownloadTypeLabel,
  launch_type: getLaunchTypeLabel,
  promotion_type: getPromotionTypeLabel,
  open_url_type: getOpenUrlTypeLabel,
  ulink_url_type: getUlinkUrlTypeLabel,
  asset_type: getAssetTypeLabel,
  multi_asset_type: getMultiAssetTypeLabel,
  micro_promotion_type: getMicroPromotionTypeLabel,
  dpa_adtype: getDpaAdtypeLabel,
  paid_switch: getPaidSwitchLabel,
  value_optimized_type: getValueOptimizedTypeLabel,
  landing_page_stay_time: getLandingPageStayTimeLabel,
  inventory_catalog: getInventoryCatalogLabel,
  inventory_type: getInventoryTypeLabel,
  union_video_type: getUnionVideoTypeLabel,
  schedule_type: getScheduleTypeLabel,
  filter_night_switch: getFilterNightSwitchLabel,
  deep_bid_type: getDeepBidTypeLabel,
  bid_type: getBidTypeLabel,
  project_custom: getProjectCustomLabel,
  budget_mode: getBudgetModeCampaignLabel,
  pricing: getPricingLabel,
  layer_roi_switch: getLayerRoiSwitchLabel,
  budget_optimize_switch: getBudgetOptimizeSwitchLabel,
  search_continue_delivery: getSearchContinueDeliveryLabel,
  send_type: getSendTypeLabel,
  // DeliveryMode enum
  delivery_mode: getDeliveryModeLabel,
  // Promotion level (ad)
  operation: getCampaignOperationLabel,
  anchor_related_type: getAnchorRelatedTypeLabel,
  intelligent_generation: getIntelligentGenerationLabel,
  is_comment_disable: getIsCommentDisableLabel,
  ad_download_status: getAdDownloadStatusLabel,
  // budget_mode for promotion (re-export same function with different key)
  budget_mode_promotion: getBudgetModePromotionLabel,
  shop_platform: getShopPlatformLabel,
  match_type: getMatchTypeLabel,
};
