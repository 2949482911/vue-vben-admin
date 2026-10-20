import type {
  CreateUpdateForm,
  CreateUpdateProcess,
  FlowableFormItem,
  FlowableFormSearchRequest,
  ProcessSearchRequest
} from "#/api/models";
import type {BatchOptions} from "#/api/models/core";

import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';


class FlowableProcessApi extends BaseApi {

  fetchCreateProcess(params: CreateUpdateProcess) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchLoadFlowableProcess(id: string) {
    return requestClient.get(this.getServiceUrl("load"), {params: {id}});
  }

  fetchOptionsFlowableProcess(batchOptions: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), batchOptions)
  }

  fetchProcessList(params: ProcessSearchRequest): Promise<FlowableFormItem[]> {
    return requestClient.get<FlowableFormItem[]>(this.getServiceUrl("list"), {params});
  }

  fetchUnLoadFlowableProcess(id: string) {
    return requestClient.get(this.getServiceUrl("unload"), {params: {id}});
  }

  fetchUpdateProcess(params: CreateUpdateProcess) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }
}

export const flowableProcessApi: FlowableProcessApi = new FlowableProcessApi("/sys/process")


class FlowableFormApi extends BaseApi {

  fetchFlowableFormList(params: FlowableFormSearchRequest): Promise<FlowableFormItem[]> {
    return requestClient.get<FlowableFormItem[]>(this.getServiceUrl("list"), {params})
  }

  fetchFormBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params);
  }

  fetchFormCreateForm(params: CreateUpdateForm) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchFormUpdateForm(params: CreateUpdateForm) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }
}

export const flowableFormApi: FlowableFormApi = new FlowableFormApi("/sys/process_form")

