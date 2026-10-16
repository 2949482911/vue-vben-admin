<script lang="ts" setup name="AiAssetWorkspaceLayout">
/**
 * 工作区域布局（/ai_asset/workspace/:wsId/**）
 *
 * 域上下文条：‹ 全部工作区 + 工作区下拉切换（workspace/list）+ 🔒 数据隔离域。
 * vben 侧边栏没有可插入的插槽（改它要动 packages），所以这条放在域内页面顶部，效果等价。
 *
 * 切换工作区：改工作区上下文（菜单 + X-Workspace-Id）并停在同一个内部页，
 * 全程盖一层 loading，跳转完成后关闭。
 *
 * 页面缓存：vben 的 keep-alive 跟**页签**绑定，域内页设了 hideInTab 所以不做缓存，
 * 切内部菜单会重新拉数据（详见 router/routes/ai-asset-workspace.ts）。
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { VbenLoading } from '@vben/common-ui';

import { Card, Select } from 'ant-design-vue';

import { useWorkspaceStore } from '#/store';

import {
  WORKSPACE_BASE_PATH,
  WORKSPACE_INTERNAL_MENU,
  workspacePagePath,
} from './menu';

const route = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();

/** 当前内部页 key（路径末段） */
const currentKey = computed(() => String(route.path.split('/').pop() ?? ''));

const switching = ref(false);

/** 下拉选项来自 store 缓存（只请求一次）；当前工作区不在列表里也补上，保证能显示 */
const workspaceOptions = computed<Array<{ label: string; value: number | string }>>(
  () => {
    const options = workspaceStore.options;
    const current = workspaceStore.workspaceId;
    if (
      current !== undefined &&
      !options.some((item) => String(item.value) === String(current))
    ) {
      return [
        {
          label: workspaceStore.workspaceName || `工作区 #${current}`,
          value: current,
        },
        ...options,
      ];
    }
    return options;
  },
);

/** 切换工作区：改上下文 → 停在同一内部页；全程盖 loading */
async function switchWorkspace(value: any) {
  if (String(value) === String(workspaceStore.workspaceId)) {
    return;
  }
  switching.value = true;
  try {
    const option = workspaceOptions.value.find(
      (item) => String(item.value) === String(value),
    );
    const key = WORKSPACE_INTERNAL_MENU.some((item) => item.key === currentKey.value)
      ? currentKey.value
      : 'studio';
    workspaceStore.enter(value, option?.label);
    await router.push(workspacePagePath(value, key));
  } finally {
    switching.value = false;
  }
}

function exitWorkspace() {
  // 优先回全局菜单里那个「工作区」节点的真实路径，拿不到再用约定的基路径
  const target =
    workspaceStore.globalMenus.find((menu) =>
      String(menu.path).endsWith('/workspace'),
    )?.path ?? WORKSPACE_BASE_PATH;
  void router.push(target);
}

onMounted(() => {
  // store 已缓存则不再请求（域布局会随路径重挂载）
  void workspaceStore.loadWorkspaceOptions();
});
</script>

<template>
  <div class="ws-domain">
    <Card class="ws-ctx">
      <button class="ws-ctx__back" type="button" @click="exitWorkspace">
        ‹ 全部工作区
      </button>

      <Select
        class="ws-ctx__pick"
        :options="workspaceOptions"
        :value="workspaceStore.workspaceId"
        @change="switchWorkspace"
      />

      <span class="ws-ctx__flag">🔒 数据隔离域</span>
    </Card>

    <div class="ws-domain__body">
      <RouterView />
    </div>

    <!-- 切工作区时整页 loading -->
    <VbenLoading :spinning="switching" text="正在切换工作区…" />
  </div>
</template>

<style scoped lang="scss">
.ws-domain {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* 域上下文条也用 Card 呈现（与页面内其它卡片同一风格）；
   左右留白与页面内容对齐——Page 自己有 16px 内边距，所以这里也用 16px margin */
.ws-ctx {
  flex: none;
  margin: 12px 16px 0;

  :deep(.ant-card-body) {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 16px;
  }
}

.ws-ctx__back {
  flex: none;
  font-size: 12px;
  color: hsl(var(--primary));
  cursor: pointer;
  background: none;
  border: none;
}

/* 工作区切换下拉：伪装成纯文本（跟原设计一致，但可点开切换） */
.ws-ctx__pick {
  min-width: 160px;
  max-width: 320px;

  :deep(.ant-select-selector) {
    padding: 0 4px !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.ant-select-selection-item) {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  :deep(.ant-select-arrow) {
    color: hsl(var(--muted-foreground));
  }
}

.ws-ctx__flag {
  flex: none;
  padding: 1px 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
  border-radius: 999px;
}

.ws-domain__body {
  flex: 1;
  min-height: 0;
}
</style>
