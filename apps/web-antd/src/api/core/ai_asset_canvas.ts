import type {
  CanvasAgentActionRequest,
  CanvasAgentChatRequest,
  CanvasAgentChatResult,
  CanvasAgentTool,
  CanvasBlueprint,
  CanvasContext,
  CanvasCreateRequest,
  CanvasGraph,
  CanvasSaveRequest,
  CanvasSplitStoryboardRequest,
  CanvasSplitStoryboardResult,
  CanvasSummary,
} from '#/api/models/ai_asset_canvas';

import { BaseApi } from '#/api/core/baseapi';
import { requestClient } from '#/api/request';

/**
 * P8 短剧画布 API。
 *
 * 链路位置：短剧工作台 → 画布面版 → 本客户端。
 * 后端前缀：/platform/ai_asset/v2/canvas（非微服务模式下 BaseApi 会去掉 /platform）。
 */
class AiAssetCanvasApi extends BaseApi {
  createCanvas(data: CanvasCreateRequest): Promise<CanvasSummary> {
    return requestClient.post<CanvasSummary>(
      this.getServiceUrl('create'),
      data,
      { skipErrorMessage: true },
    );
  }

  deleteCanvas(canvasId: number | string): Promise<boolean> {
    return requestClient.post<boolean>(
      this.getServiceUrl(`${canvasId}/delete`),
      {},
      { skipErrorMessage: true },
    );
  }

  fetchBlueprints(): Promise<CanvasBlueprint[]> {
    return requestClient.get<CanvasBlueprint[]>(
      this.getServiceUrl('blueprints'),
      { skipErrorMessage: true },
    );
  }

  fetchCanvas(canvasId: number | string): Promise<CanvasGraph> {
    return requestClient.get<CanvasGraph>(this.getServiceUrl(`${canvasId}`), {
      skipErrorMessage: true,
    });
  }

  fetchCanvasAgentTools(
    canvasId: number | string,
  ): Promise<CanvasAgentTool[]> {
    return requestClient.get<CanvasAgentTool[]>(
      this.getServiceUrl(`${canvasId}/agent/tools`),
      { skipErrorMessage: true },
    );
  }

  fetchCanvasContext(canvasId: number | string): Promise<CanvasContext> {
    return requestClient.get<CanvasContext>(
      this.getServiceUrl(`${canvasId}/context`),
      { skipErrorMessage: true },
    );
  }

  fetchCanvasList(novelId: number | string): Promise<CanvasSummary[]> {
    return requestClient.get<CanvasSummary[]>(this.getServiceUrl('list'), {
      params: { novelId },
      skipErrorMessage: true,
    });
  }

  renameCanvas(
    canvasId: number | string,
    title: string,
  ): Promise<CanvasSummary> {
    return requestClient.post<CanvasSummary>(
      this.getServiceUrl(`${canvasId}/rename`),
      { title },
      { skipErrorMessage: true },
    );
  }

  runCanvasAgentAction(
    canvasId: number | string,
    data: CanvasAgentActionRequest,
  ): Promise<CanvasGraph> {
    return requestClient.post<CanvasGraph>(
      this.getServiceUrl(`${canvasId}/agent/action`),
      data,
      { skipErrorMessage: true },
    );
  }

  saveCanvas(
    canvasId: number | string,
    data: CanvasSaveRequest,
  ): Promise<CanvasGraph> {
    return requestClient.post<CanvasGraph>(
      this.getServiceUrl(`${canvasId}/save`),
      data,
      { skipErrorMessage: true },
    );
  }

  sendCanvasAgentChat(
    canvasId: number | string,
    data: CanvasAgentChatRequest,
  ): Promise<CanvasAgentChatResult> {
    return requestClient.post<CanvasAgentChatResult>(
      this.getServiceUrl(`${canvasId}/agent/chat`),
      data,
      { skipErrorMessage: true },
    );
  }

  splitCanvasStoryboard(
    canvasId: number | string,
    data: CanvasSplitStoryboardRequest,
  ): Promise<CanvasSplitStoryboardResult> {
    return requestClient.post<CanvasSplitStoryboardResult>(
      this.getServiceUrl(`${canvasId}/split-storyboard`),
      data,
      // LLM 拆镜实测 130s+，单独放宽到 10 分钟，不使用全局 120s
      { skipErrorMessage: true, timeout: 600_000 },
    );
  }
}

export const aiAssetCanvasApi: AiAssetCanvasApi = new AiAssetCanvasApi(
  '/platform/ai_asset/v2/canvas',
);
