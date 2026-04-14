/**
 * 媒体平台枚举
 */
export enum Platform {
  ALIPAY = 'alipay',
  BYTEDANCE = 'bytedance',
  HUAWEI = 'huawei',
  JD = 'jd',
  JDKJ = 'jdkj', // 京东科技
  KUAKE = 'kuake',
  OPPO = 'oppo',
  VIVO = 'vivo',
  XMLY = "xmly",
  HONOR = "honor",
  KUAISHOU = "kuaishou",
  BAIDU = "baidu",
  NETEASE = "netease",
  JD_GYX = "jdgyx",
  TB = "tb",
  REDNOTE = "rednote",
  TB_UNION = "tb_union",
  QWEN = "qwen",
  CSJP = "csjp",
  NBY = "nubia",
  GYXHW = "gyx_huawei",
  TBSG = "tb_shangou",
  GYXOPPO = "gyx_oppo",
  QUTOUTIAO = "qutoutiao",
  HUAWEI_STORE = "huawei_store",
  TENCENT = "tencent",
  DOUYIN = "douyin",
  MEITUAN = "meituan",
  OPPO_PUSH = 'oppo_push',
  XIANYU = 'xianyu',
  DY_DULIDUAN = 'dy_duliduan',
  YOUKU = 'youku',
  KUAIZUANKE = 'kuaizuanke',
  XIANYU_DHH = 'xianyu_dhh',
  HUICHUAN = 'huichuan'
}

export enum RuleType {
  IMMEDIATELY = 'immediately'
}


// 计划生成规则
export enum CampaignRuleKey {
  targeting = "targeting", // 定向包
  creative = "creative", // 创意
  title = "title", // 标题包
  custom = "custom", // 自定义
}


// 广告生成规则
export enum AdRuleKey {
  creative = "creative", // 创意
  title = "title", // 标题包
  custom = "custom", //自定义
}

export enum DistributionMode{
  all = "all", // 全部
  account = "account" // 账户分配
}

