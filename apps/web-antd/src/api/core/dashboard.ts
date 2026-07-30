import { requestClient } from '#/api/request';
import { BaseApi } from '#/api/core/baseapi';
import type {
  RepresentativeItem,
  RepresentativeSearchParams,
  DashboardQueryParams,
  OverviewMetrics,
  TrendDataPoint,
  PlatformCompareItem,
  AccountTopItem,
  MaterialRankItem,
  AlertQueryParams,
  AlertListResponse,
} from '#/api/models';

// ==================== BPM 待办任务（原有，保持不变） ====================

class TaskApi extends BaseApi {
  fetchRepresentative(
    params: RepresentativeSearchParams,
  ): Promise<RepresentativeItem[]> {
    return requestClient.get<RepresentativeItem[]>(
      this.getServiceUrl('representative'),
      {params},
    );
  }

  fetchDoneRepresentative(
    params: RepresentativeSearchParams,
  ): Promise<RepresentativeItem[]> {
    return requestClient.get<RepresentativeItem[]>(
      this.getServiceUrl('done_representative'),
      {params},
    );
  }
}

export const taskApi: TaskApi = new TaskApi('/sys/task');

// ==================== 统一数据看板（新增） ====================

/**
 * 统一数据看板 API
 *
 * 后端服务前缀：/platform/dashboard
 * 需要后端配合实现以下接口：
 * - GET  /platform/dashboard/overview          核心指标概览
 * - GET  /platform/dashboard/trend              消耗趋势
 * - GET  /platform/dashboard/platform_compare   平台对比
 * - GET  /platform/dashboard/account_top        账户排行
 * - GET  /platform/dashboard/material_rank      素材排行
 * - GET  /platform/dashboard/alerts             告警列表
 */
class DashboardDataApi extends BaseApi {
  /** 核心指标概览 */
  fetchOverview(
    data: DashboardQueryParams,
  ): Promise<OverviewMetrics> {
    return requestClient.post<OverviewMetrics>(
      this.getServiceUrl('dashboard/overviewew'),
      data,
    );
  }

  /** 消耗趋势（按天） */
  fetchTrend(
    data: DashboardQueryParams,
  ): Promise<TrendDataPoint[]> {
    return requestClient.post<TrendDataPoint[]>(
      this.getServiceUrl('dashboard/trend'),
      data
    );
  }

  /** 平台对比 */
  fetchPlatformCompare(
    data: DashboardQueryParams,
  ): Promise<PlatformCompareItem[]> {
    return requestClient.post<PlatformCompareItem[]>(
      this.getServiceUrl('dashboard/platform_compare'),
      data
    );
  }

  /** 账户排行 Top N */
  fetchAccountTop(
    data: DashboardQueryParams & { topN?: number },
  ): Promise<AccountTopItem[]> {
    return requestClient.post<AccountTopItem[]>(
      this.getServiceUrl('dashboard/account_top'),
      data,
    );
  }

  /** 素材排行 Top N */
  fetchMaterialRank(
    params: DashboardQueryParams & { topN?: number },
  ): Promise<MaterialRankItem[]> {
    return requestClient.get<MaterialRankItem[]>(
      this.getServiceUrl('dashboard/material_rank'),
      { params },
    );
  }

  /** 告警列表 */
  fetchAlerts(
    params: AlertQueryParams,
  ): Promise<AlertListResponse> {
    return requestClient.get<AlertListResponse>(
      this.getServiceUrl('dashboard/alerts'),
      { params },
    );
  }
}

export const dashboardApi: DashboardDataApi =
  new DashboardDataApi('/platform/report');
