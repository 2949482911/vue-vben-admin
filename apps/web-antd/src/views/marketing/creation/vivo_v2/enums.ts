/**
 * vivo 2.0 枚举与选项
 *
 * 来源：vivo 开放平台-附录枚举值 https://open-ad.vivo.com.cn/doc?id=171
 * 1. xxx_ENUM / xxx_LABELS：码值 -> 文案（列表展示、逻辑判断用）
 * 2. xxx_OPTIONS：下拉选项（表单用）
 */

/** 通用判定标识 */
export const VIVO_V2_SWITCH_OPTIONS = [
  { label: '关闭', value: 0 },
  { label: '开启', value: 1 },
];

/** 删除标识 */
export const VIVO_V2_DELETED_LABELS: Record<string, string> = { '0': '未删除', '1': '删除' };

/** 暂停标识 */
export const VIVO_V2_PAUSE_LABELS: Record<string, string> = { '0': '未暂停', '1': '暂停' };

/** 创建来源 */
export const VIVO_V2_SOURCE_LABELS: Record<string, string> = { '0': '营销平台', '1': 'Marketing API' };

/** 推广目标 */
export const VIVO_V2_AD_TYPE_OPTIONS = [
  { label: '应用推广', value: 2 },
  { label: '普通网址', value: 1 },
  { label: '动态商品', value: 3 },
  { label: '快应用/快游戏', value: 8 },
  { label: '游戏预约', value: 9 },
  { label: '小程序', value: 11 },
];

/** 媒体类型（投放渠道） */
export const VIVO_V2_MEDIA_TYPE_OPTIONS = [
  { label: '应用商店', value: 0 },
  { label: '非应用商店', value: 1 },
  { label: '广告联盟', value: 2 },
];

/** 新版广告展现形式 */
export const VIVO_V2_PLACE_TYPE_OPTIONS = [
  { label: '信息流', value: 1 },
  { label: '开屏', value: 2 },
  { label: 'BANNER', value: 3 },
  { label: '插屏', value: 4 },
  { label: '原生', value: 5 },
  { label: '激励视频', value: 9 },
  { label: '推荐列表', value: 20 },
  { label: '搜索推广', value: 21 },
  { label: '首页banner', value: 30 },
];

/** 计划-推广链接 h5详情页来源 */
export const VIVO_V2_H5_TYPE_OPTIONS = [
  { label: '第三方落地页', value: 2 },
  { label: '悟空建站', value: 3 },
  { label: '自定义H5', value: 4 },
  { label: '金桔猫', value: 6 },
  { label: '一叶智能', value: 7 },
  { label: '商品URL', value: 12 },
];

/** 广告-落地页 h5详情页来源 */
export const VIVO_V2_AD_H5_TYPE_OPTIONS = [
  { label: '自定义URL/定制URL', value: 2 },
  { label: '悟空建站', value: 3 },
  { label: '自定义H5', value: 4 },
  { label: '商品URL', value: 12 },
];

/** 出价方式 */
export const VIVO_V2_CHARGE_TYPE_OPTIONS = [
  { label: 'CPM（按千次展示出价）', value: 1 },
  { label: 'CPC（按点击出价）', value: 2 },
  { label: 'CPD（按下载出价）', value: 4 },
  { label: '按万次唤醒出价', value: 6 },
  { label: '按转化目标出价', value: 99 },
];

/** 出价策略 */
export const VIVO_V2_BIDDING_STRATEGY_OPTIONS = [
  { label: '稳定拿量', value: 0 },
  { label: '优先拿量', value: 1 },
];

/** 无出价场景出价策略 */
export const VIVO_V2_NOBID_BIDDING_STRATEGY_OPTIONS = [
  { label: '尽量花完预算', value: 1 },
  { label: '控制成本上限', value: 2 },
];

/** 投放类型 */
export const VIVO_V2_SPENT_TYPE_OPTIONS = [
  { label: '快速投放', value: 1 },
  { label: '匀速投放', value: 2 },
];

/** 投放场景 */
export const VIVO_V2_DELIVERY_SCENE_OPTIONS = [
  { label: '常规投放', value: 0 },
  { label: '最大转化投放', value: 1 },
];

/** 通知形式 */
export const VIVO_V2_PUSH_FORM_OPTIONS = [
  { label: '通知栏', value: 0 },
  { label: '情景唤醒', value: 2 },
];

/** 计划类型 */
export const VIVO_V2_APPEAR_TYPE_OPTIONS = [
  { label: '展示广告', value: 0 },
  { label: '通知广告', value: 2 },
];

