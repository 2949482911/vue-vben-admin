import {
  Marketing_carrier_type,
  Tencent_adx_realtime_type,
  Tencent_bid_mode,
  Tencent_bid_scene,
  Tencent_configured_status,
  Tencent_cost_constraint_scene,
  Tencent_creative_delivery_mode,
  Tencent_dynamic_creative_type,
  Tencent_ecom_pkam_switch,
  Tencent_exploration_strategy,
  Tencent_marketing_goal,
  Tencent_marketing_sub_goal,
  Tencent_marketing_target_type,
  Tencent_short_play_pay_type,
  Tencent_smart_bid_type,
  TencentOptimization_goal,
  Tencnet_site_set,
} from './tencent_enums';

/**
 * TENCENT_MARKETING_TYPE
 * 腾讯营销类型模板
 */
export const TENCENT_MARKETING_TYPE = [
  {
    label: "基础模板",
    value: "base_template"
  },
  {
    label: "微信小游戏",
    value: "wechat_mini_game"
  },
  {
    label: "小程序",
    value: "mini_program"
  },
  {
    label: "快应用",
    value: "quck_app"
  },
  {
    label: "安卓应用",
    value: "android"
  },
  {
    label: "IOS应用",
    value: "ios"
  }
]

/**
 * 选项数组转「码值 -> 文案」字典，供广告管理列表的枚举列展示
 */
function toEnumMap(options: Array<{ label: string; value: any }>) {
  return Object.fromEntries(options.map((item) => [String(item.value), item.label]));
}

/**
 * 广告管理 - 计划（营销单元 tencent_campaign_state）枚举列字典
 * 字段名与后端 TencentPromotionManager.CAMPAIGN_CNAME_MAPPING 对齐
 */
export const TENCENT_CAMPAIGN_ENUMS: Record<string, Record<string, string>> = {
  configured_status: toEnumMap(Tencent_configured_status),
  marketing_goal: toEnumMap(Tencent_marketing_goal),
  marketing_sub_goal: toEnumMap(Tencent_marketing_sub_goal),
  marketing_carrier_type: toEnumMap(Marketing_carrier_type),
  marketing_target_type: toEnumMap(Tencent_marketing_target_type),
  optimization_goal: toEnumMap(TencentOptimization_goal),
  bid_mode: toEnumMap(Tencent_bid_mode),
  smart_bid_type: toEnumMap(Tencent_smart_bid_type),
  bid_scene: toEnumMap(Tencent_bid_scene),
  site_set: toEnumMap(Tencnet_site_set),
  exploration_strategy: toEnumMap(Tencent_exploration_strategy),
  ecom_pkam_switch: toEnumMap(Tencent_ecom_pkam_switch),
  cost_constraint_scene: toEnumMap(Tencent_cost_constraint_scene),
  short_play_pay_type: toEnumMap(Tencent_short_play_pay_type),
  adx_realtime_type: toEnumMap(Tencent_adx_realtime_type),
};

/**
 * 广告管理 - 动态创意（tencent_adgroup_state）枚举列字典
 * 字段名与后端 TencentPromotionManager.ADGROUP_CNAME_MAPPING 对齐
 */
export const TENCENT_ADGROUP_ENUMS: Record<string, Record<string, string>> = {
  configured_status: toEnumMap(Tencent_configured_status),
  delivery_mode: toEnumMap(Tencent_creative_delivery_mode),
  dynamic_creative_type: toEnumMap(Tencent_dynamic_creative_type),
};
