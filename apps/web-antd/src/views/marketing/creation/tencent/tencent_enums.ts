/**
 * 营销目的类型，
 *
 * MARKETING_GOAL_UNKNOWN 未知
 * MARKETING_GOAL_USER_GROWTH 用户增长
 * MARKETING_GOAL_PRODUCT_SALES 商品销售
 * MARKETING_GOAL_LEAD_RETENTION 线索留资
 * MARKETING_GOAL_BRAND_PROMOTION 品牌宣传
 * MARKETING_GOAL_INCREASE_FANS_INTERACTION 加粉互动
 */
export const Tencent_marketing_goal = [
  {
    label: "未知",
    value: "MARKETING_GOAL_UNKNOWN"
  },
  {
    label: "用户增长",
    value: "MARKETING_GOAL_USER_GROWTH"
  },
  {
    label: "商品销售",
    value: "MARKETING_GOAL_PRODUCT_SALES"
  },
  {
    label: "线索留资",
    value: "MARKETING_GOAL_LEAD_RETENTION"
  },
  {
    label: "品牌宣传",
    value: "MARKETING_GOAL_BRAND_PROMOTION"
  },
  {
    label: "加粉互动",
    value: "MARKETING_GOAL_INCREASE_FANS_INTERACTION"
  }
];


/**
 * https://developers.e.qq.com/v3.0/docs/api/adgroups/add
 * 二级营销目的
 * MARKETING_SUB_GOAL_UNKNOWN
 * 未知
 * MARKETING_SUB_GOAL_NEW_GAME_RESERVE
 * 新游预约
 * MARKETING_SUB_GOAL_NEW_GAME_TEST
 * 新游测试
 * MARKETING_SUB_GOAL_NEW_GAME_LAUNCH
 * 新游首发
 * MARKETING_SUB_GOAL_PLATEAU_PHASE_LAUNCH
 * 平推期投放
 * MARKETING_SUB_GOAL_MINI_GAME_NEW_CUSTOMER_GROWTH
 * 新客增长
 * MARKETING_SUB_GOAL_MINI_GAME_RETURN_CUSTOMER_ENGAGEMENT
 * 回流触达
 * MARKETING_SUB_GOAL_APP_ACQUISITION
 * 应用拉新
 * MARKETING_SUB_GOAL_APP_ACTIVATION
 * 应用拉活
 * MARKETING_SUB_GOAL_NOT_INSTALL_USER
 * 未安装用户
 * MARKETING_SUB_GOAL_PRE_INSTALL_USER
 * 预安装用户
 * MARKETING_SUB_GOAL_UNLOADED_USER
 * 已卸载用户
 * MARKETING_SUB_GOAL_SHORT_INACTIVE_USER
 * 短期未活跃用户
 * MARKETING_SUB_GOAL_LONG_INACTIVE_USER
 * 长期未活跃用户
 * MARKETING_SUB_GOAL_GAME_VERSION_UPGRADE
 * 版本更新
 * MARKETING_SUB_GOAL_NEW_STORE_OPENING
 * 新店开业
 * MARKETING_SUB_GOAL_EVENING_PROMOTION
 * 活动促销
 * MARKETING_SUB_GOAL_SPECIAL_RELEASE
 * 专场放量
 */
export const Tencent_marketing_sub_goal = [
  {
    label: "未知",
    value: "MARKETING_SUB_GOAL_UNKNOWN"
  },
  {
    label: "新游预约",
    value: "MARKETING_SUB_GOAL_NEW_GAME_RESERVE"
  },
  {
    label: "新游测试",
    value: "MARKETING_SUB_GOAL_NEW_GAME_TEST"
  },
  {
    label: "新游首发",
    value: "MARKETING_SUB_GOAL_NEW_GAME_LAUNCH"
  },
  {
    label: "平推期投放",
    value: "MARKETING_SUB_GOAL_PLATEAU_PHASE_LA"
  },
  {
    label: "新客增长",
    value: "MARKETING_SUB_GOAL_MINI_GAME_NEW_CUSTOMER_GROWTH"
  },
  {
    label: "回流触达",
    value: "MARKETING_SUB_GOAL_MINI_GAME_RETURN_CUSTOMER_ENGAGEMENT"
  },
  {
    label: "应用拉新",
    value: "MARKETING_SUB_GOAL_APP_ACQUISITION"
  },
  {
    label: "应用拉活",
    value: "MARKETING_SUB_GOAL_APP_ACTIVATION"
  },
  {
    label: "未安装用户",
    value: "MARKETING_SUB_GOAL_NOT_INSTALL_USER"
  },
  {
    label: "预安装用户",
    value: "MARKETING_SUB_GOAL_PRE_INSTALL_USER"
  },
  {
    label: "已卸载用户",
    value: "MARKETING_SUB_GOAL_UNLOADED_USER"
  },
  {
    label: "短期未活跃用户",
    value: "MARKETING_SUB_GOAL_SHORT_INACTIVE_USER"
  },
  {
    label: "长期未活跃用户",
    value: "MARKETING_SUB_GOAL_LONG_INACTIVE_USER"
  },
  {
    label: "版本更新",
    value: "MARKETING_SUB_GOAL_GAME_VERSION_UPGRADE"
  },
  {
    label: "新店开业",
    value: "MARKETING_SUB_GOAL_NEW_STORE_OPENING"
  },
  {
    label: "活动促销",
    value: "MARKETING_SUB_GOAL_EVENING_PROMOTION"
  },
  {
    label: "专场放量",
    value: "MARKETING_SUB_GOAL_SPECIAL_RELEASE"
  }
];


/**
 * 营销载体类型
 * MARKETING_CARRIER_TYPE_UNKNOWN
 * 未知
 * MARKETING_CARRIER_TYPE_APP_ANDROID
 * Android 应用
 * MARKETING_CARRIER_TYPE_APP_IOS
 * IOS 应用
 * MARKETING_CARRIER_TYPE_WECHAT_OFFICIAL_ACCOUNT
 * 微信公众号
 * MARKETING_CARRIER_TYPE_JUMP_PAGE
 * 页面跳转
 * MARKETING_CARRIER_TYPE_WECHAT_MINI_GAME
 * 微信小游戏
 * MARKETING_CARRIER_TYPE_WECHAT_CHANNELS_LIVE
 * 视频号直播
 * MARKETING_CARRIER_TYPE_WECHAT_CHANNELS
 * 视频号动态
 * MARKETING_CARRIER_TYPE_WECHAT_CHANNELS_LIVE_RESERVATION
 * 视频号直播预约
 * MARKETING_CARRIER_TYPE_MINI_PROGRAM_WECHAT
 * 小程序
 * MARKETING_CARRIER_TYPE_APP_QUICK_APP
 * 快应用
 * MARKETING_CARRIER_TYPE_PC_GAME
 * PC 游戏
 * MARKETING_CARRIER_TYPE_QQ_MINI_GAME
 * QQ 小游戏
 * MARKETING_CARRIER_TYPE_APP_HARMONY
 * 鸿蒙应用
 */
export const Marketing_carrier_type = [
  {
    label: "未知",
    value: "MARKETING_CARRIER_TYPE_UNKNOWN"
  },
  {
    label: "Android 应用",
    value: "MARKETING_CARRIER_TYPE_APP_ANDROID"
  },
  {
    label: "IOS 应用",
    value: "MARKETING_CARRIER_TYPE_APP_IOS"
  },
  {
    label: "微信公众号",
    value: "MARKETING_CARRIER_TYPE_WECHAT_OFFICIAL_ACCOUNT"
  },
  {
    label: "页面跳转",
    value: "MARKETING_CARRIER_TYPE_JUMP_PAGE"
  },
  {
    label: "微信小游戏",
    value: "MARKETING_CARRIER_TYPE_WECHAT_MINI_GAME"
  },
  {
    label: "视频号直播",
    value: "MARKETING_CARRIER_TYPE_WECHAT_CHANNELS_LIVE"
  },
  {
    label: "视频号动态",
    value: "MARKETING_CARRIER_TYPE_WECHAT_CHANNELS"
  },
  {
    label: "视频号直播预约",
    value: "MARKETING_CARRIER_TYPE_WECHAT_CHANNELS_LIVE_RESERVATION"
  },
  {
    label: "小程序",
    value: "MARKETING_CARRIER_TYPE_MINI_PROGRAM_WECHAT"
  },
  {
    label: "快应用",
    value: "MARKETING_CARRIER_TYPE_APP_QUICK_APP"
  },
  {
    label: "PC 游戏",
    value: "MARKETING_CARRIER_TYPE_PC_GAME"
  },
  {
    label: "QQ 小游戏",
    value: "MARKETING_CARRIER_TYPE_QQ_MINI_GAME"
  },
  {
    label: "鸿蒙应用",
    value: "MARKETING_CARRIER_TYPE_APP_HARMONY"
  }
];


