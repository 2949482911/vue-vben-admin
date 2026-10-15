import type {
  ModelConfigItem,
  ModelConfigQuery,
  ModelConfigSaveRequest,
  SkillItem,
  SkillQuery,
  SkillSaveRequest,
} from '#/api/models/ai_model';
import type { BatchOptions } from '#/api/models/core';
import type { PageResponse } from '#/api/models/marketing';

import { BaseApi } from '#/api/core/baseapi';
import { requestClient } from '#/api/request';

/**
 * AI 模型 / Skill 管理 API（system 侧）
 *
 * 后端服务前缀：/platform/aimodel（system 模块 AiModelManageController）
 * - 模型配置：save（新增/更新） / list（分页 AOP） / batch_options（enable/disable/delete）
 * - Skill：  save / list / batch_options
 */
class AiModelApi extends BaseApi {
  /** 模型配置 批量操作（启用/禁用/删除） */
  fetchModelConfigBatchOptions(params: BatchOptions) {
    return requestClient.post(
      this.getServiceUrl('model_config/batch_options'),
      params,
    );
  }

  /** 模型配置列表（分页） */
  fetchModelConfigList(
    params: ModelConfigQuery,
  ): Promise<PageResponse<ModelConfigItem>> {
    return requestClient.get<PageResponse<ModelConfigItem>>(
      this.getServiceUrl('model_config/list'),
      { params },
    );
  }

  /** Skill 批量操作（启用/禁用/删除） */
  fetchSkillBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl('skill/batch_options'), params);
  }

  /** Skill 列表（分页） */
  fetchSkillList(params: SkillQuery): Promise<PageResponse<SkillItem>> {
    return requestClient.get<PageResponse<SkillItem>>(
      this.getServiceUrl('skill/list'),
      { params },
    );
  }

  /** 模型配置 新增/更新 */
  saveModelConfig(data: ModelConfigSaveRequest) {
    return requestClient.post(this.getServiceUrl('model_config/save'), data);
  }

  /** Skill 新增/更新 */
  saveSkill(data: SkillSaveRequest) {
    return requestClient.post(this.getServiceUrl('skill/save'), data);
  }
}

export const aiModelApi: AiModelApi = new AiModelApi('/platform/aimodel');
