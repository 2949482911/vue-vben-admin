import type {
  EpisodeSegmentPrompt,
  EpisodeSplitApplyRequest,
  EpisodeSplitApplyResult,
  EpisodeSplitPreviewResult,
  EpisodeSplitRequest,
  EpisodeSummaryItem,
} from '#/api/models/ai_asset_episode';

import { BaseApi } from '#/api/core/baseapi';
import { requestClient } from '#/api/request';

/**
 * 分集 v2 API（冻结契约）。
 *
 * 链路位置：短剧工作台 → 剧情 → 分集 → EpisodePanel。
 * 错误一律 skipErrorMessage=true，由面板按 parseApiError 口径内联展示。
 */
class AiAssetEpisodeApi extends BaseApi {
  /** 应用重新分集（写入），返回最新 summary 与 warnings */
  applyEpisodeSplit(
    data: EpisodeSplitApplyRequest,
  ): Promise<EpisodeSplitApplyResult> {
    return requestClient.post<EpisodeSplitApplyResult>(
      this.getServiceUrl('split-apply'),
      data,
      { skipErrorMessage: true },
    );
  }

  /** 分集摘要：全项目每个分集的镜头范围/时长/场次/投影状态 */
  fetchEpisodeSummary(
    novelId: number | string,
  ): Promise<EpisodeSummaryItem[]> {
    return requestClient.get<EpisodeSummaryItem[]>(
      this.getServiceUrl('summary'),
      { params: { novelId }, skipErrorMessage: true },
    );
  }

  /** 生成本集所有 segment 的十要素提示词（只读编译） */
  generateEpisodePrompts(
    episodeId: number | string,
  ): Promise<EpisodeSegmentPrompt[]> {
    return requestClient.post<EpisodeSegmentPrompt[]>(
      this.getServiceUrl(`${episodeId}/prompts`),
      undefined,
      { skipErrorMessage: true },
    );
  }

  /** 划分预览：不落库，返回 proposedEpisodes 与 blockers */
  previewEpisodeSplit(
    data: EpisodeSplitRequest,
  ): Promise<EpisodeSplitPreviewResult> {
    return requestClient.post<EpisodeSplitPreviewResult>(
      this.getServiceUrl('split-preview'),
      data,
      { skipErrorMessage: true },
    );
  }
}

export const aiAssetEpisodeApi: AiAssetEpisodeApi = new AiAssetEpisodeApi(
  '/platform/ai_asset/v2/episodes',
);
