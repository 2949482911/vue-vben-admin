import type {BaseItem, PageRequestParams} from "#/api/models/core";

export interface ProcessSearchRequest extends PageRequestParams {
  name: string;
}

export interface ProcessItem extends BaseItem{
  name: string;
  processType: string;
  processStatus: number;
  remark: string;
}


export interface CreateUpdateProcess {
  id: string;
  name: string;
  remark: string;
  processType: string;
  processStatus: number;
}


export interface FlowableFormSearchRequest extends PageRequestParams{
  name: string;
}

export interface FlowableFormItem extends BaseItem{
  name: string;
  formContent: string;
  script: string;
  remark: string;
}

export interface CreateUpdateForm {
  id: string;
  name: string;
  formContent: string;
  script: string;
  remark: string;
}