/** 应用智投 */
export const VIVO_V2_INTEL_AD_TYPE_OPTIONS = [
  { label: '普通投放', value: 0 },
  { label: '应用智投', value: 1 },
];

/** 通投智选 */
export const VIVO_V2_GENERAL_SWITCH_OPTIONS = [
  { label: '关闭', value: 0 },
  { label: '广告主开启', value: 1 },
];

/** 微信一键关注 */
export const VIVO_V2_WECHAT_FOLLOW_OPTIONS = [
  { label: '未开启', value: 0 },
  { label: '开启', value: 1 },
];

/** 选词模式 */
export const VIVO_V2_WORD_CHOICE_MODEL_OPTIONS = [
  { label: '搜索提词', value: 1 },
  { label: '优选词包', value: 2 },
];

/** 关键词匹配方式 */
export const VIVO_V2_MATCH_TYPE_OPTIONS = [
  { label: '智能匹配', value: 1 },
  { label: '精准匹配', value: 2 },
  { label: '短语匹配', value: 3 },
  { label: '宽泛匹配', value: 4 },
];

/** 关键词来源 */
export const VIVO_V2_WORD_SOURCE_OPTIONS = [
  { label: '用户添加', value: 1 },
  { label: '优质词', value: 2 },
  { label: '热门词', value: 3 },
  { label: '竞品词', value: 4 },
];

/** 地域停留类型 */
export const VIVO_V2_STAY_TYPE_OPTIONS = [
  { label: '常驻', value: 1 },
  { label: '当前', value: 2 },
];

/** 安装定向 */
export const VIVO_V2_INSTALLED_APP_OPTIONS = [
  { label: '不限', value: 1 },
  { label: '未安装', value: 2 },
  { label: '已安装', value: 3 },
];

/** 网络环境 */
export const VIVO_V2_NETWORK_OPTIONS = [
  { label: '不限', value: 1 },
  { label: 'WIFI', value: 2 },
  { label: '移动网络', value: 3 },
];

/** 安装行为 */
export const VIVO_V2_INSTALL_BEHAVIOR_OPTIONS = [{ label: '安装', value: 3 }];

/** 启动行为 */
export const VIVO_V2_START_BEHAVIOR_OPTIONS = [
  { label: '启动', value: 1 },
  { label: '未启动', value: 2 },
];

/** 安装行为时间范围 */
export const VIVO_V2_INSTALL_PERIOD_OPTIONS = [
  { label: '30天', value: 30 },
  { label: '180天', value: 180 },
  { label: '365天', value: 365 },
];

/** 启动行为时间范围 */
export const VIVO_V2_START_PERIOD_OPTIONS = [
  { label: '历史', value: -1 },
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '365天', value: 365 },
];

/** 广告创建方式 */
export const VIVO_V2_CREATIVE_SUPPLY_TYPE_OPTIONS = [
  { label: '普通创建', value: 0 },
  { label: '模板推送', value: 2 },
];

/** 标题是否商店优先 */
export const VIVO_V2_STORE_FIRST_OPTIONS = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
];

/** 批量投放模板（暂只实现基础模板，后续模板按需补充） */
export const VIVO_V2_MARKETING_TYPE = [{ label: '基础模板', value: 'base_template' }];

/** 广告组转化目标类型（计划/广告的「优化目标」「深度优化目标」共用） */
const CONVERSION_TARGET: Record<string, string> = {
  '1': '下载',
  '2': '游戏注册',
  '3': '新增激活',
  '4': '表单提交',
  '5': '自定义激活',
  '6': '自定义注册',
  '7': '添加到桌面',
  '8': '自定义次留',
  '9': '游戏付费',
  '12': '自定义付费',
  '13': '自定义拉活',
  '14': '网页购买',
  '15': '游戏预约',
  '16': '按钮点击',
  '17': '游戏ROI-广告变现',
  '18': '游戏ROI - 广告变现',
  '19': '游戏ROI-充值付费',
  '20': '游戏ROI - 充值付费',
  '22': '每次付费',
  '23': '快应用付费',
  '24': '安装完成',
  '25': '自定义授信',
  '27': '拉活自定义次留',
  '29': '微信-识别二维码',
  '30': '微信-添加微信',
  '31': '微信-用户首次消息',
  '32': '有效咨询',
  '33': '微信小游戏注册',
  '34': '微信小游戏付费',
  '36': '游戏首日付费',
  '48': '游戏ROI1-充值付费',
  '49': '游戏ROI1-广告变现',
  '51': '留存天数',
  '52': '快应用/快游戏ROI1-广告变现',
  '53': '拉活-自定义付费',
  '100': '普通激活',
  '101': '新增激活',
  '102': '自定义激活',
  '103': '自定义注册',
  '104': '自定义次留',
  '105': '游戏注册',
  '106': '自定义拉活',
  '107': '自定义付费',
  '109': '自定义授信',
  '110': '游戏付费',
  '111': '游戏ROI-充值付费',
  '113': '游戏ROI-广告变现',
  '115': '游戏首日付费',
  '126': '游戏ROI7-充值付费',
  '127': '下载',
  '128': '每次付费',
  '129': '游戏ROI1-广告变现',
  '130': '留存天数',
  '131': '游戏ROI1-充值付费',
};

