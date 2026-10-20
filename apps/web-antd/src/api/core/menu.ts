import type {BatchOptions} from "#/api/models/core";
import type {CreateMenuRequest, MenuItem, UpdateMenuRequest,} from '#/api/models/menu';

import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';


class MenuApi extends BaseApi {

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params);
  }

  fetchCreateMenu(params: CreateMenuRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchMenuTree() {
    return requestClient.get<MenuItem[]>(this.getServiceUrl("list"));
  }

  fetchUpdateMenu(params: UpdateMenuRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

}

export const menuApi: MenuApi = new MenuApi("/sys/menu");
