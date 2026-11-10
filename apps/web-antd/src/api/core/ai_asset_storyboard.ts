import type {
  StoryboardImageGenerateRequest,
  StoryboardImageTaskResult,
  StoryboardListResult,
  StoryboardPromptPreviewRequest,
  StoryboardPromptPreviewResult,
  StoryboardPromptRequest,
  StoryboardSegmentPrompt,
  StoryboardShotAssetsSaveRequest,
  StoryboardSplitRequest,
  StoryboardSplitResult,
} from '#/api/models/ai_asset_storyboard';
import type { TaskBatchCenterProgressResponse } from '#/api/models/marketing';

import { BaseApi } from '#/api/core/baseapi';
import { requestClient } from '#/api/request';

/**
 * 分镜台 v2 API（冻结契约）。
 *
 * 链路位置：短剧工作台 → 剧情 → 分镜 → StoryboardPanel。
 * 错误一律 skipErrorMessage=true，由面板按 parseApiError 口径内联展示。
 */
class AiAssetStoryboardApi extends BaseApi {
  /** 配图任务进度（按契约复用任务中心进度结构） */
  fetchStoryboardImagesProgress(
    taskId: number | string,
  ): Promise<TaskBatchCenterProgressResponse> {
    return requestClient.get<TaskBatchCenterProgressResponse>(
      this.getServiceUrl('images/progress'),
      { params: { taskId }, skipErrorMessage: true },
    );
  }

  /** 分镜列表：段落 + 镜头十要素 + 生成/关键帧状态 */
  fetchStoryboardList(
    episodeId: number | string,
  ): Promise<StoryboardListResult> {
    return requestClient.get<StoryboardListResult>(
      this.getServiceUrl('list'),
      { params: { episodeId }, skipErrorMessage: true },
    );
  }

  /** 全部镜头批量配图（异步任务） */
  generateStoryboardImages(
    data: StoryboardImageGenerateRequest,
  ): Promise<StoryboardImageTaskResult> {
    return requestClient.post<StoryboardImageTaskResult>(
      this.getServiceUrl('images'),
      data,
      { skipErrorMessage: true },
    );
  }

  /** 生成全部段落提示词 */
  generateStoryboardPrompts(
    data: StoryboardPromptRequest,
  ): Promise<StoryboardSegmentPrompt[]> {
    return requestClient.post<StoryboardSegmentPrompt[]>(
      this.getServiceUrl('prompts'),
      data,
      { skipErrorMessage: true },
    );
  }

  /** 最终实际生成 prompt 只读预览（image=出图富化 / video=最终视频） */
  previewStoryboardShotPrompt(
    data: StoryboardPromptPreviewRequest,
  ): Promise<StoryboardPromptPreviewResult> {
    return requestClient.post<StoryboardPromptPreviewResult>(
      this.getServiceUrl('shots/prompt-preview'),
      data,
      { skipErrorMessage: true },
    );
  }

  /** 手动绑定 / 解绑镜头资产 */
  saveStoryboardShotAssets(
    data: StoryboardShotAssetsSaveRequest,
  ): Promise<void> {
    return requestClient.post<void>(this.getServiceUrl('shots/assets'), data, {
      skipErrorMessage: true,
    });
  }

  /** 拆分分镜 */
  splitStoryboard(
    data: StoryboardSplitRequest,
  ): Promise<StoryboardSplitResult> {
    return requestClient.post<StoryboardSplitResult>(
      this.getServiceUrl('split'),
      data,
      { skipErrorMessage: true },
    );
  }
}

export const aiAssetStoryboardApi: AiAssetStoryboardApi =
  new AiAssetStoryboardApi('/platform/ai_asset/v2/storyboard');
