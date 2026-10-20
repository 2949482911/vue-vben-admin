import type { ProjectItem } from "#/api/models";
import type {
  AttributionConfigItem,
  AttributionConfigPageRequest,
  CreateAttributionConfigRequest,
  CreateEventAttributeRequest,
  CreateEventConfigRequest,
  CreateSdkAppRequest,
  EventAttributeItem,
  EventAttributePageRequest,
  EventConfigItem,
  EventConfigPageRequest,
  SdkAppConfigItem,
  SdkAppConfigListPageRequest,
  UpdateAttributionConfigRequest,
  UpdateEventConfigRequest,
  UpdateSdkAppRequest
} from "#/api/models/attribution";
import type { BatchOptions } from "#/api/models/core";

import { BaseApi } from "#/api/core/baseapi";
import { requestClient } from "#/api/request";


/**
 * 事件配置
 */
class EventConfigApi extends BaseApi {
  fetchBatchOptions(data: BatchOptions) {
    return requestClient.post(this.getServiceUrl("event_config/batch_options"), data);
  }

  fetchCreateEventConfigRequest(data: CreateEventConfigRequest) {
    return requestClient.post(this.getServiceUrl("event_config/create"), data);
  }

  fetchGetEventConfigList(params: EventConfigPageRequest) {
    return requestClient.get<EventConfigItem[]>(this.getServiceUrl("event_config/list"), {
      params
    });
  }

  fetchUpdateEventConfigRequest(data: UpdateEventConfigRequest) {
    return requestClient.post(this.getServiceUrl("event_config/update"), data);
  }

}

export const eventConfigApi: EventConfigApi = new EventConfigApi("/platform/attribution");


/**
 * 事件属性
 */
class EventAttributeApi extends BaseApi {
  fetchAttributeList(params: EventAttributePageRequest) {
    return requestClient.get<EventAttributeItem[]>(this.getServiceUrl("properties/list"), {
      params
    });
  }

  fetchBatchOptionsVO(data: BatchOptions) {
    return requestClient.post(this.getServiceUrl("properties/batch_options"), data);
  }

  fetchCreateEventAttributeRequest(data: CreateEventAttributeRequest) {
    return requestClient.post(this.getServiceUrl("properties/create"), data);
  }

  fetchUpdateEventConfigRequest(data: UpdateEventConfigRequest) {
    return requestClient.post(this.getServiceUrl("properties/update"), data);
  }
}

export const eventAttributeApi: EventAttributeApi = new EventAttributeApi("/platform/attribution");


/**
 * 归因配置模板
 */
class AttributionConfigApi extends BaseApi {
  fetchBatchOptions(data: BatchOptions) {
    return requestClient.post(this.getServiceUrl("config/batch_options"), data);
  }

  fetchConfigList(params: AttributionConfigPageRequest) {
    return requestClient.get<AttributionConfigItem[]>(this.getServiceUrl("config/list"), { params });
  }

  fetchCreateAttributionConfigRequest(data: CreateAttributionConfigRequest) {
    return requestClient.post(this.getServiceUrl("config/create"), data);
  }

  fetchUpdateAttributionConfigRequest(data: UpdateAttributionConfigRequest) {
    return requestClient.post(this.getServiceUrl("config/update"), data);
  }

}


export const attributionConfigApi: AttributionConfigApi = new AttributionConfigApi("/platform/attribution");


/**
 * sdk config api
 */
class SdkConfigApi extends BaseApi {
  fetchAvailableProjects() {
    return requestClient.get<ProjectItem[]>(this.getServiceUrl("available_projects"));
  }

  fetchBatchOptions(data: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), data);
  }

  fetchCreateSdkAppRequest(data: CreateSdkAppRequest) {
    return requestClient.post(this.getServiceUrl("create"), data);
  }

  fetchSdkConfigList(params: SdkAppConfigListPageRequest) {
    return requestClient.get<SdkAppConfigItem[]>(this.getServiceUrl("list"), {
      params
    });
  }

  fetchUpdateSdkAppRequest(data: UpdateSdkAppRequest) {
    return requestClient.post(this.getServiceUrl("update"), data);
  }
}

export const sdkConfigApi = new SdkConfigApi("/platform/attribution_app");
