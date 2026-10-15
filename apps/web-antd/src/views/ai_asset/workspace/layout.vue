<script lang="ts" setup name="AiAssetWorkspaceLayout">
/**
 * 工作区域布局（/ai_asset/workspace/:wsId/**）
 *
 * 域上下文条：‹ 全部工作区 + 当前工作区名 + 🔒 数据隔离域。
 * vben 侧边栏没有可插入的插槽（改它要动 packages），所以这条放在域内页面顶部，效果等价。
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useWorkspaceStore } from '#/store';

import { WORKSPACE_BASE_PATH } from './menu';

const router = useRouter();
const workspaceStore = useWorkspaceStore();

const workspaceName = computed(
  () => workspaceStore.workspaceName || `工作区 #${workspaceStore.workspaceId ?? '-'}`,
);

function exitWorkspace() {
  // 优先回全局菜单里那个「工作区」节点的真实路径，拿不到再用约定的基路径
  const target =
    workspaceStore.globalMenus.find((menu) =>
      String(menu.path).endsWith('/workspace'),
    )?.path ?? WORKSPACE_BASE_PATH;
  void router.push(target);
}
</script>

<template>
  <div class="ws-domain">
    <div class="ws-ctx">
      <button class="ws-ctx__back" type="button" @click="exitWorkspace">
        ‹ 全部工作区 · 切换
      </button>
      <span class="ws-ctx__name">{{ workspaceName }}</span>
      <span class="ws-ctx__flag">🔒 数据隔离域</span>
    </div>

    <div class="ws-domain__body">
      <RouterView />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ws-domain {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.ws-ctx {
  display: flex;
  flex: none;
  gap: 10px;
  align-items: center;
  padding: 8px 16px;
  background: color-mix(in srgb, hsl(var(--primary)) 6%, hsl(var(--card)));
  border-bottom: 1px solid hsl(var(--border));
}

.ws-ctx__back {
  font-size: 12px;
  color: hsl(var(--primary));
  cursor: pointer;
  background: none;
  border: none;
}

.ws-ctx__name {
  font-size: 13px;
  font-weight: 600;
}

.ws-ctx__flag {
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
