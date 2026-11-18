/**
 * 巨量智擎版枚举定义
 *
 * 智擎版是单层结构（只有项目层级），复用现有巨量引擎枚举
 * 统一模板：std_project_template
 */

// ==================== 模板类型 ====================
export const BYTEDANCE_STD_MARKETING_TYPE = [
  {
    label: '智擎标准项目',
    value: 'base_template',
  },
  {
    label: 'App推广模板',
    value: 'app_template',
  },
];

// ==================== 从巨量引擎复用枚举 ====================
export {
  BytedanceCampaign_ad_type,
  BytedanceCampaign_aigc_dynamic_creative_switch,
  BytedanceCampaign_app_promotion_type,
  BytedanceCampaign_asset_type,
  BytedanceCampaign_audience_extend,
  BytedanceCampaign_auto_extend_traffic,
  BytedanceCampaign_bid_type,
  BytedanceCampaign_blue_flow_package_setting,
  BytedanceCampaign_budget_optimize_switch,
  BytedanceCampaign_deep_bid_type,
  BytedanceCampaign_deep_external_action,
  BytedanceCampaign_delivery_type,
  BytedanceCampaign_download_mode,
  BytedanceCampaign_dpa_adtype,
  BytedanceCampaign_external_action,
  BytedanceCampaign_filter_night_switch,
  BytedanceCampaign_inventory_catalog,
  BytedanceCampaign_inventory_type,
  BytedanceCampaign_keyword_bid_type,
  BytedanceCampaign_keyword_match_type,
  BytedanceCampaign_landing_page_stay_time,
  BytedanceCampaign_landing_type,
  BytedanceCampaign_launch_type,
  BytedanceCampaign_layer_roi_switch,
  BytedanceCampaign_marketing_goal,
  BytedanceCampaign_micro_promotion_type,
  BytedanceCampaign_multi_asset_type,
  BytedanceCampaign_open_url_type,
  BytedanceCampaign_paid_switch,
  BytedanceCampaign_pricing,
  BytedanceCampaign_product_setting,
  BytedanceCampaign_project_custom,
  BytedanceCampaign_promotion_type,
  BytedanceCampaign_schedule_type,
  BytedanceCampaign_search_continue_delivery,
  BytedanceCampaign_send_type,
  BytedanceCampaign_star_auto_delivery_switch,
  BytedanceCampaign_star_auto_material_addition_switch,
  BytedanceCampaign_ulink_url_type,
  BytedanceCampaign_union_video_type,
  BytedanceCampaign_value_optimized_type,
  BytedanceCampgin_budget_mode,
  BytedancePromotion_ad_download_status,
  BytedancePromotion_anchor_related_type,
  BytedancePromotion_auto_extend_traffic,
  BytedancePromotion_budget_mode,
  BytedancePromotion_intelligent_generation,
  BytedancePromotion_is_comment_disable,
  BytedancePromotion_match_type,
  BytedancePromotion_shop_platform,
  CampaignOperation,
  DeliveryMode,
  fieldLabelMap,
  getAdDownloadStatusLabel,
  getAdTypeLabel,
  getAigcDynamicCreativeSwitchLabel,
  getAnchorRelatedTypeLabel,
  getAppPromotionTypeLabel,
  getAssetTypeLabel,
  getAudienceExtendLabel,
  getAutoExtendTrafficCampaignLabel,
  getAutoExtendTrafficPromotionLabel,
  getBidTypeLabel,
  getBlueFlowPackageSettingLabel,
  getBudgetModeCampaignLabel,
  getBudgetModePromotionLabel,
  getBudgetOptimizeSwitchLabel,
  getCampaignOperationLabel,
  getDeepBidTypeLabel,
  getDeepExternalActionLabel,
  getDeliveryModeLabel,
  getDeliveryTypeLabel,
  getDownloadModeLabel,
  getDownloadTypeLabel,
  getDpaAdtypeLabel,
  getExternalActionLabel,
  getFilterNightSwitchLabel,
  getIntelligentGenerationLabel,
  getInventoryCatalogLabel,
  getInventoryTypeLabel,
  getIsCommentDisableLabel,
  getKeywordBidTypeLabel,
  getKeywordMatchTypeLabel,
  getLandingPageStayTimeLabel,
  // Label helper functions
  getLandingTypeLabel,
  getLaunchTypeLabel,
  getLayerRoiSwitchLabel,
  getMarketingGoalLabel,
  getMatchTypeLabel,
  getMicroPromotionTypeLabel,
  getMultiAssetTypeLabel,
  getOpenUrlTypeLabel,
  getPaidSwitchLabel,
  getPricingLabel,
  getProductSettingLabel,
  getProjectCustomLabel,
  getPromotionTypeLabel,
  getScheduleTypeLabel,
  getSearchContinueDeliveryLabel,
  getSendTypeLabel,
  getShopPlatformLabel,
  getStarAutoDeliverySwitchLabel,
  getStarAutoMaterialAdditionSwitchLabel,
  getUlinkUrlTypeLabel,
  getUnionVideoTypeLabel,
  getValueOptimizedTypeLabel
} from '#/views/marketing/creation/bytedance/enums';



export const BytedanceNativeType = [
  {
    label: '账户信息',
    value: 'ACCOUNT'
  },
  {
    label: '抖音号',
    value: 'AWEME'
  },
]


/**
 * WECHAT_APP：微信小程序
 * BYTE_GAME：字节小游戏
 * BYTE_APP：字节小程序
 * ORANGE： 橙子落地页
 * THIRDPARTY ：自研落地页
 * ENTERPRISE ：企业号落地页
 * AWEME 抖音号
 */
export const Bytedance_delivery_medium = [
  {
    label: '应用',
    value: 'APP'
  },
  {
    label: '微信小游戏',
    value: 'WECHAT_GAME'
  }, {
    label: '微信小程序',
    value: 'WECHAT_APP'
  },{
    label: '字节小游戏',
    value: 'BYTE_GAME'
  },{
    label: '字节小程序',
    value: 'BYTE_APP'
  },{
    label: '橙子落地页',
    value: 'ORANGE'
  },{
    label: '自研落地页',
    value: 'THIRDPARTY'
  },{
    label: '企业号落地页',
    value: 'ENTERPRISE'
  },{
    label: '抖音号',
    value: 'AWEME'
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
    label: '直接调起',
    value: 'QUICK_APP_URL',
  },
]
