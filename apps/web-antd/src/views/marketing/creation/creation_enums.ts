/**
 * 分配方式
 */
export enum RuleMethod {
  ALL = "all",
  CUSTOM = "custom",
  AVG = "avg",
  // 账户分配
  ACCOUNT = "account",

  //
  MANUAL = "manual",
  OCPX = "ocpx"
}


// 分配策略
export enum RuleKey {
  TARGET = "targeting",
  CREATIVE = "creative",
  CREATIVE_GROUP = "creative_group"
}