/**
 * 优化目标类型
 */
export const TencentOptimization_goal = [
  { label: "none", value: "OPTIMIZATIONGOAL_NONE" },
  { label: "品牌转化", value: "OPTIMIZATIONGOAL_BRAND_CONVERSION" },
  { label: "关注", value: "OPTIMIZATIONGOAL_FOLLOW" },
  { label: "点击", value: "OPTIMIZATIONGOAL_CLICK" },
  { label: "曝光", value: "OPTIMIZATIONGOAL_IMPRESSION" },
  { label: "下载", value: "OPTIMIZATIONGOAL_APP_DOWNLOAD" },
  { label: "激活", value: "OPTIMIZATIONGOAL_APP_ACTIVATE" },
  { label: "注册", value: "OPTIMIZATIONGOAL_APP_REGISTER" },
  { label: "次日留存", value: "OPTIMIZATIONGOAL_ONE_DAY_RETENTION" },
  { label: "付费次数", value: "OPTIMIZATIONGOAL_APP_PURCHASE" },
  { label: "下单", value: "OPTIMIZATIONGOAL_ECOMMERCE_ORDER" },
  { label: "H5购买", value: "OPTIMIZATIONGOAL_ECOMMERCE_CHECKOUT" },
  { label: "销售线索", value: "OPTIMIZATIONGOAL_LEADS" },
  { label: "加入购物车", value: "OPTIMIZATIONGOAL_ECOMMERCE_CART" },
  { label: "公众号内注册", value: "OPTIMIZATIONGOAL_PROMOTION_CLICK_KEY_PAGE" },
  { label: "商品详情页浏览", value: "OPTIMIZATIONGOAL_VIEW_COMMODITY_PAGE" },
  { label: "在线咨询", value: "OPTIMIZATIONGOAL_ONLINE_CONSULTATION" },
  { label: "电话拨打", value: "OPTIMIZATIONGOAL_TELEPHONE_CONSULTATION" },
  { label: "表单预约", value: "OPTIMIZATIONGOAL_PAGE_RESERVATION" },
  { label: "发货", value: "OPTIMIZATIONGOAL_DELIVERY" },
  { label: "公众号内发消息", value: "OPTIMIZATIONGOAL_MESSAGE_AFTER_FOLLOW" },
  { label: "公众号内点击菜单栏", value: "OPTIMIZATIONGOAL_CLICK_MENU_AFTER_FOLLOW" },
  { label: "有效在线咨询", value: "OPTIMIZATIONGOAL_PAGE_EFFECTIVE_ONLINE_CONSULT" },
  { label: "完件", value: "OPTIMIZATIONGOAL_APPLY" },
  { label: "有效在线咨询", value: "OPTIMIZATIONGOAL_CONFIRM_EFFECTIVE_LEADS_CONSULT" },
  { label: "有效电话拨打", value: "OPTIMIZATIONGOAL_CONFIRM_EFFECTIVE_LEADS_PHONE" },
  { label: "综合线索收集", value: "OPTIMIZATIONGOAL_LEADS_COLLECT" },
  { label: "首次付费", value: "OPTIMIZATIONGOAL_FIRST_PURCHASE" },
  { label: "预授信", value: "OPTIMIZATIONGOAL_PRE_CREDIT" },
  { label: "授信", value: "OPTIMIZATIONGOAL_CREDIT" },
  { label: "提现", value: "OPTIMIZATIONGOAL_WITHDRAW_DEPOSITS" },
  { label: "关键页面访问次数", value: "OPTIMIZATIONGOAL_PROMOTION_VIEW_KEY_PAGE" },
  { label: "小游戏创角", value: "OPTIMIZATIONGOAL_MOBILE_APP_CREATE_ROLE" },
  { label: "跳转按钮点击", value: "OPTIMIZATIONGOAL_CANVAS_CLICK" },
  { label: "领券", value: "OPTIMIZATIONGOAL_PROMOTION_CLAIM_OFFER" },
  { label: "商品收藏", value: "OPTIMIZATIONGOAL_ECOMMERCE_ADD_TO_WISHLIST" },
  { label: "有效表单提交", value: "OPTIMIZATIONGOAL_CONFIRM_EFFECTIVE_LEADS_RESERVATION" },
  { label: "签收", value: "OPTIMIZATIONGOAL_PAGE_RECEIPT" },
  { label: "加企业微信客服", value: "OPTIMIZATIONGOAL_PAGE_SCAN_CODE" },
  { label: "选课", value: "OPTIMIZATIONGOAL_SELECT_COURSE" },
  { label: "电话潜在客户", value: "OPTIMIZATIONGOAL_CONFIRM_POTENTIAL_CUSTOMER_PHONE" },
  { label: "流量变现", value: "OPTIMIZATIONGOAL_MOBILE_APP_AD_INCOME" },
  { label: "小游戏授权", value: "OPTIMIZATIONGOAL_MOBILE_APP_ACCREDIT" },
  { label: "首次会员购买", value: "OPTIMIZATIONGOAL_PURCHASE_MEMBER_CARD" },
  { label: "有效综合线索", value: "OPTIMIZATIONGOAL_PAGE_CONFIRM_EFFECTIVE_LEADS" },
  { label: "微信流量预约行为", value: "OPTIMIZATIONGOAL_RESERVATION" },
  { label: "首次下单", value: "OPTIMIZATIONGOAL_FIRST_ECOMMERCE_ORDER" },
  { label: "点赞", value: "OPTIMIZATIONGOAL_LIKE" },
  { label: "快应用加桌面", value: "OPTIMIZATIONGOAL_ADD_DESKTOP" },
  { label: "外链点击", value: "OPTIMIZATIONGOAL_EXTERNAL_LINK_CLICK" },
  { label: "购券", value: "OPTIMIZATIONGOAL_BUY_COUPONS" },
  { label: "咨询留资", value: "OPTIMIZATIONGOAL_LEAVE_INFORMATION" },
  { label: "关键行为", value: "OPTIMIZATIONGOAL_CORE_ACTION" },
  { label: "次留率", value: "OPTIMIZATIONGOAL_ONE_DAY_RETENTION_RATIO" },
  { label: "阅读文章", value: "OPTIMIZATIONGOAL_PROMOTION_READ_ARTICLE" },
  { label: "24小时下单", value: "OPTIMIZATIONGOAL_FIRST_TWENTY_FOUR_HOUR_ECOMMERCE_ORDER" },
  { label: "扫码加粉", value: "OPTIMIZATIONGOAL_ECOMMERCE_SCANCODE_WX" },
  { label: "7日留存", value: "OPTIMIZATIONGOAL_MOBILE_APP_SEVEN_DAYS_RETENTION" },
  { label: "首次到课", value: "OPTIMIZATIONGOAL_CLASS_PARTICIPATED" },
  { label: "保险支付", value: "OPTIMIZATIONGOAL_INSURANCE_PURCHASE" },
  { label: "意向表单", value: "OPTIMIZATIONGOAL_RESERVATION_CHECK" },
  { label: "券商开户", value: "OPTIMIZATIONGOAL_OPEN_ACCOUNT" },
  { label: "7日下单", value: "OPTIMIZATIONGOAL_SEVEN_DAY_ECOMMERCE_ORDER" },
  { label: "添加个人微信客服", value: "OPTIMIZATIONGOAL_ADD_WECHAT_SERVICE" },
  { label: "加企微后咨询", value: "OPTIMIZATIONGOAL_WECOM_CONSULTATION" },
  { label: "加群", value: "OPTIMIZATIONGOAL_ADD_GROUP" },
  { label: "快速下单", value: "OPTIMIZATIONGOAL_QUICK_ORDER" },
  { label: "预付定金", value: "OPTIMIZATIONGOAL_PRE_PAY" },
  { label: "主动一句话咨询", value: "OPTIMIZATIONGOAL_PAGE_ONLINE_CONSULT_ACTIVE_ONE_MSG" },
  { label: "通话30S", value: "OPTIMIZATIONGOAL_CALL_DURATION_THIRTY_SECONDS" },
  { label: "领课", value: "OPTIMIZATIONGOAL_CLAIM_COURSE" },
  { label: "退群", value: "OPTIMIZATIONGOAL_QUIT_GROUP" },
  { label: "拉新访问关键页面", value: "OPTIMIZATIONGOAL_VIEW_ACQUISITION_CONTENT" },
  { label: "沉默唤起", value: "OPTIMIZATIONGOAL_BACK_FLOW" },
  { label: "三句话咨询", value: "OPTIMIZATIONGOAL_PAGE_ONLINE_CONSULT_THREE_MSG" },
  { label: "保险续费", value: "OPTIMIZATIONGOAL_RENEWAL" },
  { label: "低价课转化", value: "OPTIMIZATIONGOAL_LOW_PRICE_COURSE_CONVERSION" },
  { label: "开口后下单意向", value: "OPTIMIZATIONGOAL_CONSULT_INTENTION" },
  { label: "七日内每次留存成本", value: "OPTIMIZATIONGOAL_EVERY_DAY_RETENTION_COST" },
  { label: "关键页面访问人数", value: "OPTIMIZATIONGOAL_PROMOTION_VIEW_KEY_PAGE_UV" },
  { label: "直播观看一分钟", value: "OPTIMIZATIONGOAL_LIVE_STREAM_DURATION_1MIN" },
  { label: "直播互动", value: "OPTIMIZATIONGOAL_LIVE_STREAM_INTERACTION" },
  { label: "取消订单率", value: "OPTIMIZATIONGOAL_ECOMMERCE_CANCEL_ORDER" },
  { label: "点击留资组件", value: "OPTIMIZATIONGOAL_CLICK_LEADS_COMPONENT" },
  { label: "正价课", value: "OPTIMIZATIONGOAL_REGULAR_PRICE_COURSE" },
  { label: "到店", value: "OPTIMIZATIONGOAL_VISIT_STORE" },
  { label: "每日首次启动", value: "OPTIMIZATIONGOAL_EFFECTIVE_ENTRY" },
  { label: "完件授信率", value: "OPTIMIZATIONGOAL_CREDIT_RATIO" },
  { label: "全域通直播间成交", value: "OPTIMIZATIONGOAL_QYT_LIVE_STREAM_DEAL" },
  { label: "全域通直播间商品点击", value: "OPTIMIZATIONGOAL_QYT_LIVE_STREAM_PRODUCT_CLICK" },
  { label: "全域通直播间观众", value: "OPTIMIZATIONGOAL_QYT_LIVE_STREAM_AUDIENCE" },
  { label: "全域通直播评论次数", value: "OPTIMIZATIONGOAL_QYT_LIVE_STREAM_COMMENT" },
  { label: "全域通直播间涨粉", value: "OPTIMIZATIONGOAL_QYT_LIVE_STREAM_FANS" },
  { label: "首日首次付费", value: "OPTIMIZATIONGOAL_24H_FIRSTPAY" },
  { label: "店铺停留", value: "OPTIMIZATIONGOAL_STORE_STAY" },
  { label: "低价险支付", value: "OPTIMIZATIONGOAL_LOW_PRICE_INSURANCE_PAYMENT" },
  { label: "贷款额度开通", value: "OPTIMIZATIONGOAL_UNDERWRITING" },
  { label: "借款", value: "OPTIMIZATIONGOAL_FIRST_WITHDRAWAL" },
  { label: "先导课完课", value: "OPTIMIZATIONGOAL_BRIDGING_COURSE_COMPLETED" },
  { label: "浏览三十秒扫码加粉", value: "OPTIMIZATIONGOAL_THIRTY_SECONDS_SCANCODE_WX" },
  { label: "24小时退款率", value: "OPTIMIZATIONGOAL_FIRST_TWENTY_FOUR_HOUR_REFUND_RATE" },
  { label: "观看转化", value: "OPTIMIZATIONGOAL_VIEW_DRAMA_DURATION_1MIN" },
  { label: "首次发送提示语", value: "OPTIMIZATIONGOAL_FIRST_PROMPT_INPUT" },
  { label: "送礼下单", value: "OPTIMIZATIONGOAL_ECOMMERCE_GIFTING_ORDER" },
  { label: "支付后存在意向", value: "OPTIMIZATIONGOAL_CLUE_PAY_SUCCEED" },
  { label: "30日退订率", value: "OPTIMIZATIONGOAL_30DAY_UNSUBSCRIBE_RATE" },
  { label: "二十四小时净成交成本", value: "OPTIMIZATIONGOAL_NET_PROFIT_24H" },
  { label: "有效投保", value: "OPTIMIZATIONGOAL_EFFECTIVE_INSURE" },
  { label: "店铺收藏", value: "OPTIMIZATIONGOAL_COLLECT" }
];


