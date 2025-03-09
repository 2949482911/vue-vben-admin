import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';
import type {
  DeveloperParams,
  DeveloperItem,
  CreateDeveloperRequest,
  UpdateDeveloperRequest
} from "#/api/models/media/developer";
import type {BatchOptions} from "#/api/models/core";


class DeveloperApi extends BaseApi {

  fetchDeveloperList(params: DeveloperParams): Promise<DeveloperItem> {
    return requestClient.get<DeveloperItem[]>(this.getServiceUrl("list"), {params})
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

  fetchAuthUrl(platform: string, accountId: string) {
    return requestClient.get(this.getServiceUrl("auth_url"), {params: {platform, accountId}});
  }
}


export const developerApi: DeveloperApi = new DeveloperApi("/media/developer");
