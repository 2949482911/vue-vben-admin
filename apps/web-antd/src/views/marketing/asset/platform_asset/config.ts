import type { Component } from 'vue';

import type { PlatformAssetQueryField } from './types';

import type { PlatformAssetType } from '#/api/models/platform_asset';

import AwemeAsset from './bytedance/AwemeAsset.vue';
import ProductAsset from './bytedance/ProductAsset.vue';
import ProductLibraryAsset from './bytedance/ProductLibraryAsset.vue';

export interface MediaAssetTypeConfig {
  component: Component;
  key: PlatformAssetType;
  label: string;
  /** 该资产类型额外的查询字段，由页面统一渲染 */
  queryFields?: PlatformAssetQueryField[];
}

export interface MediaAssetConfig {
  /** 后端 platform 值 */
  key: string;
  label: string;
  /** 该媒体当前支持的资产类型与展示组件 */
  types: MediaAssetTypeConfig[];
}

/**
 * 媒体资产配置
 * 新增媒体时在此追加一项，并在对应媒体目录下补资产类型组件即可。
 */
export const MEDIA_ASSET_CONFIG: MediaAssetConfig[] = [
  {
    key: 'bytedance',
    label: '巨量引擎',
    types: [
      {
        key: 'aweme',
        label: '抖音号',
        component: AwemeAsset,
        queryFields: [
          {
            key: 'authStatus',
            label: '授权状态',
            type: 'select',
            options: [
              { label: 'AUTHRIZED', value: 'AUTHRIZED' },
              { label: 'AUTHRIZING', value: 'AUTHRIZING' },
              { label: 'INVALID', value: 'INVALID' },
            ],
          },
        ],
      },
      {
        key: 'product_library',
        label: '商品库',
        component: ProductLibraryAsset,
      },
      { key: 'product', label: '商品', component: ProductAsset },
    ],
  },
];