/**
 * 投放版位集合
 *
 * SITE_SET_MOBILE_UNION
 * 腾讯营销联盟
 * SITE_SET_WECHAT
 * 微信公众号与小程序
 * SITE_SET_TENCENT_NEWS
 * 腾讯新闻
 * SITE_SET_TENCENT_VIDEO
 * 腾讯视频
 * SITE_SET_MOBILE_YYB
 * 应用宝
 * SITE_SET_PCQQ
 * 腾讯营销电脑端（PC）
 * SITE_SET_KANDIAN
 * QQ 浏览器（原腾讯看点）
 * SITE_SET_QQ_MUSIC_GAME
 * QQ、腾讯音乐及游戏
 * SITE_SET_MOMENTS
 * 微信朋友圈
 * SITE_SET_CHANNELS
 * 微信视频号
 * SITE_SET_WECHAT_SEARCH
 * 微信搜一搜（仅支持搜索营销）
 * SITE_SET_WECHAT_PLUGIN
 * 微信新闻插件
 * SITE_SET_QBSEARCH
 * QQ 浏览器等（仅支持搜索营销）
 * SITE_SET_SEARCH_SCENE
 * 搜索场景
 * SITE_SET_SEARCH_MOBILE_UNION
 * 腾讯营销联盟搜索
 * SITE_SET_WECHAT_NON_STANDARD
 * 微信非标版位
 * SITE_SET_SMART
 * 自动版位（仅供智能投放报表展示）
 */
export const Tencnet_site_set = [
  {
    label: "腾讯营销联盟",
    value: "SITE_SET_MOBILE_UNION"
  },
  {
    label: "微信公众号与小程序",
    value: "SITE_SET_WECHAT"
  },
  {
    label: "腾讯新闻",
    value: "SITE_SET_TENCENT_NEWS"
  },
  {
    label: "腾讯视频",
    value: "SITE_SET_TENCENT_VIDEO"
  },
  {
    label: "应用宝",
    value: "SITE_SET_MOBILE_YYB"
  },
  {
    label: "腾讯营销电脑端（PC）",
    value: "SITE_SET_PCQQ"
  },
  {
    label: "QQ 浏览器（原腾讯看点）",
    value: "SITE_SET_KANDIAN"
  },
  {
    label: "QQ、腾讯音乐及游戏",
    value: "SITE_SET_QQ_MUSIC_GAME"
  },
  {
    label: "微信朋友圈",
    value: "SITE_SET_MOMENTS"
  },
  {
    label: "微信视频号",
    value: "SITE_SET_CHANNELS"
  },
  {
    label: "微信搜一搜（仅支持搜索营销）",
    value: "SITE_SET_WECHAT_SEARCH"
  },
  {
    label: "微信新闻插件",
    value: "SITE_SET_WECHAT_PLUGIN"
  },
  {
    label: "QQ 浏览器等（仅支持搜索营销）",
    value: "SITE_SET_QBSEARCH"
  },
  {
    label: "搜索场景",
    value: "SITE_SET_SEARCH_SCENE"
  },
  {
    label: "腾讯营销联盟搜索",
    value: "SITE_SET_SEARCH_MOBILE_UNION"
  },
  {
    label: "微信非标版位",
    value: "SITE_SET_WECHAT_NON_STANDARD"
  },
  {
    label: "自动版位（仅供智能投放报表展示）",
    value: "SITE_SET_SMART"
  }
];


/**
 *
 */
export const Tencent_priority_site_set = [];


/**
 * 移动联盟场景定向
 * MOBILE_UNION_IN_WECHAT
 * 移动联盟第三方流量在微信内打开的场景
 * MOBILE_UNION_REWARDED_VIDEO
 * 激励视频，该流量场景可以为用户打造沉浸式营销体验，用奖励吸引他们完整观看视频营销，视频时长要求 5-30s
 * MOBILE_UNION_REWARDED_MEDIA
 * 激励媒体，含激励任务的 app、激活成本低且人群较下沉的流量场景
 * MOBILE_UNION_SMB_CUSTOMIZATION
 * 中小客户定制，适合第 1 次投放联盟流量的中小客户，做测试投放的冷启动，该场景流量较小，有扩量需求不建议使用
 * MOBILE_UNION_GAME_ADVERTISER_PECULIAR
 * 根据游戏营销关注的效果指标，系统推荐的定投流量，建议配合 oCPA 使用
 * MOBILE_UNION_READ_ADVERTISER
 * 阅读行业客户定制，适合阅读行业且考核留存指标的客户投放
 */
