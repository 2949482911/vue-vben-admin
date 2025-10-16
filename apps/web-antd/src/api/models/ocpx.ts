import type {BaseItem, PageRequestParams} from "#/api/models/core";


// callback page request
export interface PlatformcallbackPageRequest extends PageRequestParams {
  name?: string;
  platform?: string
}

// callback platform list
export interface PlatformcallbackItem extends BaseItem {
  name: string;
  platform: string;
  config: Map<string, any>;
  remark: string;
}


export interface CreatePlatformCallbackRequest {
  name: string;
  platform: string;
  config: Map<string, any>;
  remark: string;
}

export interface UpdatePlatformCallbackRequest extends CreatePlatformCallbackRequest {
  id: string;
}

