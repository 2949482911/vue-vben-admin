import type { PageResponse } from '#/api/models/marketing';
import type {
  PlatformAssetBatchLabelRequest,
  PlatformAssetBatchLabelResult,
  PlatformAssetItem,
  PlatformAssetQueryParams,
} from '#/api/models/platform_asset';

import { requestClient } from '#/api/request';

/**
 * 媒体资产（首批巨量）
 *
 * 后端路由不带 /platform 前缀：/platform_asset/list、/platform_asset/batch_label
 */
class PlatformAssetApi {
  /** 批量覆盖本地标签（labelIds=[] 表示清空） */
  fetchBatchLabel(data: PlatformAssetBatchLabelRequest) {
    return requestClient.post<PlatformAssetBatchLabelResult>(
      '/platform_asset/batch_label',
      data,
    );
  }

  /** 媒体资产列表 */
  fetchList(
    params: PlatformAssetQueryParams,
  ): Promise<PageResponse<PlatformAssetItem>> {
    return requestClient.get<PageResponse<PlatformAssetItem>>(
      '/platform_asset/list',
      { params },
    );
  }
}

export const platformAssetApi = new PlatformAssetApi();