export const Tencent_mobile_union = [
  {
    label: "移动联盟第三方流量在微信内打开的场景",
    value: "MOBILE_UNION_IN_WECHAT"
  },
  {
    label: "激励视频，该流量场景可以为用户打造沉浸式营销体验，用奖励吸引他们完整观看视频营销，视频时长要求 5-30s",
    value: "MOBILE_UNION_REWARDED_VIDEO"
  },
  {
    label: "激励媒体，含激励任务的 app、激活成本低且人群较下沉的流量场景",
    value: "MOBILE_UNION_REWARDED_MEDIA"
  },
  {
    label: "中小客户定制，适合第 1 次投放联盟流量的中小客户，做测试投放的冷启动，该场景流量较小，有扩量需求不建议使用",
    value: "MOBILE_UNION_SMB_CUSTOMIZATION"
  },
  {
    label: "根据游戏营销关注的效果指标，系统推荐的定投流量，建议配合 oCPA 使用",
    value: "MOBILE_UNION_GAME_ADVERTISER_PECULIAR"
  },
  {
    label: "阅读行业客户定制，适合阅读行业且考核留存指标的客户投放",
    value: "MOBILE_UNION_READ_ADVERTISER"
  }
];

/**
 * oCPA 深度优化价值配置
 *
 *
 * DEEP_CONVERSION_WORTH
 * 优化 ROI
 * DEEP_CONVERSION_BEHAVIOR
 * 优化转化行为
 * DEEP_CONVERSION_WORTH_ADVANCED
 * 深度辅助优化 ROI
 * DEEP_CONVERSION_BEHAVIOR_ADVANCED
 * 深度辅助优化 OG
 */
export const Tencent_deep_conversion_type = [

  {
    label: "优化 ROI",
    value: "DEEP_CONVERSION_WORTH"
  },
  {
    label: "优化转化行为",
    value: "DEEP_CONVERSION_BEHAVIOR"
  },
  {
    label: "深度辅助优化 ROI",
    value: "DEEP_CONVERSION_WORTH_ADVANCED"
  },
  {
    label: "深度辅助优化 OG",
    value: "DEEP_CONVERSION_BEHAVIOR_ADVANCED"
  }
];

/**
 * 优化 ROI 目标
 *
 * GOAL_7DAY_PURCHASE_ROAS
 * 七日付费 ROI
 * GOAL_30DAY_ORDER_ROAS
 * 下单 ROI
 * GOAL_1DAY_PURCHASE_ROAS
 * 首日付费 ROI
 * GOAL_1DAY_MONETIZATION_ROAS
 * 首日变现 ROI
 * GOAL_7DAY_MONETIZATION_ROAS
 * 七日变现 ROI
 * GOAL_7DAY_RETENTION_TIMES
 * 七日内留存天数
 * GOAL_7DAY_LONGTERM_PURCHASE_ROAS
 * 七日长效付费
 * GOAL_14DAY_LONGTERM_PURCHASE_ROAS
 * 十四日长效付费
 * GOAL_30DAY_LONGTERM_PURCHASE_ROAS
 * 三十日长效付费
 * GOAL_QYT_7DAY_LIVE_STREAM_DEAL_ROAS
 * 全域通七日直播间成交
 * GOAL_WITHDRAW_DEPOSITS_ROAS
 * 七日提现 ROI
 * GOAL_1DAY_PURCHASE_MONETIZATION_ROAS
 * 首日混合变现 ROI
 * GOAL_NET_PROFIT_24H_ROAS
 * 净成交 ROI
 * GOAL_CPS_ESTIMATED_DISTRIBUTE_ROAS
 * 佣金 ROI
 */
export const Tencent_deep_conversion_worth_spec_goal = [

  {
    label: "七日付费 ROI",
    value: "GOAL_7DAY_PURCHASE_ROAS"
  },
  {
    label: "下单 ROI",
    value: "GOAL_30DAY_ORDER_ROAS"
  },
  {
    label: "首日付费 ROI",
    value: "GOAL_1DAY_PURCHASE_ROAS"
  },
  {
    label: "首日变现 ROI",
    value: "GOAL_1DAY_MONETIZATION_ROAS"
  },
  {
    label: "七日变现 ROI",
    value: "GOAL_7DAY_MONETIZATION_ROAS"
  },
  {
    label: "七日内留存天数",
    value: "GOAL_7DAY_RETENTION_TIMES"
  },
  {
    label: "七日长效付费",
    value: "GOAL_7DAY_LONGTERM_PURCHASE_ROAS"
  },
  {
    label: "十四日长效付费",
    value: "GOAL_14DAY_LONGTERM_PURCHASE_ROAS"
  },
  {
    label: "三十日长效付费",
    value: "GOAL_30DAY_LONGTERM_PURCHASE_ROAS"
  },
  {
    label: "全域通七日直播间成交",
    value: "GOAL_QYT_7DAY_LIVE_STREAM_DEAL_ROAS"
  },
  {
    label: "七日提现 ROI",
    value: "GOAL_WITHDRAW_DEPOSITS_ROAS"
  },
  {
    label: "首日混合变现 ROI",
    value: "GOAL_1DAY_PURCHASE_MONETIZATION_ROAS"
  },
  {
    label: "净成交 ROI",
    value: "GOAL_NET_PROFIT_24H_ROAS"
  },
  {
    label: "佣金 ROI",
    value: "GOAL_CPS_ESTIMATED_DISTRIBUTE_ROAS"
  }
];

/**
 * 出价方式
 *
 *
 * BID_MODE_CPC
 * cpc
 * BID_MODE_CPA
 * cpa
 * BID_MODE_CPS
 * cps
 * BID_MODE_CPM
 * cpm
 * BID_MODE_OCPC
 * ocpc
 * BID_MODE_OCPM
 * ocpm
 */
export const Tencent_bid_mode = [

  {
    label: "cpc",
    value: "BID_MODE_CPC"
  },
  {
    label: "cpa",
    value: "BID_MODE_CPA"
  },
  {
    label: "cps",
    value: "BID_MODE_CPS"
  },
  {
    label: "cpm",
    value: "BID_MODE_CPM"
  },
  {
    label: "ocpc",
    value: "BID_MODE_OCPC"
  },
  {
    label: "ocpm",
    value: "BID_MODE_OCPM"
  }
];


/**
 * 出价类型
 *
 *
 * SMART_BID_TYPE_CUSTOM
 * 手动出价
 * SMART_BID_TYPE_SYSTEMATIC
 * 自动出价
 */
export const Tencent_smart_bid_type = [
  {
    label: "手动出价",
    value: "SMART_BID_TYPE_CUSTOM"
  },
  {
    label: "自动出价",
    value: "SMART_BID_TYPE_SYSTEMATIC"
  }
];


/**
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_UNKNOWN
 * 默认值
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_TEMPLATE
 * AI 模板
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_OUTPAINTING
 * AI 扩图
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_MINI_IMAGE
 * 商品九图
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_MIX_CUT
 * 爆款混剪
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_NOVEL_DRAMA_IMAGE
 * 营销图文
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_DRAMA_MIX_CUT
 * 短剧混剪
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_DRAMA_TRANSFORM
 * 短剧竖转横
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_CONTEXT
 * 文案生成
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_HOME_IMAGE
 * 房家图文
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_SMARTGAME_IMG_BG
 * 游戏图片裂变
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_SMARTGAME_NINE_IMG
 * 游戏九图
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_MINIDRAMA_NINE_IMG
 * 短剧九图
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_PRODUCT_IMAGE
 * 商品海报
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_SMARTGAME_VIDEO
 * 游戏视频
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_EDU_NINE_IMG
 * 教育九图
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_HEALTH_NINE_IMG
 * 健康九图
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_LOCAL_NINE_IMG
 * 本地九图
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_FINANCE_NINE_IMG
 * 金融九图
 * AUTO_DERIVED_CREATIVE_METHOD_TYPE_VIDEO_GENERATION
 * 视频生成
 *
 */
