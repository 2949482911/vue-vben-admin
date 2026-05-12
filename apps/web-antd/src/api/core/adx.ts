import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from "#/api/request";
import { customRequest } from '#/api/customRequest';
import type {BatchOptions} from "#/api/models/core";
import type {
  DspItem, 
  DspPageRequest, 
  DspUpdateItem, 
  RtbItem, 
  RtbPageRequest, 
  RtbUpdateItem, 
  CampaignItem, 
  CampaignPageRequest, 
  CampaignUpdateItem,
  PushCampaignItem,
  PushCampaignPageRequest
} from "#/api/models/adx";
class DspApi extends BaseApi {
  fetchDspList(params: DspPageRequest) {
    return requestClient.get(this.getServiceUrl("list"), {params: params})
  }

  fetchCreateDsp(params: DspItem) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  fetchUpdateDsp(params: DspUpdateItem) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}

export const dspApi = new DspApi("/platform/dsp_channel");
class RtbApi extends BaseApi {
  fetchRtbList(params: RtbPageRequest) {
    return requestClient.get(this.getServiceUrl("list"), {params: params})
  }

  fetchCreateRtb(params: RtbItem) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  fetchUpdateRtb(params: RtbUpdateItem) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}

export const rtbApi = new RtbApi("/platform/rtb_channel");

class CampaignApi extends BaseApi {
  fetchCampaignList(params:CampaignPageRequest) {
    return requestClient.get(this.getServiceUrl("list"), {params: params})
  }

  fetchCreateCampaign(params:CampaignItem) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  fetchUpdateCampaign(params:CampaignUpdateItem) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}

export const campaignApi = new CampaignApi("/platform/adx_campaign_strategy");

// 查询push计划列表
class PushCampaignApi extends BaseApi {
  fetchPushCampaignList(params: PushCampaignPageRequest) {
    return requestClient.get(this.getServiceUrl("list"), {params: params})
  }
  // 获取图片id
  fetchImageId(params: FormData) {
    return customRequest.post(this.getServiceUrl("image_id"), params)
  }
}
export const pushCampaignApi = new PushCampaignApi("/platform/push_campaign");
// 创建华为用户增长计划
class HuaweiCampaignApi extends BaseApi {
  fetchCreateCampaign(params: PushCampaignItem) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }
}
export const huaweiCampaignApi = new HuaweiCampaignApi("/platform/huawei_campaign");
// 创建荣耀用户增长计划
class HonorCampaignApi extends BaseApi {
  fetchCreateCampaign(params: PushCampaignItem) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }
}
export const honorCampaignApi = new HonorCampaignApi("/platform/honor_campaign");
