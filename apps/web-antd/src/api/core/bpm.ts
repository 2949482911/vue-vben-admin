import {requestClient} from '#/api/request';
import {BaseApi} from "#/api/core/baseapi";
import type {
  CreateUpdateForm,
  CreateUpdateProcess,
  FlowableFormItem,
  FlowableFormSearchRequest,
  ProcessSearchRequest
} from "#/api/models";
import type {BatchOptions} from "#/api/models/core";


class FlowableProcessApi extends BaseApi {

  fetchProcessList(params: ProcessSearchRequest): Promise<FlowableFormItem[]> {
    return requestClient.get<FlowableFormItem[]>(this.getServiceUrl("list"), {params});
  }

  fetchCreateProcess(params: CreateUpdateProcess) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchUpdateProcess(params: CreateUpdateProcess) {
    return requestClient.post(this.getServiceUrl("update"), params);
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

export const flowableProcessApi: FlowableProcessApi = new FlowableProcessApi("/sys/process")


class FlowableFormApi extends BaseApi {

  fetchFlowableFormList(params: FlowableFormSearchRequest): Promise<FlowableFormItem[]> {
    return requestClient.get<FlowableFormItem[]>(this.getServiceUrl("list"), {params})
  }

  fetchFormCreateForm(params: CreateUpdateForm) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchFormUpdateForm(params: CreateUpdateForm) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchFormBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params);
  }
}

export const flowableFormApi: FlowableFormApi = new FlowableFormApi("/sys/process_form")