export const Tencent_auto_derived_creative_method_type_list = [
  {
    label: "默认值",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_UNKNOWN"
  },
  {
    label: "AI 模板",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_TEMPLATE"
  },
  {
    label: "AI 扩图",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_OUTPAINTING"
  },
  {
    label: "商品九图",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_MINI_IMAGE"
  },
  {
    label: "爆款混剪",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_MIX_CUT"
  },
  {
    label: "营销图文",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_NOVEL_DRAMA_IMAGE"
  },
  {
    label: "短剧混剪",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_DRAMA_MIX_CUT"
  },
  {
    label: "短剧竖转横",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_DRAMA_TRANSFORM"
  },
  {
    label: "文案生成",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_CONTEXT"
  },
  {
    label: "房家图文",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_HOME_IMAGE"
  },
  {
    label: "游戏图片裂变",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_SMARTGAME_IMG_BG"
  },
  {
    label: "游戏九图",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_SMARTGAME_NINE_IMG"
  },
  {
    label: "短剧九图",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_MINIDRAMA_NINE_IMG"
  },
  {
    label: "商品海报",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_PRODUCT_IMAGE"
  },
  {
    label: "游戏视频",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_SMARTGAME_VIDEO"
  },
  {
    label: "教育九图",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_EDU_NINE_IMG"
  },
  {
    label: "健康九图",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_HEALTH_NINE_IMG"
  },
  {
    label: "本地九图",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_LOCAL_NINE_IMG"
  },
  {
    label: "金融九图",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_FINANCE_NINE_IMG"
  },
  {
    label: "视频生成",
    value: "AUTO_DERIVED_CREATIVE_METHOD_TYPE_VIDEO_GENERATION"
  }

];


/**
 * 搜索定向拓展开关
 * SEARCH_EXPAND_TARGETING_SWITCH_UNKNOWN
 * 未知 等同关闭
 * SEARCH_EXPAND_TARGETING_SWITCH_OPEN
 * 打开
 * SEARCH_EXPAND_TARGETING_SWITCH_CLOSE
 * 关闭
 */
export const Tencent_search_expand_targeting_switch = [
  {
    label: "未知 等同关闭",
    value: "SEARCH_EXPAND_TARGETING_SWITCH_UNKNOWN"
  },
  {
    label: "打开",
    value: "SEARCH_EXPAND_TARGETING_SWITCH_OPEN"
  },
  {
    label: "关闭",
    value: "SEARCH_EXPAND_TARGETING_SWITCH_CLOSE"
  }
];


/**
 * 出价场景
 *
 * BID_SCENE_NORMAL_AVERAGE
 * 常规投放-稳定投放
 * BID_SCENE_NORMAL_MAX
 * 优先最大转化
 */
export const Tencent_bid_scene = [
  {
    label: "常规投放-稳定投放",
    value: "BID_SCENE_NORMAL_AVERAGE"
  },
  {
    label: "优先最大转化",
    value: "BID_SCENE_NORMAL_MAX"
  }
];


/**
 * 客户设置的状态
 *
 * AD_STATUS_NORMAL
 * 有效
 * AD_STATUS_SUSPEND
 * 暂停
 */
export const Tencent_configured_status = [
  {
    label: "有效",
    value: "AD_STATUS_NORMAL"
  },
  {
    label: "暂停",
    value: "AD_STATUS_SUSPEND"
  }
];


/**
 * 一方人群跑量加强开关状态
 *
 * ECOM_PKAM_SWITCH_CLOSE
 * 关闭
 * ECOM_PKAM_SWITCH_OPEN
 * 打开
 */
export const Tencent_ecom_pkam_switch = [
  {
    label: "关闭",
    value: "ECOM_PKAM_SWITCH_CLOSE"
  },
  {
    label: "打开",
    value: "ECOM_PKAM_SWITCH_OPEN"
  }
];


/**
 * 成本控制场景
 *
 * COST_CONSTRAINT_SCENE_OPEN
 * 成本控制开启
 */
export const Tencent_cost_constraint_scene = [
  {
    label: "成本控制开启",
    value: "COST_CONSTRAINT_SCENE_OPEN"
  }
];


/**
 * 售卖方式类型
 * SHORT_PLAY_PAY_TYPE_UNKNOWN
 * 未知
 * SHORT_PLAY_PAY_TYPE_FREE_PLAY
 * 免费剧
 * SHORT_PLAY_PAY_TYPE_CHARGE_PLAY
 * 收费剧
 *
 */
export const Tencent_short_play_pay_type = [
  {
    label: "未知",
    value: "SHORT_PLAY_PAY_TYPE_UNKNOWN"
  },
  {
    label: "免费剧",
    value: "SHORT_PLAY_PAY_TYPE_FREE_PLAY"
  },
  {
    label: "收费剧",
    value: "SHORT_PLAY_PAY_TYPE_CHARGE_PLAY"
  }
];


/**
 * 动态营销类型
 *
 * DYNAMIC_AD_TYPE_DYNAMIC_CONTENT
 * 动态内容营销
 */
export const Tencent_dynamic_ad_type = [
  {
    label: "动态内容营销",
    value: "DYNAMIC_AD_TYPE_DYNAMIC_CONTENT"
  }
];


/**
 *
 * 搜索扩量开关
 *
 * SEARCH_EXPANSION_SWITCH_OPEN
 * 打开
 * SEARCH_EXPANSION_SWITCH_CLOSE
 * 关闭
 */
export const Tencent_search_expansion_switch = [
  {
    label: "打开",
    value: "SEARCH_EXPANSION_SWITCH_OPEN"
  },
  {
    label: "关闭",
    value: "SEARCH_EXPANSION_SWITCH_CLOSE"
  }
];


/**
 * ADX 程序化投放素材实时回复类型
 *
 * ADX_REALTIME_TYPE_DEFAULT
 * 送审营销
 * ADX_REALTIME_TYPE_NO_AUDIT
 * 免审营销
 * ADX_REALTIME_TYPE_HALF_NO_AUDIT
 * 半免审营销
 */
export const Tencent_adx_realtime_type = [
  {
    label: "送审营销",
    value: "ADX_REALTIME_TYPE_DEFAULT"
  },
  {
    label: "免审营销",
    value: "ADX_REALTIME_TYPE_NO_AUDIT"
  },
  {
    label: "半免审营销",
    value: "ADX_REALTIME_TYPE_HALF_NO_AUDIT"
  }
];


/**
 * 营销智能定向功能
 *
 * SMART_TARGETING_MANUAL
 * 手动定向
 *
 */
export const Tencent_smart_targeting_mode = [
  {
    label: "智能定向功能",
    value: "SMART_TARGETING_MANUAL"
  }
]


/**
 * 小店智券开关
 *
 * SWITCH_STATUS_OFF
 * 关闭
 * SWITCH_STATUS_ON
 * 开启
 */
export const Tencent_smart_coupon_mode = [
  {
    label: "关闭",
    value: "SWITCH_STATUS_OFF"
  },
  {
    label: "开启",
    value: "SWITCH_STATUS_ON"
  }
]


/**
 *
 * 自动版位探索策略，自动版位开启时才生效(automatic_site_enabled=true)，
 *
 * EXPLORATION_UNKNOW
 * 默认值 默认是自动探索
 * AUTOMATIC_EXPLORATION
 * 自动探索
 * STEADY_EXPLORATION
 * 稳步探索
 */
export const Tencent_exploration_strategy= [
  {
    label: "默认值(默认是自动探索)",
    value: "EXPLORATION_UNKNOW"
  },
  {
    label: "自动探索",
    value: "AUTOMATIC_EXPLORATION"
  },
  {
    label: "稳步探索",
    value: "STEADY_EXPLORATION"
  }
]


/**
 * 腾讯新闻流量场景定向，当且仅当投放腾讯新闻流量时可以使用，功能灰度开放，[枚举详情]
 * 数组最小长度 1，最大长度 3
 *
 *
 * TENCENT_NEWS_APP
 * 腾讯新闻 APP，腾讯新闻 APP 内打开的场景
 * TENCENT_NEWS_WECHAT
 * 腾讯新闻微信插件，微信 APP 腾讯新闻插件内打开的场景
 * TENCENT_NEWS_QQ
 * 腾讯新闻手机 QQ 插件，手机 QQ APP 腾讯新闻插件内打开的场景
 */
export const Tencent_tencent_news = [
  {
    label: "腾讯新闻 APP，腾讯新闻 APP 内打开的场景",
    value: "TENCENT_NEWS_APP"
  },
  {
    label: "腾讯新闻微信插件，微信 APP 腾讯新闻插件内打开的场景",
    value: "TENCENT_NEWS_WECHAT"
  },
  {
    label: "腾讯新闻手机 QQ 插件，手机 QQ APP 腾讯新闻插件内打开的场景",
    value: "TENCENT_NEWS_QQ"
  }
]


