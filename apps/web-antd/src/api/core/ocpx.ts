import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from "#/api/request";
import type {
  BehavioraPlatformPageRequest,
  ClickMonitorResponse,
  CreateBehavioraPlatformRequest, CreateEventSettlementRequest,
  CreateOcpxTaskRequest,
  CreatePlatformCallbackRequest, EventSettlementItem,
  EventSettlementPageRequest, OcpxBehavioracallbackRecordPageRequest,
  OcpxTaskItem,
  OpcxTaskPageRequest, PlatformCallbackBehaviorTypeItem,
  PlatformcallbackItem,
  PlatformcallbackPageRequest, TestCallbackRequest,
  UpdateBehavioraPlatformRequest, UpdateEventSettlementRequest,
  UpdateOcpxTaskRequest,
  UpdatePlatformCallbackRequest,
} from "#/api/models";
import type {BehavioraPlatformItem} from "#/api/models/ocpx";
import type {BatchOptions} from "#/api/models/core";


class PlatformCallbackApi extends BaseApi {

  fetchPlatformcallbackList(params: PlatformcallbackPageRequest) {
    return requestClient.get<PlatformcallbackItem[]>(this.getServiceUrl("list"), {
      params: params
    });
  }

  fetchPlatformcallbackCreate(params: CreatePlatformCallbackRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchPlatformcallbackUpdate(params: UpdatePlatformCallbackRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }

  /**
   * 获取回传媒体支持的转化事件类型
   */
  fetchPlatformCallbackBehaviorTypeItem(platform: string) {
    return requestClient.get<PlatformCallbackBehaviorTypeItem[]>(this.getServiceUrl("behavior_type_list"), {
      params: {
        platform: platform
      }
    })
  }
}

export const platformCallbackApi = new PlatformCallbackApi("/platform/platformcallback");


/**
 * 转化平台
 */
class BehavioraPlatformApi extends BaseApi {

  fetchBehavioraPlatformList(params: BehavioraPlatformPageRequest) {
    return requestClient.get<BehavioraPlatformItem[]>(this.getServiceUrl("list"), {
      params
    });
  }


  fetchCreateBehavioraPlatform(params: CreateBehavioraPlatformRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }


  fetchUpdateBehavioraPlatform(params: UpdateBehavioraPlatformRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}


export const behavioraPlatformApi = new BehavioraPlatformApi("/platform/platformbehaviora");


/**
 * ocpx 任务
 */

class OcpxTaskApi extends BaseApi {
  fetchOcpxTaskList(params: OpcxTaskPageRequest) {
    return requestClient.get<OcpxTaskItem[]>(this.getServiceUrl("list"), {
      params: params
    });
  }

  fetchCreateOcpxTask(params: CreateOcpxTaskRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchUpdateOcpxTask(params: UpdateOcpxTaskRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }

  /**
   * 获取转化回调记录
   * @param params
   */
  fetchOcpxBehavioracallbackRecordList(params: OcpxBehavioracallbackRecordPageRequest) {
    return requestClient.get(this.getServiceUrl("callback_record_list"), {params: params})
  }

  /**
   * 获取转化历史记录
   * @param params
   */
  fetchOxpcBehaviorRecordList(params: OcpxBehavioracallbackRecordPageRequest) {
    return requestClient.get(this.getServiceUrl("behavior_record_list"), {params: params})
  }

  /**回传记录详细信息*/
  fetchOxpcTransmissionRecord(id: string) {
    return requestClient.get(this.getServiceUrl("callback_record_detail"), {
      params: {
        id: id
      }
    })
  }
}

export const ocpxTaskApi = new OcpxTaskApi("/platform/ocpxtask");


/**
 * 点击检测获取
 */
class ClickMonitorApi extends BaseApi {

  fetchGenClickUrl(taskId: string) {
    return requestClient.get<Array<ClickMonitorResponse>>(this.getServiceUrl("gen_click_url"), {params: {ocpxTaskId: taskId}});
  }

  /**
   * 联调测试
   */
  fetchTestCallback(params: TestCallbackRequest) {
    return requestClient.get(this.getServiceUrl("test_callback"), {params})
  }


  /**
   * 重推转化回传
   * @param id
   */
  fetchRePushBehaviorCallback(id: string) {
    return requestClient.get(this.getServiceUrl("repush_behavior_callback"), {
      params: {
        id: id
      }
    })
  }

  /**回传媒体批量重试*/
  fetchRePushRetryBehaviorCallback(ids: string[]) {
    return requestClient.post(this.getServiceUrl("batch_repush_behavior_callback"), ids)
  }
}


export const clickMonitorApi = new ClickMonitorApi("/platform/clickmonitor");


/**
 * 事件结算配置
 */


class EventSettlementApi extends BaseApi {

  fetchEventSettlementList(params: EventSettlementPageRequest) {
    return requestClient.get<EventSettlementItem[]>(this.getServiceUrl("list"), {params})
  }

  fetchEventSettlementCreate(params: CreateEventSettlementRequest) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  fetchEventSettlementUpdate(params: UpdateEventSettlementRequest) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }

}

export const eventSettlementApi = new EventSettlementApi("/platform/event_settlement");
