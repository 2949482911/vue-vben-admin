import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {RepresentativeItem, RepresentativeSearchParams} from "#/api/models";


class TaskApi extends BaseApi {
  fetchRepresentative(params: RepresentativeSearchParams): Promise<RepresentativeItem[]> {
    return requestClient.get<RepresentativeItem[]>(this.getServiceUrl("representative"), params)
  }

  fetchDoneRepresentative(params: RepresentativeSearchParams): Promise<RepresentativeItem[]> {
    return requestClient.get<RepresentativeItem[]>(this.getServiceUrl("done_representative"), params)
  }
}


export const taskApi: TaskApi = new TaskApi('/sys/task',)
