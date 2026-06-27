import { requestClient } from "#/api/request";
import { BaseApi } from "#/api/core/baseapi";
import type {
  MainBodyComboCreateRequest,
  MainBodyComboPageItem,
  MainBodyComboPageRequest,
  MainBodyComboUpdateRequest,
  MainBodyCreateRequest,
  MainBodyItem,
  MainBodySearchRequest,
  MainBodyUpdateRequest
} from "#/api/models/main-body";
import qs from "qs";
import type { BatchOptions } from "#/api/models/core";

class MainBodyApi extends BaseApi {
  fetchMainList(params: MainBodySearchRequest): Promise<MainBodyItem[]> {
    return requestClient.get<MainBodyItem[]>(this.getServiceUrl("list"), { params });
  }


  fetchMainCreate(params: MainBodyCreateRequest) {
    return requestClient.post(this.getServiceUrl("save"), params);
  }

  fetchMainUpdate(params: MainBodyUpdateRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchMainDisable(ids: string[]) {
    return requestClient.get(this.getServiceUrl("disable"), {
      params: { ids: ids },
      paramsSerializer: function(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    });
  }

  fetchMainEnable(ids: string[]) {
    return requestClient.get(this.getServiceUrl("enable"), {
      params: { ids: ids },
      paramsSerializer: function(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    });
  }

  fetchMainDelete(ids: string[]) {
    return requestClient.get(this.getServiceUrl("delete"), {
      params: { ids: ids },
      paramsSerializer: function(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    });
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params);
  }

}

export const mainBodyApi: MainBodyApi = new MainBodyApi("/sys/main");


/**
 *  主体套餐接口
 */
class MainBodyComboApi extends BaseApi {

  fetchMainBodyComboList(params: MainBodyComboPageRequest): Promise<MainBodyComboPageItem[]> {
    return requestClient.get<MainBodyComboPageItem[]>(this.getServiceUrl("list"), { params });
  }

  fetchMainBodyComboCreate(params: MainBodyComboCreateRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchMainBodyComboUpdate(params: MainBodyComboUpdateRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchMainBodyComboBatchOption(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params);
  }
}


export const mainBodyComboApi: MainBodyComboApi = new MainBodyComboApi("/sys/main_body_combo");
