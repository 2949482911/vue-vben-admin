import type {CreateMenuRequest, MenuItem, UpdateMenuRequest,} from '#/api/models/menu';

import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {BatchOptions} from "#/api/models/core";


class MenuApi extends BaseApi {

  fetchMenuTree() {
    return requestClient.get<MenuItem[]>(this.getServiceUrl("list"));
  }

  fetchCreateMenu(params: CreateMenuRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchUpdateMenu(params: UpdateMenuRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params);
  }

}

export const menuApi: MenuApi = new MenuApi("/sys/menu");
