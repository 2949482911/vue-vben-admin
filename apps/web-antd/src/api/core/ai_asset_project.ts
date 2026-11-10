import type {
  ProjectAspectRatioView,
  ProjectVisualStyleSaveRequest,
  ProjectVisualStyleView,
} from '#/api/models/ai_asset_project';

import { BaseApi } from '#/api/core/baseapi';
import { requestClient } from '#/api/request';

/**
 * 项目级设置 API（v2 · P2 契约）
 *
 * 链路位置：短剧工作台顶栏「项目画风 / 画面比例」→ 本客户端。
 * 后端服务前缀：/platform/ai_asset/v2/project（非微服务模式下 BaseApi 会去掉 /platform）。
 * 写入失败 skipErrorMessage=true，由调用方解析后端原文并内联展示。
 */
class AiAssetProjectApi extends BaseApi {
  /** 读取项目画面比例 */
  fetchProjectAspectRatio(
    novelId: number | string,
  ): Promise<ProjectAspectRatioView> {
    return requestClient.get<ProjectAspectRatioView>(
      this.getServiceUrl(`novels/${novelId}/aspect-ratio`),
    );
  }

  /** 读取项目画风：预设列表 + 当前画风 + 后端计算的生效提示词 */
  fetchProjectVisualStyle(
    novelId: number | string,
  ): Promise<ProjectVisualStyleView> {
    return requestClient.get<ProjectVisualStyleView>(
      this.getServiceUrl(`novels/${novelId}/visual-style`),
    );
  }

  /** 保存项目画面比例 */
  async saveProjectAspectRatio(
    novelId: number | string,
    aspectRatio: string,
  ): Promise<void> {
    await requestClient.post(
      this.getServiceUrl(`novels/${novelId}/aspect-ratio`),
      { aspectRatio },
      { skipErrorMessage: true },
    );
  }

  /** 保存项目画风：预设传 code，自定义传 prompt，清除传空对象 */
  async saveProjectVisualStyle(
    novelId: number | string,
    data: ProjectVisualStyleSaveRequest,
  ): Promise<void> {
    await requestClient.post(
      this.getServiceUrl(`novels/${novelId}/visual-style`),
      data,
      { skipErrorMessage: true },
    );
  }
}

export const aiAssetProjectApi: AiAssetProjectApi = new AiAssetProjectApi(
  '/platform/ai_asset/v2/project',
);
