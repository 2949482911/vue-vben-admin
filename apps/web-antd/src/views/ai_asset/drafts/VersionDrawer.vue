<script lang="ts" setup name="AiAssetVersionDrawer">
/**
 * 草稿素材 — 版本链抽屉
 *
 * 展示某素材的多轮迭代版本（versionNo / parentVersionId / params 快照 / 时间）。
 * 接口：material/version?materialId=
 */
import type { VersionItem } from '#/api/models/ai_asset';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Empty, Image, Spin, Tag, Typography } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[560px]',
  closeOnPressEscape: true,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData() as { materialId: number | string };
      drawerApi.setState({ title: `版本链 — 素材 #${data?.materialId ?? ''}` });
      void loadVersions(data?.materialId);
    } else {
      versions.value = [];
    }
  },
});

const loading = ref(false);
const versions = ref<VersionItem[]>([]);

async function loadVersions(materialId?: number | string) {
  if (!materialId) {
    versions.value = [];
    return;
  }
  loading.value = true;
  try {
    versions.value = (await aiAssetApi.fetchVersions(materialId)) ?? [];
  } finally {
    loading.value = false;
  }
}

function snapshotText(snapshot?: null | Record<string, any>): string {
  if (!snapshot) {
    return '-';
  }
  return Object.entries(snapshot)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(' · ');
}
</script>

<template>
  <Drawer>
    <Spin :spinning="loading">
      <div v-if="versions.length" class="ver-list">
        <div v-for="v in versions" :key="v.id" class="ver-item">
          <Image
            v-if="v.storageUrl"
            :src="v.storageUrl"
            :width="64"
            :height="64"
          />
          <div class="ver-item__main">
            <div class="ver-item__hd">
              <Typography.Text strong>v{{ v.versionNo }}</Typography.Text>
              <Tag v-if="v.parentVersionId" :bordered="false">
                父版本 #{{ v.parentVersionId }}
              </Tag>
            </div>
            <Typography.Text type="secondary" class="ver-item__snap">
              {{ snapshotText(v.paramsSnapshot) }}
            </Typography.Text>
            <Typography.Text type="secondary" class="ver-item__time">
              {{ v.createTime || '-' }}
            </Typography.Text>
          </div>
        </div>
      </div>
      <Empty v-else description="暂无版本" />
    </Spin>
  </Drawer>
</template>

<style scoped lang="scss">
.ver-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ver-item {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 4px);
}

.ver-item__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ver-item__hd {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ver-item__snap {
  font-size: 12px;
  word-break: break-all;
}

.ver-item__time {
  font-size: 12px;
}
</style>
