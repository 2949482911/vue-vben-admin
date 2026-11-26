export interface AutoProxySupportedAsset {
  code: string;
  label: string;
  matchMethod: string;
  matchRule: string;
  required: boolean;
  scope: 'local' | 'media' | string;
  step: number;
}

export interface AutoProxyAssetMode {
  assets: AutoProxySupportedAsset[];
  chain: string[];
  platform: string;
  platformMode: string;
}

export interface AutoProxyAdsTaskQuery {
  labelId?: string;
  name?: string;
  page?: number;
  pageSize?: number;
  platform?: string;
  platformMode?: string;
  taskStatus?: string;
}

export interface AutoProxyAdsTaskItem {
  aiHosting?: Record<string, any>;
  createTime?: string;
  createUsername?: string;
  creationTemplateId?: number | string;
  id: number | string;
  labelIds?: Array<number | string>;
  labelNames?: string[];
  lastExecuteStatus?: string;
  lastExecuteTime?: string;
  localAsset?: Record<string, any>[];
  mediaAsset?: Record<string, any>[];
  name: string;
  nextExecuteTime?: string;
  platform: string;
  platformMode?: string;
  projectId?: number | string;
  projectName?: string;
  remark?: string;
  runSetting?: Record<string, any>;
  taskStatus: 'archived' | 'draft' | 'enabled' | 'paused' | string;
  updateTime?: string;
  updateUsername?: string;
}

export interface AutoProxyAdsTaskListResult {
  items: AutoProxyAdsTaskItem[];
  page?: number;
  pageSize?: number;
  summary?: {
    draftCount?: number;
    enabledCount?: number;
    pausedCount?: number;
    totalCount?: number;
  };
  total: number;
}

export interface AutoProxyCreateTaskRequest {
  aiHosting: Record<string, any>;
  labelIds: Array<number | string>;
  localAsset: Record<string, any>[];
  mediaAsset: Record<string, any>[];
  name: string;
  platform: string;
  platformMode: string;
  projectId: number | string;
  remark: string;
  runSetting: Record<string, any>;
}

export interface AutoProxyCampaignCardRequest {
  labelIds: Array<number | string>;
  localAsset?: Record<string, any>[];
  mediaAsset?: Record<string, any>[];
  platform: string;
  platformMode: string;
  projectId?: number | string;
  taskId?: number | string;
}

export interface AutoProxyMatchedAsset {
  assetId: string;
  assetName: string;
  assetType: string;
  localId?: number | string;
  payload?: Record<string, any>;
}

export interface AutoProxyAssetBlocker {
  code: string;
  message: string;
  targetId?: null | string;
  targetType?: null | string;
}

export interface AutoProxyAssetMatchResult {
  assets: AutoProxyMatchedAsset[];
  blockers: AutoProxyAssetBlocker[];
  /** 命中资产数量，未命中为 0 */
  count?: number;
  message?: string;
  success: boolean;
}

export interface AutoProxyCampaignCardLabel {
  blockers: AutoProxyAssetBlocker[];
  counts: Record<string, number>;
  labelId: number | string;
  labelName: string;
  localAssets: Record<string, AutoProxyAssetMatchResult>;
  mediaAssets: Record<string, AutoProxyAssetMatchResult>;
}

export interface AutoProxyCampaignCardResponse {
  blockerCount: number;
  labels: AutoProxyCampaignCardLabel[];
  platform: string;
  platformMode: string;
  supportedAssets: AutoProxySupportedAsset[];
  totals: Record<string, number>;
}

export interface AutoProxyExecuteRequest {
  labelIds?: Array<number | string>;
  taskId: number | string;
}

export interface AutoProxyExecuteItem {
  advertiserIds?: string[];
  batchTaskId?: number | string;
  /** 回填资产后的策略组配置 JSON 地址 */
  configArea?: string;
  detailId?: number | string;
  /** success / failed / blocked */
  detailStatus: string;
  /** 资产回填后的广告 JSON 地址 */
  fullParamsData?: string;
  labelId: number | string;
  labelName: string;
  message?: string;
  totalAdCount?: number;
}

export interface AutoProxyExecuteResponse {
  executeStatus: string;
  executeTime?: string;
  items: AutoProxyExecuteItem[];
  nextExecuteTime?: string;
  taskId: number | string;
}

