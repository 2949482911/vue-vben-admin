<script lang="ts" setup name="WorkspaceRequired">
/**
 * 域外兜底：素材库 / 资产只存在于工作区内
 *
 * 归一化后这两个菜单入口已不在全局菜单里（避免请求不带 X-Workspace-Id），
 * 但书签/深链仍可能直接打开旧路径，这里兜住，别让它发出无工作区上下文的请求。
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useAccessStore } from '@vben/stores';

import { Button, Empty } from 'ant-design-vue';

const router = useRouter();
const accessStore = useAccessStore();

const workspaceEntryPath = computed(
  () =>
    accessStore.accessMenus.find((menu) =>
      String(menu.path).endsWith('/workspace'),
    )?.path ?? '/ai_asset/workspace',
);

function goWorkspace() {
  void router.push(workspaceEntryPath.value);
}
</script>

<template>
  <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="资产库只存在于工作区内，请先进入一个工作区">
    <Button type="primary" @click="goWorkspace">去工作区</Button>
  </Empty>
</template>
