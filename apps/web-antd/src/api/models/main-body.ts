import type {BaseItem, PageRequestParams} from "#/api/models/core";

export interface MainBodySearchRequest extends PageRequestParams{
  name: string;
}


export interface MainBodyItem extends BaseItem {
  name: string;
  email: string;
  remark: string;
}


export interface MainBodyCreateRequest {
  id: string
  name: string;
  email: string;
  remark: string;
}

export interface MainBodyUpdateRequest extends MainBodyCreateRequest{}
