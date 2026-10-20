import type { BatchOptions } from "#/api/models/core";
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

// @ts-ignore
import qs from "qs";

import { BaseApi } from "#/api/core/baseapi";
import { requestClient } from "#/api/request";

class MainBodyApi extends BaseApi {
  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params);
  }


  fetchMainCreate(params: MainBodyCreateRequest) {
    return requestClient.post(this.getServiceUrl("save"), params);
  }

  fetchMainDelete(ids: string[]) {
    return requestClient.get(this.getServiceUrl("delete"), {
      params: { ids },
      paramsSerializer(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    });
  }

  fetchMainDisable(ids: string[]) {
    return requestClient.get(this.getServiceUrl("disable"), {
      params: { ids },
      paramsSerializer(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    });
  }

  fetchMainEnable(ids: string[]) {
    return requestClient.get(this.getServiceUrl("enable"), {
      params: { ids },
      paramsSerializer(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    });
  }

  fetchMainList(params: MainBodySearchRequest): Promise<MainBodyItem[]> {
    return requestClient.get<MainBodyItem[]>(this.getServiceUrl("list"), { params });
  }

  fetchMainUpdate(params: MainBodyUpdateRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

}

export const mainBodyApi: MainBodyApi = new MainBodyApi("/sys/main");


/**
 *  主体套餐接口
 */
class MainBodyComboApi extends BaseApi {

  fetchMainBodyComboBatchOption(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params);
  }

  fetchMainBodyComboCreate(params: MainBodyComboCreateRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchMainBodyComboList(params: MainBodyComboPageRequest): Promise<MainBodyComboPageItem[]> {
    return requestClient.get<MainBodyComboPageItem[]>(this.getServiceUrl("list"), { params });
  }

  fetchMainBodyComboUpdate(params: MainBodyComboUpdateRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }
}


export const mainBodyComboApi: MainBodyComboApi = new MainBodyComboApi("/sys/main_body_combo");