/**
 * 展示场景，当且仅当投放移动联盟流量时可以使用，[枚举详情]
 * 数组最小长度 0，最大长度 32
 *
 *
 * DISPLAY_SCENE_BANNER
 * Banner
 * DISPLAY_SCENE_INLINE
 * 插屏
 * DISPLAY_SCENE_SPLASH
 * 开屏
 * DISPLAY_SCENE_NATIVE
 * 原生
 * DISPLAY_SCENE_REWARDED_VIDEO
 * 激励视频
 */
export const Tencent_display_scene = [
  {
    label: "Banner",
    value: "DISPLAY_SCENE_BANNER"
  },
  {
    label: "插屏",
    value: "DISPLAY_SCENE_INLINE"
  },
  {
    label: "开屏",
    value: "DISPLAY_SCENE_SPLASH"
  },
  {
    label: "原生",
    value: "DISPLAY_SCENE_NATIVE"
  },
  {
    label: "激励视频",
    value: "DISPLAY_SCENE_REWARDED_VIDEO"
  }
]


/**
 *
 *
 * QBSEARCH_SCENE_MOBILE
 * 移动 QQ 浏览器、应用宝等
 * QBSEARCH_SCENE_PC
 * PC QQ 浏览器等
 */
export const Tencent_qbsearch_scene  = [
  {
    label: "移动 QQ 浏览器、应用宝等",
    value: "QBSEARCH_SCENE_MOBILE"
  },
  {
    label: "PC QQ 浏览器等",
    value: "QBSEARCH_SCENE_PC"
  }
]


/**
 *
 * PC 端定投场景
 *
 * WECHAT_MOMENTS_PC 微信朋友圈 PC 端
 * WECHAT_APP_REWARDED_PC 小程序激励式营销 PC 端
 * WECHAT_MINI_PROGRAM_TABLE_PLAQUE_PC 小程序插屏营销 PC 端
 * WECHAT_APP_COVER_PC 小程序封面营销 PC 端
 * WECHAT_MINI_PROGRAM_NATIVE_TEMPLATE_PC 小程序原生模版 PC 端
 * WECHAT_PUBLIC_ACCOUNT_ARTICLE_MIDDLE_PC 公众号文章中部 PC 端
 * WECHAT_PUBLIC_ACCOUNT_ARTICLE_BOTTOM_PC 公众号文章底部 PC 端
 * PCAD_PC 腾讯平台与内容媒体 PC 端
 * UNION_PC 腾讯营销联盟电脑端
 * WECHAT_CHANNELS_PC 微信视频号电脑端
 * WECHAT_PUBLIC_ACCOUNT_BOX_PC 订阅号消息列表电脑端
 */
export const Tencent_pc_scene = [
  {
    label: "微信朋友圈 PC 端",
    value: "WECHAT_MOMENTS_PC"
  },
  {
    label: "小程序激励式营销 PC 端",
    value: "WECHAT_APP_REWARDED_PC"
  },
  {
    label: "小程序插屏营销 PC 端",
    value: "WECHAT_MINI_PROGRAM_TABLE_PLAQUE_PC"
  },
  {
    label: "小程序封面营销 PC 端",
    value: "WECHAT_APP_COVER_PC"
  },
  {
    label: "小程序原生模版 PC 端",
    value: "WECHAT_MINI_PROGRAM_NATIVE_TEMPLATE_PC"
  },
  {
    label: "公众号文章中部 PC 端",
    value: "WECHAT_PUBLIC_ACCOUNT_ARTICLE_MIDDLE_PC"
  },
  {
    label: "公众号文章底部 PC 端",
    value: "WECHAT_PUBLIC_ACCOUNT_ARTICLE_BOTTOM_PC"
  },
  {
    label: "腾讯平台与内容媒体 PC 端",
    value: "PCAD_PC"
  },
  {
    label: "腾讯营销联盟电脑端",
    value: "UNION_PC"
  },
  {
    label: "微信视频号电脑端",
    value: "WECHAT_CHANNELS_PC"
  },
  {
    label: "订阅号消息列表电脑端",
    value: "WECHAT_PUBLIC_ACCOUNT_BOX_PC"
  }
]


/**
 * WECHAT_SEARCH_SCENE_MOBILE
 * 移动微信搜一搜
 * WECHAT_SEARCH_SCENE_PC
 * PC 微信搜一搜
 */
export const Tencent_wechat_search_scene = [
  {
    label: "移动微信搜一搜",
    value: "WECHAT_SEARCH_SCENE_MOBILE"
  },
  {
    label: "PC 微信搜一搜",
    value: "WECHAT_SEARCH_SCENE_PC"
  }
]

/**
 *
 * MARKETING_TARGET_TYPE_APP_ANDROID
 * Android 应用
 * MARKETING_TARGET_TYPE_APP_IOS
 * iOS 应用
 * MARKETING_TARGET_TYPE_WECHAT_OFFICIAL_ACCOUNT
 * 微信公众号
 * MARKETING_TARGET_TYPE_PRODUCT
 * 教育产品
 * MARKETING_TARGET_TYPE_TRAFFIC
 * 汽车商品
 * MARKETING_TARGET_TYPE_LOCAL_STORE
 * 门店
 * MARKETING_TARGET_TYPE_WECHAT_MINI_GAME
 * 微信小游戏
 * MARKETING_TARGET_TYPE_CONSUMER_PRODUCT
 * 商品
 * MARKETING_TARGET_TYPE_WECHAT_CHANNELS
 * 视频号账号
 * MARKETING_TARGET_TYPE_WECHAT_CHANNELS_LIVE
 * 视频号直播
 * MARKETING_TARGET_TYPE_WECHAT_CHANNELS_LIVE_RESERVATION
 * 视频号直播预约
 * MARKETING_TARGET_TYPE_MINI_PROGRAM_WECHAT
 * 微信小程序
 * MARKETING_TARGET_TYPE_APP_QUICK_APP
 * 快应用
 * MARKETING_TARGET_TYPE_CONSUME_MEDICAL
 * 消费医疗
 * MARKETING_TARGET_TYPE_COMPREHENSIVE_HOUSEKEEPING
 * 家政服务
 * MARKETING_TARGET_TYPE_FICTION
 * 小说
 * MARKETING_TARGET_TYPE_SHORT_DRAMA
 * 短剧
 * MARKETING_TARGET_TYPE_AUDIOVISUAL_ENTERTAINMENT
 * 影音文娱产品
 * MARKETING_TARGET_TYPE_BEAUTY_AND_PERSONAL_CARE
 * 丽人服务
 * MARKETING_TARGET_TYPE_WEDDING_AND_PORTRAIT_PHOTOGRAPHY
 * 婚恋摄影产品
 * MARKETING_TARGET_TYPE_FRANCHISE_BRAND
 * 招商加盟
 * MARKETING_TARGET_TYPE_ENTERPRISE_SERVICES
 * 商务服务
 * MARKETING_TARGET_TYPE_EXHIBITION_BOOTH_DESIGN
 * 布景会展
 * MARKETING_TARGET_TYPE_INSURANCE
 * 保险产品
 * MARKETING_TARGET_TYPE_BANK
 * 银行产品
 * MARKETING_TARGET_TYPE_CREDIT
 * 信贷产品
 * MARKETING_TARGET_TYPE_INVESTMENT_CONSULTING
 * 投顾产品
 * MARKETING_TARGET_TYPE_REAL_ESTATE
 * 房产商品
 * MARKETING_TARGET_TYPE_TELECOMMUNICATIONS_OPERATOR
 * 运营商产品
 * MARKETING_TARGET_TYPE_TOURIST_ATTRACTIONS_TICKETS
 * 景点门票产品
 * MARKETING_TARGET_TYPE_RENOVATION_SERVICES
 * 装修服务
 * MARKETING_TARGET_TYPE_FURNITURE_AND_BUILDING_MATERIALS
 * 家具建材
 * MARKETING_TARGET_TYPE_EXHIBITION_SALES
 * 展会卖场
 * MARKETING_TARGET_TYPE_MEDICINE_INDUSTRY_COMMERCIAL
 * 两品一械商品
 * MARKETING_TARGET_TYPE_FINANCE
 * 金融产品
 * MARKETING_TARGET_TYPE_LOCAL_STORE_PACKAGE
 * 门店包
 * MARKETING_TARGET_TYPE_CATERING_AND_LEISURE
 * 餐饮服务
 * MARKETING_TARGET_TYPE_CHAIN_RESTAURANT
 * 连锁餐饮产品
 * MARKETING_TARGET_TYPE_COMMODITY_SET
 * 商品集合
 * MARKETING_TARGET_TYPE_TOURIST_TRAVEL_ROUTE
 * 旅行路线产品
 * MARKETING_TARGET_TYPE_TOURIST_CRUISE_LINE
 * 邮轮航线产品
 * MARKETING_TARGET_TYPE_TOURIST_HOTEL_SERVICE
 * 酒店服务产品
 * MARKETING_TARGET_TYPE_TOURIST_AIRLINE_TICKETS
 * 航司票务产品
 * MARKETING_TARGET_TYPE_LOCAL_STORE_COMBINE_WITH_PRODUCT
 * 门店产品组合
 * MARKETING_TARGET_TYPE_ACTIVITY
 * 活动
 * MARKETING_TARGET_TYPE_STORE
 * 平台店铺
 * MARKETING_TARGET_TYPE_MINI_GAME_QQ
 * QQ 小游戏
 * MARKETING_TARGET_TYPE_PC_GAME
 * PC 游戏
 * MARKETING_TARGET_TYPE_WECHAT_WORK
 * 企业微信
 * MARKETING_TARGET_TYPE_LIVE_STREAM_ROOM
 * 引流直播间
 * MARKETING_TARGET_TYPE_PERSONAL_STORE
 * 个人店铺
 * MARKETING_TARGET_TYPE_PLATFORM_CHANNEL
 * 平台频道
 * MARKETING_TARGET_TYPE_TWO_WHEEL_VEHICLE
 * 二轮车商品
 * MARKETING_TARGET_TYPE_GOVERNMENT_AFFAIRS
 * 政务
 * MARKETING_TARGET_TYPE_CAR_ECOLOGY
 * 汽车生态
 * MARKETING_TARGET_TYPE_WECHAT_STORE_PRODUCT
 * 微信小店商品
 * MARKETING_TARGET_TYPE_APP_HARMONY
 * 鸿蒙应用
 * MARKETING_TARGET_TYPE_WECHAT_STORE_PRODUCT_SET
 * 微信小店商品集合
 * MARKETING_TARGET_TYPE_PRODUCT_AGGREGATION_PAGE
 * 商品聚合页
 * MARKETING_TARGET_TYPE_WECHAT_STORE
 * 微信小店店铺
 * MARKETING_TARGET_TYPE_RESALE_AND_COMMERCIAL_LAND
 * 二手房和商业用地
 * MARKETING_TARGET_TYPE_VIDEO_PROGRAM
 * 影视节目产品
 * MARKETING_TARGET_TYPE_FUN_TEST
 * 趣味测试
 * MARKETING_TARGET_TYPE_MATERNITY_PARENTING
 * 母婴亲子
 * MARKETING_TARGET_TYPE_LEISURE_ENTERTAINMENT
 * 休闲娱乐
 * MARKETING_TARGET_TYPE_MEDICAL_INSTITUTION
 * 医疗机构
 * MARKETING_TARGET_TYPE_WECHAT_CHANNELS_ACTIVITY
 * 视频号活动
 */
