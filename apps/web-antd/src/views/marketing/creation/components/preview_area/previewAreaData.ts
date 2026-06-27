export interface PreviewColumn {
  field?: string;
  title: string;
  width?: string | number;
  minWidth?: string | number;
  fixed?: 'left' | 'right';
  // 子列配置（用于多级表头）
  children?: PreviewColumn[];
  // 自定义插槽
  slots?: Record<string, any>;
}


/**
 * 层级配置项接口
 */
export interface LevelConfig {
  /** 是否显示该层级的统计信息 */
  show?: boolean;
  /** 该层级的显示名称（如：任务、营销单元） */
  labelName?: string;
}

/**
 * 层级名称配置接口
 */
export interface LevelNames {
  /** 计划层级配置 */
  campaign?: LevelConfig;
  /** 广告组层级配置 */
  adgroup?: LevelConfig;
  /** 广告层级配置 */
  promotion?: LevelConfig;
}


/**
 * 账户Tab数据接口
 */
export interface AccountTabData {
  advertiserId: string;
  advertiserName: string;
  campaignCount: number;
  adgroupCount: number;
  promotionCount: number;
  // 扁平化后的行数据
  flattenedRows: any[];
}
