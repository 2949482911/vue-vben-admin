import {BaseApi} from "#/api/core/baseapi";
import type {
  AdReportRequest,
  AdReportResponse,
  AdvertiserItem,
  AdvertiserPageRequest,
  AuthAdvertiserRequest, CreateAdvertiserRequest,
  CreateDeveloperRequest, CreateSystemMetric,
  DeveloperItem,
  DeveloperPageRequest, MetricItem,
  SystemMetricPageRequest, UpdateAdvertiserRequest, UpdateDeveloperRequest, UpdateMetric
} from "#/api/models/marketing";
import {requestClient} from "#/api/request";
import type {BatchOptions} from "#/api/models/core";


/**
 * 开发者
 */
class DeveloperApi extends BaseApi {
  fetchDeveloperList(params: DeveloperPageRequest) {
    return requestClient.get<DeveloperItem>(this.getServiceUrl("list"), {params: params})
  }

  fetchCreateDeveloper(params: CreateDeveloperRequest) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  fetchUpdateDeveloper(params: UpdateDeveloperRequest) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}

export const developerApi = new DeveloperApi("/platform/developer");


/**
 * 账户
 */
class AdvertiserApi extends BaseApi {

  /**
   * 获取授权链接
   * @param params
   */
  fetchAuthUrl(params: AuthAdvertiserRequest) {
    return requestClient.get(this.getServiceUrl("auth_url"), {params: params})
  }

  fetchAdvertiserList(params: AdvertiserPageRequest) {
    return requestClient.get<AdvertiserItem>(this.getServiceUrl("list"), {params: params})
  }

  fetchCreateAdvertiser(params: CreateAdvertiserRequest) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  fetchUpdateAdvertiser(params: UpdateAdvertiserRequest) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }


  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }

}

export const advertiserApi = new AdvertiserApi("/platform/advertiser");


// 指标接口

class MetricApi extends BaseApi {

  fetchCreateSystemMetric(params: CreateSystemMetric) {
    return requestClient.post(this.getServiceUrl("create_system_metric"), params)
  }


  fetchCreateMetric(params: CreateSystemMetric) {
    return requestClient.post(this.getServiceUrl("create_metric"), params)
  }

  fetchUpdateMetric(params: UpdateMetric) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }


  fetchSystemMetricList(params: SystemMetricPageRequest) {
    return requestClient.get<MetricItem>(this.getServiceUrl("system_metric_list"), {
      params
    })
  }


  /**
   * 获取查询指标列表
   */
  fetchMetric() {
    return requestClient.get<MetricItem>(this.getServiceUrl("query_metric"))
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch",), params)
  }

}

export const metricApi = new MetricApi("/platform/metric");


/**
 * report data
 */
class ReportApi extends BaseApi {
  fetchAdReport(params: AdReportRequest) {
    return requestClient.post<AdReportResponse>(this.getServiceUrl("adreport"), params)
  }
}


export const reportApi = new ReportApi("/platform/report");