/** 优化目标下拉选项（码值取自枚举文档「广告组转化目标类型」） */
export const VIVO_V2_CONVERSION_TARGET_OPTIONS = Object.entries(CONVERSION_TARGET).map(
  ([value, label]) => ({ label, value: Number(value) }),
);

/** 计划层级（ad/plan）枚举字典 */
export const VIVO_V2_CAMPAIGN_ENUMS: Record<string, Record<string, string>> = {
  /** 新版计划一级状态 */
  firstStatus: { '1': '已删除', '2': '未投放', '3': '启用中' },
  /** 新版计划二级状态 */
  secondStatus: {
    '0': '已暂停',
    '1': '账户余额不足',
    '2': '到达账户日预算',
    '3': '投放已结束',
    '4': '标的不可用',
    '5': '到达计划预算',
    '6': '未到投放日期',
    '7': '未到投放时段',
    '8': 'app部分异常',
    '9': '渠道包兜底中',
  },
  deleted: VIVO_V2_DELETED_LABELS,
  pauseState: VIVO_V2_PAUSE_LABELS,
  adType: Object.fromEntries(VIVO_V2_AD_TYPE_OPTIONS.map((o) => [o.value, o.label])),
  /** 推广模式 */
  promotionType: { '0': '常规投放', '1': '商品智投' },
  /** 流量自动选择 */
  autoSelect: { '0': '关闭', '1': '开启' },
  generalSwitch: { '0': '关闭', '1': '广告主开启' },
  intelAdType: { '0': '普通投放', '1': '应用智投' },
  wechatFollow: { '0': '未开启', '1': '开启' },
  autoExtension: { '0': '关闭', '1': '开启' },
  h5Type: {
    '1': 'H5Code（已作废）',
    '2': '第三方落地页',
    '3': '悟空建站',
    '4': '自定义H5',
    '6': '金桔猫商品落地页',
    '7': '一叶智能',
    '12': '商品URL',
  },
  chargeType: {
    '1': 'CPM',
    '2': 'CPC',
    '4': 'CPD',
    '6': '按万次唤醒出价',
    '99': '按转化目标出价',
  },
  pushForm: { '0': '通知栏', '2': '情景唤醒' },
  appearType: { '0': '展示广告', '2': '通知广告' },
  biddingStrategy: { '0': '稳定拿量', '1': '优先拿量' },
  nobidBiddingStrategy: { '1': '尽量花完预算', '2': '控制成本上限' },
  spentType: { '1': '快速投放', '2': '匀速投放' },
  stayType: { '1': '常驻', '2': '当前' },
  installedApp: { '1': '不限', '2': '未安装', '3': '已安装' },
  network: { '1': '不限', '2': 'WIFI', '3': '移动网络' },
  sourceType: VIVO_V2_SOURCE_LABELS,
  wordChoiceModel: { '1': '搜索提词', '2': '优选词包' },
  cvType: CONVERSION_TARGET,
  secondCvType: CONVERSION_TARGET,
};

/** 广告层级（ad/ad）枚举字典 */
export const VIVO_V2_ADGROUP_ENUMS: Record<string, Record<string, string>> = {
  /** 新版广告一级状态 */
  firstStatus: { '1': '已删除', '3': '未投放', '4': '投放中' },
  /** 新版广告二级状态 */
  secondStatus: { '0': '已暂停', '1': '计划不可投' },
  deleted: VIVO_V2_DELETED_LABELS,
  pauseState: VIVO_V2_PAUSE_LABELS,
  sourceType: VIVO_V2_SOURCE_LABELS,
  creativeSupplyType: { '0': '普通创建', '2': '模板推送' },
  h5Type: { '2': '自定义URL/定制URL', '3': '悟空建站' },
};
