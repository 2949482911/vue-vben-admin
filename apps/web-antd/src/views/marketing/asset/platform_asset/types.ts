import type { VxeGridProps } from '#/adapter/vxe-table';
import type { PlatformAssetItem } from '#/api/models/platform_asset';

export interface PlatformAssetFilters {
  assetId?: string;
  assetName?: string;
  [key: string]: any;
}

export interface PlatformAssetQueryOption {
  label: string;
  value: number | string;
}

/** 各资产类型可自行追加的查询字段（由类型配置传入页面） */
export interface PlatformAssetQueryField {
  /** 请求参数名 */
  key: string;
  label: string;
  placeholder?: string;
  options?: PlatformAssetQueryOption[];
  /** 默认 input */
  type?: 'input' | 'select';
}

export type PlatformAssetColumns = NonNullable<
  VxeGridProps<PlatformAssetItem>['columns']
>;
