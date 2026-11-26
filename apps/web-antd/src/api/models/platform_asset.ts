import type { PageRequestParams } from '#/api/models/core';

export type PlatformAssetType = 'aweme' | 'product' | 'product_library';

/** 巨量媒体资产（三类资产字段并集，按 assetType 取用） */
export interface PlatformAssetItem {
  id: string;
  platform: string;
  assetType: PlatformAssetType;
  accountId?: string;
  accountName?: string;
  assetId: string;
  assetName: string;
  labelIds?: Array<number | string>;
  labelNames?: string[];

  /* 抖音号 */
  awemeUserType?: string;
  authType?: string;
  authStatus?: string;
  shareType?: string;
  subStatus?: string;
  authScenarios?: string[];
  startTime?: string;
  endTime?: string;
  authAutoExpireDate?: string;
  note?: string;
  openId?: string;
  videoInfo?: Record<string, any>;

  /* 商品库 */
  storeType?: number | string;
  backupImages?: string[];
  source?: number | string;
  accountType?: number | string;
  historyAccountId?: string;
  historyAccountType?: number | string;
  platformCreateTime?: string;
  platformModifyTime?: string;

  /* 商品 */
  categoryId?: string;
  brandId?: string;
  productStatus?: number | string;
  auditStatus?: number | string;
  type?: number | string;
  completionStatus?: number | string;
  title?: string;
  description?: string;
  imageUrl?: string;
  imagesUrl?: string[];
  videoUrl?: string;
  videos?: any[];
  stock?: number;
  priceInfo?: Record<string, any>;
  outerId?: string;
  spuId?: string;
  hasVideo?: boolean;
  reason?: string;
}

export interface PlatformAssetQueryParams extends PageRequestParams {
  platform: string;
  assetType: PlatformAssetType;
  assetId?: string;
  assetName?: string;
  /** 各资产类型的扩展筛选字段（二迭代后端补齐） */
  [key: string]: any;
}

export interface PlatformAssetBatchLabelRequest {
  platform: string;
  assetType: PlatformAssetType;
  /** 列表行的本地记录 ID（非媒体资产 assetId，同一 assetId 可能对应多账户多行） */
  ids: string[];
  labelIds: Array<number | string>;
  reason?: string;
}

export interface PlatformAssetBatchLabelResultItem {
  /** 本地记录 ID，用于回匹配列表行 */
  id: string;
  assetId: string;
  success: boolean;
  code?: number;
  message?: string;
}

export interface PlatformAssetBatchLabelResult {
  taskId?: number | string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  taskStatus?: number;
  items?: PlatformAssetBatchLabelResultItem[];
}
