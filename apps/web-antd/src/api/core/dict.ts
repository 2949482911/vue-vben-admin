import type { DictItem } from '@vben/stores';

import type { BatchOptions } from '#/api/models/core';
import type {
  DictDataItem,
  DictDataQuery,
  DictDataSaveRequest,
  DictTypeItem,
  DictTypeQuery,
  DictTypeSaveRequest,
} from '#/api/models/dict';
import type { PageResponse } from '#/api/models/marketing';

import { BaseApi } from '#/api/core/baseapi';
import { requestClient } from '#/api/request';

/**
 * 字典 API
 *
 * 后端前缀 /platform/dict；非微服务模式下 BaseApi 会去掉 /platform。
 * 运行时：all / data?code= / version
 * 管理：type/*、data/*
 */
class DictApi extends BaseApi {
  batchDataOptions(params: BatchOptions) {
    return requestClient.post(
      this.getServiceUrl('data/batch_options'),
      params,
    );
  }

  batchTypeOptions(params: BatchOptions) {
    return requestClient.post(
      this.getServiceUrl('type/batch_options'),
      params,
    );
  }

  checkTypeCode(code: string) {
    return requestClient.get<boolean>(this.getServiceUrl('type/check_code'), {
      params: { code },
    });
  }

  // ==================== 管理：字典类型 ====================

  fetchDataList(params: DictDataQuery): Promise<PageResponse<DictDataItem>> {
    return requestClient.get<PageResponse<DictDataItem>>(
      this.getServiceUrl('data/list'),
      { params },
    );
  }

  fetchTypeList(params: DictTypeQuery): Promise<PageResponse<DictTypeItem>> {
    return requestClient.get<PageResponse<DictTypeItem>>(
      this.getServiceUrl('type/list'),
      { params },
    );
  }

  /** 全部字典（登录后预加载） */
  getAllDicts() {
    return requestClient.get<Record<string, DictItem[]>>(
      this.getServiceUrl('all'),
    );
  }

  /** 按编码获取字典项（运行时） */
  getDict(code: string) {
    return requestClient.get<DictItem[]>(this.getServiceUrl('data'), {
      params: { code },
    });
  }

  // ==================== 管理：字典数据 ====================

  /** 字典版本号 */
  getVersion() {
    return requestClient.get<number>(this.getServiceUrl('version'));
  }

  saveData(data: DictDataSaveRequest) {
    return requestClient.post(this.getServiceUrl('data/save'), data);
  }

  saveType(data: DictTypeSaveRequest) {
    return requestClient.post(this.getServiceUrl('type/save'), data);
  }
}

export const dictApi: DictApi = new DictApi('/platform/dict');
