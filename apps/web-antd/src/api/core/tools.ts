import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from "#/api/request";
import type {CreateSystemMetric, GetDownloadCenterItem} from "#/api/models/tools";

/**
 * 穿山甲商品
 */
class PangolinApi extends BaseApi {
  fetchPangolinProducts(params: CreateSystemMetric) {
    return requestClient.post(this.getServiceUrl("csjp/product/search"), params)
  }
}

export const pangolinApi = new PangolinApi("/csjp");
/**
 * 工具-下载中心获取列表数据
 */
class DownloadCenterApi extends BaseApi {
  fetchDownloadList(params: GetDownloadCenterItem) {
    return requestClient.get(this.getServiceUrl("list"), {params})
  }
}

export const downloadCenterApi = new DownloadCenterApi("/platform/download_center");
