import type { AutoProxySupportedAsset } from '#/api/models/auto_proxy_ads';

export interface AssetCommonProps {
  asset: AutoProxySupportedAsset;
  platform: string;
  platformMode: string;
  projectId: string;
  tagIds: string[];
  tagNames: string[];
}

export interface AccountAssetConfig {
  accountAge: string;
  accountLimit: number;
  accountMinBalance: number;
  accountMode: 'auto' | 'manual';
  accountSelected: string[];
  accountStatus: string;
  accountStrategy: string;
}

export interface StrategyAssetConfig {
  strategyGroup: string;
  strategyMode: 'group' | 'tag';
  strategyRule: string;
}

export interface MaterialAssetConfig {
  materialCreated: string;
  materialDedupe: boolean;
  materialFolders: string[];
  materialFormat: string;
  materialSelected: string[];
  materialTotal: number;
  materialType: string;
}

export interface MediaAssetConfig {
  expire: string;
  manual: string[];
  mode: 'manual' | 'tag';
  randomCount: number;
}

export interface TagAssetConfig {
  mode: 'manual' | 'tag';
  selected: string[];
}
