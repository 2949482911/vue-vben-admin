import type {
  AutoProxyAdsTaskListResult,
  AutoProxyAdsTaskQuery,
  AutoProxyAssetMode,
  AutoProxyCampaignCardRequest,
  AutoProxyCampaignCardResponse,
  AutoProxyCreateTaskRequest,
  AutoProxyExecuteRequest,
  AutoProxyExecuteResponse,
} from '#/api/models/auto_proxy_ads';

import { requestClient } from '#/api/request';

class AutoProxyAdsApi {
  createTask(data: AutoProxyCreateTaskRequest) {
    return requestClient.post('/auto_proxy_ads/create', data);
  }

  executeNow(data: AutoProxyExecuteRequest) {
    return requestClient.post<AutoProxyExecuteResponse>(
      '/auto_proxy_ads/execute_now',
      data,
    );
  }

  fetchAssetMode(params: { platform: string; platformMode: string }) {
    return requestClient.get<AutoProxyAssetMode>(
      '/auto_proxy_ads/asset_mode',
      { params },
    );
  }

  fetchAssetModes() {
    return requestClient.get<AutoProxyAssetMode[]>(
      '/auto_proxy_ads/asset_modes',
    );
  }

  fetchCampaignCard(data: AutoProxyCampaignCardRequest) {
    return requestClient.post<AutoProxyCampaignCardResponse>(
      '/auto_proxy_ads/campaign_card',
      data,
    );
  }

  fetchTaskList(params: AutoProxyAdsTaskQuery) {
    return requestClient.get<AutoProxyAdsTaskListResult>(
      '/auto_proxy_ads/list',
      { params },
    );
  }
}

export const autoProxyAdsApi = new AutoProxyAdsApi();
