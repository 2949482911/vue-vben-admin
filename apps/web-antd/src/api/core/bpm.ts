import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {
  CreateFlowableProcess,
  CreateUpdateProcess, FlowableProcessItem,
  FlowableProcessSearchRequest,
  ProcessItem,
  ProcessSearchRequest
} from "#/api/models";
import type {BatchOptions} from "#/api/models/core";


class FlowableProcessApi extends BaseApi {

  fetchProcessList(params: ProcessSearchRequest): Promise<ProcessItem[]> {
    return requestClient.get<ProcessItem[]>('/process/list', {params});
  }

  fetchCreateProcess(params: CreateUpdateProcess) {
    return requestClient.post(this.getServiceUrl("/process/create"), params);
  }

  fetchUpdateProcess(params: CreateUpdateProcess) {
    return requestClient.post(this.getServiceUrl("/process/update"), params);
  }

  fetchOptionsFlowableProcess(batchOptions: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), batchOptions)
  }

  fetchLoadFlowableProcess(id: string) {
    return requestClient.get(this.getServiceUrl("load"), {params: {id: id}});
  }

  fetchUnLoadFlowableProcess(id: string) {
    return requestClient.get(this.getServiceUrl("unload"), {params: {id: id}});
  }
}

export const flowableProcessApi: FlowableProcessApi = new FlowableProcessApi("/sys")
