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