export const Tencent_marketing_target_type = [
  {
    label: "Android 应用",
    value: "MARKETING_TARGET_TYPE_APP_ANDROID"
  },
  {
    label: "iOS 应用",
    value: "MARKETING_TARGET_TYPE_APP_IOS"
  },
  {
    label: "微信公众号",
    value: "MARKETING_TARGET_TYPE_WECHAT_OFFICIAL_ACCOUNT"
  },
  {
    label: "教育产品",
    value: "MARKETING_TARGET_TYPE_PRODUCT"
  },
  {
    label: "汽车商品",
    value: "MARKETING_TARGET_TYPE_TRAFFIC"
  },
  {
    label: "门店",
    value: "MARKETING_TARGET_TYPE_LOCAL_STORE"
  },
  {
    label: "微信小游戏",
    value: "MARKETING_TARGET_TYPE_WECHAT_MINI_GAME"
  },
  {
    label: "商品",
    value: "MARKETING_TARGET_TYPE_CONSUMER_PRODUCT"
  },
  {
    label: "视频号账号",
    value: "MARKETING_TARGET_TYPE_WECHAT_CHANNELS"
  },
  {
    label: "视频号直播",
    value: "MARKETING_TARGET_TYPE_WECHAT_CHANNELS_LIVE"
  },
  {
    label: "视频号直播预约",
    value: "MARKETING_TARGET_TYPE_WECHAT_CHANNELS_LIVE_RESERVATION"
  },
  {
    label: "微信小程序",
    value: "MARKETING_TARGET_TYPE_MINI_PROGRAM_WECHAT"
  },
  {
    label: "快应用",
    value: "MARKETING_TARGET_TYPE_APP_QUICK_APP"
  },
  {
    label: "消费医疗",
    value: "MARKETING_TARGET_TYPE_CONSUME_MEDICAL"
  },
  {
    label: "家政服务",
    value: "MARKETING_TARGET_TYPE_COMPREHENSIVE_HOUSEKEEPING"
  },
  {
    label: "小说",
    value: "MARKETING_TARGET_TYPE_FICTION"
  },
  {
    label: "短剧",
    value: "MARKETING_TARGET_TYPE_SHORT_DRAMA"
  },
  {
    label: "影音文娱产品",
    value: "MARKETING_TARGET_TYPE_AUDIOVISUAL_ENTERTAINMENT"
  },
  {
    label: "丽人服务",
    value: "MARKETING_TARGET_TYPE_BEAUTY_AND_PERSONAL_CARE"
  },
  {
    label: "婚恋摄影产品",
    value: "MARKETING_TARGET_TYPE_WEDDING_AND_PORTRAIT_PHOTOGRAPHY"
  },
  {
    label: "招商加盟",
    value: "MARKETING_TARGET_TYPE_FRANCHISE_BRAND"
  },
  {
    label: "商务服务",
    value: "MARKETING_TARGET_TYPE_ENTERPRISE_SERVICES"
  },
  {
    label: "布景会展",
    value: "MARKETING_TARGET_TYPE_EXHIBITION_BOOTH_DESIGN"
  },
  {
    label: "保险产品",
    value: "MARKETING_TARGET_TYPE_INSURANCE"
  },
  {
    label: "银行产品",
    value: "MARKETING_TARGET_TYPE_BANK"
  },
  {
    label: "信贷产品",
    value: "MARKETING_TARGET_TYPE_CREDIT"
  },
  {
    label: "投顾产品",
    value: "MARKETING_TARGET_TYPE_INVESTMENT_CONSULTING"
  },
  {
    label: "房产商品",
    value: "MARKETING_TARGET_TYPE_REAL_ESTATE"
  },
  {
    label: "运营商产品",
    value: "MARKETING_TARGET_TYPE_TELECOMMUNICATIONS_OPERATOR"
  },
  {
    label: "景点门票产品",
    value: "MARKETING_TARGET_TYPE_TOURIST_ATTRACTIONS_TICKETS"
  },
  {
    label: "装修服务",
    value: "MARKETING_TARGET_TYPE_RENOVATION_SERVICES"
  },
  {
    label: "家具建材",
    value: "MARKETING_TARGET_TYPE_FURNITURE_AND_BUILDING_MATERIALS"
  },
  {
    label: "展会卖场",
    value: "MARKETING_TARGET_TYPE_EXHIBITION_SALES"
  },
  {
    label: "两品一械商品",
    value: "MARKETING_TARGET_TYPE_MEDICINE_INDUSTRY_COMMERCIAL"
  },
  {
    label: "金融产品",
    value: "MARKETING_TARGET_TYPE_FINANCE"
  },
  {
    label: "门店包",
    value: "MARKETING_TARGET_TYPE_LOCAL_STORE_PACKAGE"
  },
  {
    label: "餐饮服务",
    value: "MARKETING_TARGET_TYPE_CATERING_AND_LEISURE"
  },
  {
    label: "连锁餐饮产品",
    value: "MARKETING_TARGET_TYPE_CHAIN_RESTAURANT"
  },
  {
    label: "商品集合",
    value: "MARKETING_TARGET_TYPE_COMMODITY_SET"
  },
  {
    label: "旅行路线产品",
    value: "MARKETING_TARGET_TYPE_TOURIST_TRAVEL_ROUTE"
  },
  {
    label: "邮轮航线产品",
    value: "MARKETING_TARGET_TYPE_TOURIST_CRUISE_LINE"
  },
  {
    label: "酒店服务产品",
    value: "MARKETING_TARGET_TYPE_TOURIST_HOTEL_SERVICE"
  },
  {
    label: "航司票务产品",
    value: "MARKETING_TARGET_TYPE_TOURIST_AIRLINE_TICKETS"
  },
  {
    label: "门店产品组合",
    value: "MARKETING_TARGET_TYPE_LOCAL_STORE_COMBINE_WITH_PRODUCT"
  },
  {
    label: "活动",
    value: "MARKETING_TARGET_TYPE_ACTIVITY"
  },
  {
    label: "平台店铺",
    value: "MARKETING_TARGET_TYPE_STORE"
  },
  {
    label: "QQ 小游戏",
    value: "MARKETING_TARGET_TYPE_MINI_GAME_QQ"
  },
  {
    label: "PC 游戏",
    value: "MARKETING_TARGET_TYPE_PC_GAME"
  },
  {
    label: "医疗机构",
    value: "MARKETING_TARGET_TYPE_MEDICAL_INSTITUTION"
  },
  {
    label: "视频号活动",
    value: "MARKETING_TARGET_TYPE_WECHAT_CHANNELS_ACTIVITY"
  }
]



