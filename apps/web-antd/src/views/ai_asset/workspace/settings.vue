<script lang="ts" setup name="AiAssetWorkspaceSettings">
/**
 * 工作区内 · 工作区设置
 *
 * 当前只有只读信息（名称 / 工作区 ID / 数据隔离说明）；
 * 成员与分享属 P1（ai_asset_workspace_member），后端就绪后再补。
 */
import { computed } from 'vue';

import { Page } from '@vben/common-ui';

import { Descriptions, DescriptionsItem } from 'ant-design-vue';

import { useWorkspaceStore } from '#/store';

const workspaceStore = useWorkspaceStore();

const workspaceId = computed(() => String(workspaceStore.workspaceId ?? '-'));
const workspaceName = computed(() => workspaceStore.workspaceName || '-');
</script>

<template>
  <Page
    description="工作区是租户下的二级数据隔离域，域内数据跨工作区互不可见"
    title="工作区设置"
  >
    <Descriptions :column="1" bordered size="small">
      <DescriptionsItem label="工作区名称">{{ workspaceName }}</DescriptionsItem>
      <DescriptionsItem label="工作区 ID">{{ workspaceId }}</DescriptionsItem>
      <DescriptionsItem label="数据隔离">
        所有平台 AI 资产接口携带 X-Workspace-Id，后端按此过滤
      </DescriptionsItem>
      <DescriptionsItem label="成员与分享">
        待后端支持（P1，ai_asset_workspace_member）
      </DescriptionsItem>
    </Descriptions>
  </Page>
</template>
