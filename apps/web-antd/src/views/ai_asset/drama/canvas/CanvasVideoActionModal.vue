<script lang="ts" setup name="CanvasVideoActionModal">
import type { CanvasFlowNode } from './store';

import type {
  CanvasVideoAssetItem,
} from '#/api/models/ai_asset_canvas';

import { computed, onMounted, ref } from 'vue';

import { Alert, Button, message, Modal, Tag, Upload } from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { aiAssetCanvasApi } from '#/api/core/ai_asset_canvas';

import { useAssetUpload } from '../../useAssetUpload';
import { formatApiError, parseApiError } from '../error';
import { useCanvasGraphStore } from './store';

const props = defineProps<{
  canvasId?: string;
  episodeId?: number | string;
  node: CanvasFlowNode;
  type: 'preview' | 'replace' | 'upload';
}>();

const emit = defineEmits<{ close: [] }>();

const store = useCanvasGraphStore();
const { upload } = useAssetUpload('ai-asset/canvas-video');
const assets = ref<CanvasVideoAssetItem[]>([]);
const loading = ref(false);
const acting = ref(false);
const error = ref('');

const details = computed<Record<string, unknown>>(
  () => props.node.data.details ?? {},
);
const videoUrl = computed(() => {
  const url = details.value.url || details.value.materialUrl;
  return typeof url === 'string' ? url : '';
});
const thumbnailUrl = computed(() => {
  const url = details.value.thumbnailUrl;
  return typeof url === 'string' ? url : '';
});

function notReadyText(errorInfo: ReturnType<typeof parseApiError>) {
  return errorInfo.notReady ||
    /static resource|接口未就绪/i.test(errorInfo.message)
    ? '接口未就绪'
    : formatApiError(errorInfo);
}

async function loadAssets() {
  if (!props.canvasId || !props.episodeId) {
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const result = await aiAssetCanvasApi.fetchCanvasVideoAssets(
      props.canvasId,
      props.episodeId,
    );
    assets.value = result?.items ?? [];
  } catch (err) {
    assets.value = [];
    error.value = notReadyText(parseApiError(err));
  } finally {
    loading.value = false;
  }
}

async function bindAsset(asset: CanvasVideoAssetItem) {
  if (
    acting.value ||
    !props.canvasId ||
    asset.takeId === undefined ||
    asset.takeId === null
  ) {
    return;
  }
  acting.value = true;
  error.value = '';
  try {
    const result = await aiAssetCanvasApi.bindCanvasVideoTake(
      props.canvasId,
      props.node.id,
      asset.takeId,
    );
    store.bindVideoTake(
      props.node.id,
      { ...asset, ...result },
      props.episodeId,
    );
    const saved = await store.flushSave();
    if (!saved) {
      error.value = store.conflict
        ? '画布版本冲突：请刷新后重试'
        : store.error || '画布保存失败，请重试';
      return;
    }
    message.success('已绑定段视频');
    emit('close');
  } catch (err) {
    error.value = notReadyText(parseApiError(err));
  } finally {
    acting.value = false;
  }
}

async function onUpload(file: File) {
  if (!props.canvasId || acting.value) {
    return false;
  }
  acting.value = true;
  error.value = '';
  try {
    const storageUrl = await upload(file);
    const material = await aiAssetApi.uploadMaterial({
      materialType: 'video',
      name: file.name,
      storageUrl,
      thumbnailUrl: storageUrl,
    });
    const materialId = String(material.id);
    store.updateNodeData(props.node.id, {
      assetId: materialId,
      body: material.name || '上传视频',
      details: {
        ...details.value,
        sourceType: 'upload',
        materialId,
        materialName: material.name ?? file.name,
        materialUrl: material.storageUrl ?? storageUrl,
        thumbnailUrl: material.thumbnailUrl || storageUrl,
        url: material.storageUrl ?? storageUrl,
      },
      label: material.name || '上传视频',
      referenceIds: [material.id],
    });
    const saved = await store.flushSave();
    if (!saved) {
      error.value = store.conflict
        ? '画布版本冲突：请刷新后重试'
        : store.error || '画布保存失败，请重试';
      return false;
    }
    message.success('视频已上传并绑定');
    emit('close');
  } catch (err) {
    error.value = notReadyText(parseApiError(err));
  } finally {
    acting.value = false;
  }
  return false;
}

onMounted(() => {
  if (props.type === 'replace') {
    void loadAssets();
  }
});
</script>

<template>
  <Modal
    :confirm-loading="acting"
    :footer="null"
    :mask-closable="!acting"
    :open="true"
    :title="
      type === 'replace'
        ? '替换段视频'
        : type === 'upload'
          ? '上传视频'
          : '预览视频'
    "
    width="620px"
    @cancel="emit('close')"
  >
    <Alert
      v-if="!episodeId && type === 'replace'"
      message="先选择剧集后才能查询段视频"
      show-icon
      type="info"
    />
    <Alert v-if="error" :message="error" show-icon type="error" />

    <template v-if="type === 'preview'">
      <video
        v-if="videoUrl"
        :poster="thumbnailUrl || undefined"
        :src="videoUrl"
        class="canvas-video-action__player"
        controls
        preload="metadata"
      ></video>
      <Alert
        v-else
        message="未绑定真实视频（需要 take/material）"
        show-icon
        type="info"
      />
    </template>

    <template v-else-if="type === 'upload'">
      <Upload
        :before-upload="onUpload"
        :disabled="acting"
        :show-upload-list="false"
        accept="video/*"
      >
        <Button :loading="acting" type="primary">
          选择视频上传（OSS 直传 + 素材登记）
        </Button>
      </Upload>
      <div class="canvas-video-action__hint">
        上传素材可用于画布预览，不参与合成（合成只认段视频）。
      </div>
    </template>

    <template v-else>
      <div v-if="loading" class="canvas-video-action__hint">
        段视频加载中…
      </div>
      <div v-else-if="!assets.length" class="canvas-video-action__hint">
        暂无可用段视频
      </div>
      <div v-else class="canvas-video-action__list">
        <button
          v-for="asset in assets"
          :key="String(asset.takeId ?? asset.segmentId)"
          class="canvas-video-action__item"
          type="button"
          :disabled="acting || !asset.url"
          @click="bindAsset(asset)"
        >
          <img
            v-if="asset.thumbnailUrl || asset.url"
            :src="asset.thumbnailUrl || asset.url || ''"
            alt=""
            class="canvas-video-action__thumb"
          />
          <span class="canvas-video-action__main">
            <span class="canvas-video-action__name">
              段{{ asset.segmentSeq ?? '—' }} · take
              {{ asset.takeId ?? '—' }}
            </span>
            <span class="canvas-video-action__meta">
              {{ asset.durationSeconds ?? '—' }}s
              <template v-if="asset.subtitleText">
                · {{ asset.subtitleText.slice(0, 30) }}
              </template>
            </span>
          </span>
          <Tag v-if="asset.selected" :bordered="false" color="success">
            已选中
          </Tag>
        </button>
      </div>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.canvas-video-action__player {
  width: 100%;
  max-height: 360px;
  border-radius: 8px;
}

.canvas-video-action__hint {
  margin-top: 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.canvas-video-action__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 420px;
  margin-top: 8px;
  overflow-y: auto;
}

.canvas-video-action__item {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 5px 6px;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &:hover {
    background: hsl(var(--accent));
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.canvas-video-action__thumb {
  flex: none;
  width: 72px;
  height: 44px;
  object-fit: cover;
  border-radius: 6px;
}

.canvas-video-action__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.canvas-video-action__name {
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.canvas-video-action__meta {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}
</style>
