import { requestClient } from '#/api/request';
import { BaseApi } from '#/api/core/baseapi';
import type {
  MaterialAnalysisQuery,
  MaterialAnalysisItem,
  MaterialOverview,
  LifecycleDistribution,
  MaterialCompareItem,
} from '#/api/models/material_analysis';
import type { PageResponse } from '#/api/models/marketing';

/**
 * 素材智能分析 API
 *
 * 后端服务前缀：/platform/material_analysis
 * 需要后端配合实现以下接口：
 * - GET  /platform/material_analysis/list          素材效果列表
 * - GET  /platform/material_analysis/overview       素材概览统计
 * - GET  /platform/material_analysis/lifecycle      生命周期分布
 * - POST /platform/material_analysis/compare        素材对比
 * - POST /platform/material_analysis/tag            添加标签
 * - POST /platform/material_analysis/tag/batch      批量打标签
 */
class MaterialAnalysisApi extends BaseApi {
  /** 素材效果列表 */
  fetchList(
    params: MaterialAnalysisQuery,
  ): Promise<PageResponse<MaterialAnalysisItem>> {
    return requestClient.get<PageResponse<MaterialAnalysisItem>>(
      this.getServiceUrl('list'),
      { params },
    );
  }

  /** 素材概览统计 */
  fetchOverview(params: {
    platform?: string;
    dateRange?: [string, string];
  }): Promise<MaterialOverview> {
    return requestClient.get<MaterialOverview>(
      this.getServiceUrl('overview'),
      { params },
    );
  }

  /** 生命周期分布 */
  fetchLifecycle(params: {
    platform?: string;
    dateRange?: [string, string];
  }): Promise<LifecycleDistribution> {
    return requestClient.get<LifecycleDistribution>(
      this.getServiceUrl('lifecycle'),
      { params },
    );
  }

  /** 素材对比 */
  fetchCompare(params: {
    materialIds: string[];
    dateRange: [string, string];
  }): Promise<MaterialCompareItem[]> {
    return requestClient.post<MaterialCompareItem[]>(
      this.getServiceUrl('compare'),
      params,
    );
  }

  /** 添加标签 */
  fetchAddTag(params: {
    materialId: string;
    tag: string;
    group?: string;
  }) {
    return requestClient.post(this.getServiceUrl('tag'), params);
  }

  /** 批量打标签 */
  fetchBatchTag(params: {
    materialIds: string[];
    tags: string[];
    group?: string;
  }) {
    return requestClient.post(this.getServiceUrl('tag/batch'), params);
  }
}

export const materialAnalysisApi: MaterialAnalysisApi =
  new MaterialAnalysisApi('/platform/material_analysis');