/**
 * 动态创意类型
 *
 * DYNAMIC_CREATIVE_TYPE_COMMON
 * 手动指定
 * DYNAMIC_CREATIVE_TYPE_PROGRAM
 * 自动匹配
 */
export const Tencent_dynamic_creative_type = [
  {
    label: "手动指定",
    value: "DYNAMIC_CREATIVE_TYPE_COMMON"
  },
  {
    label: "自动匹配",
    value: "DYNAMIC_CREATIVE_TYPE_PROGRAM"
  }
]


/**
 * 版位验证模型
 * SITE_SET_VALIDATE_MODEL_ROLLBACK 版位回滚
 * SITE_SET_VALIDATE_MODEL_FILTER 版位过滤
 */
export const Tencent_site_set_validate_model = [
  {
    label: "版位回滚",
    value: "SITE_SET_VALIDATE_MODEL_ROLLBACK"
  },
  {
    label: "版位过滤",
    value: "SITE_SET_VALIDATE_MODEL_FILTER"
  }
]


/**
 * DELIVERY_MODE_COMPONENT
 * 组件化创意
 * DELIVERY_MODE_CUSTOMIZE
 * 自定义创意
 *
 */
export const Tencent_creative_delivery_mode = [
  {
    label: "组件化创意",
    value: "DELIVERY_MODE_COMPONENT"
  },
  {
    label: "自定义创意",
    value: "DELIVERY_MODE_CUSTOMIZE"
  }
]

// ======================== Label 辅助函数 ========================

/** 根据 value 从 options 数组中查找对应的 label */
function findLabel(options: Array<{ label: string; value: any }>, value: any): string {
  const item = options.find((opt) => opt.value === value);
  return item?.label ?? String(value ?? '');
}

export function getMarketingGoalLabel(value: any) { return findLabel(Tencent_marketing_goal, value); }
export function getMarketingSubGoalLabel(value: any) { return findLabel(Tencent_marketing_sub_goal, value); }
export function getMarketingCarrierTypeLabel(value: any) { return findLabel(Marketing_carrier_type, value); }
export function getOptimizationGoalLabel(value: any) { return findLabel(TencentOptimization_goal, value); }
export function getSiteSetLabel(value: any) { return findLabel(Tencnet_site_set, value); }
export function getMobileUnionLabel(value: any) { return findLabel(Tencent_mobile_union, value); }
export function getDeepConversionTypeLabel(value: any) { return findLabel(Tencent_deep_conversion_type, value); }
export function getDeepConversionWorthSpecGoalLabel(value: any) { return findLabel(Tencent_deep_conversion_worth_spec_goal, value); }
export function getBidModeLabel(value: any) { return findLabel(Tencent_bid_mode, value); }
export function getSmartBidTypeLabel(value: any) { return findLabel(Tencent_smart_bid_type, value); }
export function getAutoDerivedCreativeMethodTypeLabel(value: any) { return findLabel(Tencent_auto_derived_creative_method_type_list, value); }
export function getSearchExpandTargetingSwitchLabel(value: any) { return findLabel(Tencent_search_expand_targeting_switch, value); }
export function getBidSceneLabel(value: any) { return findLabel(Tencent_bid_scene, value); }
export function getConfiguredStatusLabel(value: any) { return findLabel(Tencent_configured_status, value); }
export function getEcomPkamSwitchLabel(value: any) { return findLabel(Tencent_ecom_pkam_switch, value); }
export function getCostConstraintSceneLabel(value: any) { return findLabel(Tencent_cost_constraint_scene, value); }
export function getShortPlayPayTypeLabel(value: any) { return findLabel(Tencent_short_play_pay_type, value); }
export function getDynamicAdTypeLabel(value: any) { return findLabel(Tencent_dynamic_ad_type, value); }
export function getSearchExpansionSwitchLabel(value: any) { return findLabel(Tencent_search_expansion_switch, value); }
export function getAdxRealtimeTypeLabel(value: any) { return findLabel(Tencent_adx_realtime_type, value); }
export function getSmartTargetingModeLabel(value: any) { return findLabel(Tencent_smart_targeting_mode, value); }
export function getSmartCouponModeLabel(value: any) { return findLabel(Tencent_smart_coupon_mode, value); }
export function getExplorationStrategyLabel(value: any) { return findLabel(Tencent_exploration_strategy, value); }
export function getTencentNewsLabel(value: any) { return findLabel(Tencent_tencent_news, value); }
export function getDisplaySceneLabel(value: any) { return findLabel(Tencent_display_scene, value); }
export function getQbsearchSceneLabel(value: any) { return findLabel(Tencent_qbsearch_scene, value); }
export function getPcSceneLabel(value: any) { return findLabel(Tencent_pc_scene, value); }
export function getWechatSearchSceneLabel(value: any) { return findLabel(Tencent_wechat_search_scene, value); }
export function getMarketingTargetTypeLabel(value: any) { return findLabel(Tencent_marketing_target_type, value); }
export function getDynamicCreativeTypeLabel(value: any) { return findLabel(Tencent_dynamic_creative_type, value); }
export function getSiteSetValidateModelLabel(value: any) { return findLabel(Tencent_site_set_validate_model, value); }
export function getCreativeDeliveryModeLabel(value: any) { return findLabel(Tencent_creative_delivery_mode, value); }

// ======================== 字段名 → Label 函数 Map ========================

/** 按字段名获取对应的 Label 转换函数 */
export const fieldLabelMap: Record<string, (value: any) => string> = {
  // Campaign level
  marketing_goal: getMarketingGoalLabel,
  marketing_sub_goal: getMarketingSubGoalLabel,
  marketing_carrier_type: getMarketingCarrierTypeLabel,
  optimization_goal: getOptimizationGoalLabel,
  bid_mode: getBidModeLabel,
  smart_bid_type: getSmartBidTypeLabel,
  bid_scene: getBidSceneLabel,
  configured_status: getConfiguredStatusLabel,
  search_expand_targeting_switch: getSearchExpandTargetingSwitchLabel,
  search_expansion_switch: getSearchExpansionSwitchLabel,
  ecom_pkam_switch: getEcomPkamSwitchLabel,
  cost_constraint_scene: getCostConstraintSceneLabel,
  short_play_pay_type: getShortPlayPayTypeLabel,
  dynamic_ad_type: getDynamicAdTypeLabel,
  adx_realtime_type: getAdxRealtimeTypeLabel,
  smart_targeting_mode: getSmartTargetingModeLabel,
  smart_coupon_mode: getSmartCouponModeLabel,
  exploration_strategy: getExplorationStrategyLabel,
  // marketing_asset_outer_spec nested
  marketing_target_type: getMarketingTargetTypeLabel,
  // deep_conversion_spec nested
  deep_conversion_type: getDeepConversionTypeLabel,
  deep_conversion_worth_spec_goal: getDeepConversionWorthSpecGoalLabel,
  // scene_spec nested
  display_scene: getDisplaySceneLabel,
  mobile_union: getMobileUnionLabel,
  tencent_news: getTencentNewsLabel,
  qbsearch_scene: getQbsearchSceneLabel,
  pc_scene: getPcSceneLabel,
  wechat_search_scene: getWechatSearchSceneLabel,
  priority_site_set: getSiteSetLabel,
  site_set: getSiteSetLabel,
  // auto_derived_creative_preference nested
  auto_derived_creative_method_type_list: getAutoDerivedCreativeMethodTypeLabel,
  // Adgroup level
  delivery_mode: getCreativeDeliveryModeLabel,
  dynamic_creative_type: getDynamicCreativeTypeLabel,
  site_set_validate_model: getSiteSetValidateModelLabel,
};
