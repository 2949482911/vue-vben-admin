import type {BaseItem, PageRequestParams} from "#/api/models/core";


export interface DeveloperParams extends PageRequestParams {
  appId: string;
  appName: string;
}

export interface DeveloperItem extends BaseItem {
  platform: string;
  appId: string;
  appName: string;
  remark: string;
  secret: string;
  authorizedAccount: number;
}


export interface CreateDeveloperRequest {
  platform: string;
  appId: string;
  appName: string;
  remark: string;
  secret: string;
}

export interface UpdateDeveloperRequest extends CreateDeveloperRequest {
  id: string;
}
