/**
 * 报表维度：英文字段名 ↔ 后端返回的中文列名。
 *
 * 后端 `needCname` 默认开启，会把响应里 columns / items 的列名翻译成中文
 * （维度走 Dimension.dimsCname，指标走 Metric.cname），而响应里的 cname 字段
 * 只包含「指标」的中英映射，维度反查不回来 —— 所以这里镜像一份后端定义。
 *
 * 注意两点：
 * 1. 不要复用 constants/locales 里的 DIMS：那是查询下拉的文案（「平台维度」「天」），
 *    和后端列名（「平台」「日期」）不是一套，拿它反查会失配。
 * 2. 名称类关联维度（advertiserName / editorName 等）只有在被登记进关联维度时才会被翻译，
 *    实际返回可能是中文也可能是英文，所以下面两个方法都做了双向兼容。
 */
export const DIM_COLUMN_NAMES: Record<string, string> = {
  day: '日期',
  hour: '小时',
  week: '周',
  month: '月',
  year: '年',
  platform: '平台',
  platform_account_id: '广告主',
  creative_id: '创意ID',
  campaign_id: '计划ID',
  adgroup_id: '广告组ID',
  promotion_id: '推广计划ID',
  projectId: '项目ID',
  saleId: '销售ID',
  tagId: '标签ID',
  createdBy: '优化师ID',
  org_id: '部门ID',
  material_id: '本地素材ID',
  editor_id: '剪辑师ID',
  advertiserName: '广告主名字',
  creativeName: '创意名字',
  campaignName: '计划名字',
  adgroupName: '广告组名字',
  promotionName: '推广计划名字',
  projectName: '项目名字',
  saleName: '销售名字',
  tagName: '标签名字',
  createUsername: '优化师',
  orgName: '部门',
  materialName: '素材名称',
  editorName: '剪辑师',
};

const DIM_FIELD_BY_LABEL = new Map(
  Object.entries(DIM_COLUMN_NAMES).map(([field, label]) => [label, field]),
);

/** 列 key 对应的英文字段名；列名已是中文时反查回英文，本来就是英文则原样返回 */
export function rawDimFieldOf(key: string): string {
  return DIM_FIELD_BY_LABEL.get(key) ?? key;
}

/** 英文字段名在行数据里的实际 key：该维度被翻译过就用中文列名，否则用英文字段名 */
export function dimColumnKey(field: string, columns: string[]): string {
  const label = DIM_COLUMN_NAMES[field];
  return label && columns.includes(label) ? label : field;
}
