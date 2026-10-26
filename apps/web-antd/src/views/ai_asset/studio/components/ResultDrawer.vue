<script lang="ts" setup name="StudioResultDrawer">
import type { ChatTaskItem } from '../constants';

/**
 * 生成结果 / 版本链抽屉（useVbenDrawer）
 *
 * 一张任务卡的多图产物 + 逐图操作：
 * - 重新编辑：回填当前素材参数并把 materialId 带回，下次生成即产生新版本
 * - 再次生成：同参数 + 新 requestId 重新出图
 * - 确认定稿：material/confirm（草稿 → 已确认；真正的「入库到营销素材库」在素材库页的入库抽屉）
 * - 版本链：material/version，v1..vN 可切换预览
 */
import type { VersionItem } from '#/api/models/ai_asset';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Image as AntImage,
  Button,
  Empty,
  message,
  Spin,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { MATERIAL_STATUS_MAP, TASK_STATUS_MAP } from '../../constants';

const emit = defineEmits<{
  confirm: [];
  reedit: [task: ChatTaskItem, materialId: number | string];
  regenerate: [task: ChatTaskItem];
}>();
/** 当前选中的产物下标 / 版本链 */
const activeIndex = ref(0);
const activeVersionId = ref<number | string>();
const versions = ref<VersionItem[]>([]);
const versionsLoading = ref(false);
const confirming = ref(false);

const task = ref<ChatTaskItem | null>(null);

const outputs = computed(() => task.value?.outputs ?? []);

/** 当前预览地址：优先版本链里选中的，其次当前产物 */
const previewUrl = computed(() => {
  if (activeVersionId.value !== undefined) {
    const version = versions.value.find(
      (item) => String(item.id) === String(activeVersionId.value),
    );
    if (version?.storageUrl) {
      return version.storageUrl;
    }
  }
  return outputs.value[activeIndex.value]?.url ?? '';
});

const activeOutput = computed(() => outputs.value[activeIndex.value]);
const isVideo = computed(() => activeOutput.value?.materialType === 'video');

const statusMeta = computed(
  () =>
    MATERIAL_STATUS_MAP[activeOutput.value?.status ?? 1] ?? {
      color: 'default',
      label: '草稿',
    },
);

const taskStatusMeta = computed(
  () => TASK_STATUS_MAP[task.value?.status ?? 1] ?? { label: '处理中' },
);

function handleReedit() {
  if (!task.value || !activeOutput.value) {
    return;
  }
  emit('reedit', task.value, activeOutput.value.materialId);
  void drawerApi.close();
}

function handleRegenerate() {
  if (!task.value) {
    return;
  }
  emit('regenerate', task.value);
  void drawerApi.close();
}

async function loadVersions(materialId?: number | string) {
  activeVersionId.value = undefined;
  versions.value = [];
  if (materialId === undefined) {
    return;
  }
  versionsLoading.value = true;
  try {
    versions.value = (await aiAssetApi.fetchVersions(materialId)) ?? [];
  } finally {
    versionsLoading.value = false;
  }
}

function selectOutput(index: number) {
  activeIndex.value = index;
  const output = outputs.value[index];
  void loadVersions(output?.materialId);
}

async function confirmMaterial() {
  const output = activeOutput.value;
  if (!output || output.status !== 1) {
    message.warning('只有「草稿」需要确认定稿');
    return;
  }
  confirming.value = true;
  try {
    await aiAssetApi.confirmMaterial(output.materialId);
    message.success('已确认定稿');
    emit('confirm');
    await drawerApi.close();
  } finally {
    confirming.value = false;
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[720px]',
  closeOnPressEscape: true,
  footer: false,
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    const data = drawerApi.getData() as undefined | { index?: number; task?: ChatTaskItem };
    task.value = data?.task ?? null;
    activeIndex.value = data?.index ?? 0;
    void loadVersions(outputs.value[activeIndex.value]?.materialId);
  },
});
</script>

<template>
  <Drawer title="生成结果">
    <div v-if="task" class="result">
      <!-- 预览 -->
      <div class="result__preview">
        <video
          v-if="previewUrl && isVideo"
          class="result__video"
          controls
          playsinline
          preload="metadata"
          :src="previewUrl"
        ></video>
        <AntImage v-else-if="previewUrl" :src="previewUrl" />
        <Empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="产物生成中" />
      </div>

      <!-- 多图切换 -->
      <div v-if="outputs.length > 1" class="result__thumbs">
        <button
          v-for="(output, index) in outputs"
          :key="output.materialId"
          class="result__thumb"
          :class="{ 'is-on': index === activeIndex }"
          type="button"
          @click="selectOutput(index)"
        >
          <video
            v-if="output.materialType === 'video'"
            muted
            playsinline
            preload="metadata"
            :src="output.url"
          ></video>
          <img v-else :alt="`产物 ${index + 1}`" :src="output.url" />
        </button>
      </div>

      <!-- 基本信息 -->
      <div class="result__meta">
        <Tag :bordered="false" :color="statusMeta.color">{{ statusMeta.label }}</Tag>
        <Tag :bordered="false">{{ taskStatusMeta.label }}</Tag>
        <span>{{ task.modelLabel }}</span>
        <span>· {{ task.ratio === 'smart' ? '智能比例' : task.ratio }}</span>
        <span>· {{ task.resolution }}</span>
        <span v-if="activeOutput?.duration">· {{ activeOutput.duration }}</span>
        <span>· {{ outputs.length }} {{ isVideo ? '段' : '张' }}</span>
      </div>
      <p class="result__prompt">{{ task.prompt }}</p>

      <!-- 版本链 -->
      <div class="result__versions">
        <span class="result__versions-label">版本链</span>
        <Spin :spinning="versionsLoading">
          <div v-if="versions.length > 0" class="result__version-list">
            <button
              v-for="(version, index) in versions"
              :key="version.id"
              class="result__version"
              :class="{ 'is-on': String(version.id) === String(activeVersionId) }"
              type="button"
              @click="activeVersionId = version.id"
            >
              v{{ version.versionNo ?? index + 1 }}
            </button>
            <Button size="small" type="link" @click="activeVersionId = undefined">
              回到当前
            </Button>
          </div>
          <span v-else class="result__versions-empty">暂无历史版本（首次生成为 v1）</span>
        </Spin>
      </div>

      <!-- 操作 -->
      <div class="result__actions">
        <Button
          :disabled="!activeOutput"
          @click="handleReedit"
        >
          重新编辑
        </Button>
        <Button @click="handleRegenerate">再次生成</Button>
        <Button
          :disabled="activeOutput?.status !== 1"
          :loading="confirming"
          type="primary"
          @click="confirmMaterial"
        >
          确认定稿
        </Button>
      </div>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  background: hsl(var(--accent));
  border-radius: 12px;

  :deep(.ant-image-img) {
    max-height: 360px;
    object-fit: contain;
    border-radius: 12px;
  }
}

.result__video {
  max-width: 100%;
  max-height: 360px;
  background: #000;
  border-radius: 12px;
}

.result__thumbs {
  display: flex;
  gap: 8px;
}

.result__thumb {
  width: 56px;
  height: 56px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: none;
  border: 2px solid transparent;
  border-radius: 8px;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.result__thumb.is-on {
  border-color: hsl(var(--primary));
}

.result__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.result__prompt {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.result__versions {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  background: hsl(var(--accent));
  border-radius: 10px;
}

.result__versions-label {
  flex: none;
  font-size: 12px;
  font-weight: 600;
}

.result__version-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.result__version {
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
}

.result__version.is-on {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.result__versions-empty {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.result__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
