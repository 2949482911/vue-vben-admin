<script lang="ts" setup name="CanvasWorkspace">
import type { CanvasFlowNode, CanvasFlowNodeData } from './store';

import type {
  MaterialItem,
  MaterialType,
  NovelAssetGraph,
} from '#/api/models/ai_asset';

import { computed, onBeforeUnmount, ref, watch } from 'vue';

import {
  CloseOutlined,
  LinkOutlined,
  PictureOutlined,
} from '@ant-design/icons-vue';
import { Button, Empty, Input, message, Segmented, Tag } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { formatApiError, parseApiError } from '../error';
import CanvasShotTakes from './CanvasShotTakes.vue';
import { useCanvasGraphStore } from './store';
import {
  canApproveKeyframe as canApproveShotKeyframe,
  isShotGenerating,
  otherBlockerReason,
  segmentModeBlocker,
  segmentVideoBlockReason,
  shotTakeId,
  shotVideoBlockReason,
  useCanvasShotMedia,
} from './useCanvasShotMedia';

type EntityType = 'character' | 'element' | 'scene';
type EntityFilter = 'all' | EntityType;

interface EntityOption {
  hasImage: boolean;
  id: number | string;
  name: string;
  refUrl: string;
  type: EntityType;
  typeLabel: string;
}

const props = defineProps<{
  focusMode?: 'entity' | 'material';
  novelId?: number | string;
}>();

const emit = defineEmits<{ close: [] }>();

const ENTITY_KINDS = new Set(['character', 'entity']);
const MATERIAL_DETAIL_KEYS = new Set([
  'materialId',
  'materialName',
  'materialType',
  'materialUrl',
  'thumbnailUrl',
]);
const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  character: '角色',
  element: '物品',
  scene: '场景',
};
const MATERIAL_STATUS: Record<number, string> = {
  1: '草稿',
  2: '已确认',
  3: '已入库',
};
const LIBRARY_MATERIAL_TYPES: Array<{ label: string; value: MaterialType }> = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '音频', value: 'audio' },
  { label: '文本', value: 'text' },
];

const store = useCanvasGraphStore();
const keyword = ref('');
const libraryType = ref<MaterialType>('video');
const materials = ref<MaterialItem[]>([]);
const materialLoading = ref(false);
const materialError = ref('');
const entityGraph = ref<NovelAssetGraph>();
const entityLoading = ref(false);
const entityError = ref('');
const entityLoadedFor = ref('');
const entityFilter = ref<EntityFilter>('all');
const acting = ref(false);
const actionError = ref('');

let materialTimer: ReturnType<typeof setTimeout> | undefined;

const node = computed<CanvasFlowNode | undefined>(() => {
  const id = store.selectedNodeIds[0];
  return id ? store.nodes.find((item) => item.id === id) : undefined;
});
const nodeKind = computed(() => node.value?.data.kind);
const mediaKind = computed<'audio' | 'image' | 'video' | undefined>(() => {
  const kind = node.value?.data.kind;
  return kind === 'image' || kind === 'video' || kind === 'audio'
    ? kind
    : undefined;
});
const needsEntities = computed(() =>
  Boolean(node.value && ENTITY_KINDS.has(node.value.data.kind)),
);
const needsEntityLibrary = computed(
  () => needsEntities.value || (!node.value && props.focusMode === 'entity'),
);
const effectiveMaterialType = computed<MaterialType | undefined>(() =>
  mediaKind.value
    ? mediaKind.value
    : !node.value && props.focusMode === 'material'
      ? libraryType.value
      : undefined,
);
const bindingTitle = computed(() => {
  if (mediaKind.value) {
    return '绑定素材';
  }
  if (!node.value && props.focusMode === 'material') {
    return '素材库';
  }
  if (needsEntities.value) {
    return '应用实体';
  }
  if (!node.value && props.focusMode === 'entity') {
    return '主体库';
  }
  return '节点数据';
});
const typeLabel = computed(() =>
  nodeKind.value
    ? (store.blueprintOf(nodeKind.value)?.label ?? nodeKind.value)
    : '',
);
const currentAssetId = computed(() =>
  node.value?.data.assetId ? String(node.value.data.assetId) : '',
);

const materialStatusText = (status?: number) =>
  (status !== undefined && MATERIAL_STATUS[status]) || '素材';

const detailText = (key: string) => {
  const value = node.value?.data.details?.[key];
  return typeof value === 'string' ? value : '';
};

const appliedEntityName = computed(() => detailText('entityName'));
const appliedEntityType = computed(() => {
  const type = detailText('entityType');
  return ENTITY_TYPE_LABELS[type as EntityType] ?? type;
});
const appliedEntityHasImage = computed(
  () => node.value?.data.details?.hasImage === true,
);

const shotMedia = useCanvasShotMedia();
const shotId = computed(() =>
  nodeKind.value === 'shot' && node.value?.data.details?.shotId
    ? String(node.value.data.details.shotId)
    : '',
);
const shotMediaState = computed(() =>
  shotId.value
    ? shotMedia.shotState(store.canvas?.id, shotId.value)
    : undefined,
);
const shotStatus = computed(() => shotMediaState.value?.status);
const shotGenerating = computed(() => isShotGenerating(shotStatus.value));
const shotElapsed = computed(() =>
  shotId.value
    ? shotMedia.elapsedSeconds(store.canvas?.id, shotId.value)
    : 0,
);
const shotMediaError = computed(() =>
  shotMediaState.value?.error
    ? formatApiError(shotMediaState.value.error)
    : '',
);
const keyframeTakeSelected = computed(() =>
  Boolean(shotStatus.value?.keyframeTakes?.some((take) => take.isSelected)),
);
const keyframeApproved = computed(
  () => Boolean(shotMediaState.value?.approved || keyframeTakeSelected.value),
);
const canApproveKeyframe = computed(
  () =>
    canApproveShotKeyframe(shotStatus.value) && !keyframeApproved.value,
);
const segmentBlocker = computed(() => segmentModeBlocker(shotStatus.value));
const segmentMode = computed(() => Boolean(segmentBlocker.value));
const otherBlockReason = computed(() =>
  otherBlockerReason(shotStatus.value),
);
const videoBlockReason = computed(() =>
  segmentMode.value
    ? segmentVideoBlockReason(shotStatus.value)
    : shotVideoBlockReason(shotStatus.value) || otherBlockReason.value,
);
const segmentShotCount = computed(
  () => shotStatus.value?.segmentShotCount ?? 0,
);
const shotBlockers = computed(() => shotStatus.value?.blockers ?? []);
const selectingTakeId = ref('');

function requestShotAction(
  type: 'approve' | 'edit' | 'expand' | 'keyframe' | 'segment-video' | 'video',
) {
  if (shotId.value) {
    store.requestShotAction(type, node.value?.id ?? '', shotId.value);
  }
}

async function selectTake(
  take: { id?: number | string; takeId?: number | string },
  kind: 'keyframe' | 'segment-video',
) {
  const id = shotTakeId(take);
  if (!shotId.value || !id || !store.canvas?.id) {
    return;
  }
  selectingTakeId.value = String(id);
  try {
    await shotMedia.selectTake(store.canvas.id, shotId.value, id, kind);
    message.success(
      kind === 'keyframe' ? '已通过并选用关键帧' : '已通过并选用视频',
    );
  } catch (error) {
    const info = parseApiError(error);
    message.error(
      info.notReady || /static resource|接口未就绪/i.test(info.message)
        ? '接口未就绪'
        : formatApiError(info),
    );
  } finally {
    selectingTakeId.value = '';
  }
}

watch(
  () => shotId.value,
  () => {
    if (shotId.value) {
      shotMedia.ensureStatus(store.canvas?.id, shotId.value);
    }
  },
  { immediate: true },
);

const entityOptions = computed<EntityOption[]>(() => {
  const graph = entityGraph.value;
  if (!graph) {
    return [];
  }
  return [
    ...(graph.characters ?? []).map((item) => ({
      hasImage: Boolean(item.hasImage || item.avatarUrl || item.materialThumbnailUrl),
      id: item.id,
      name: item.name,
      refUrl: item.avatarUrl || item.materialThumbnailUrl || item.materialUrl || '',
      type: 'character' as const,
      typeLabel: ENTITY_TYPE_LABELS.character,
    })),
    ...(graph.scenes ?? []).map((item) => ({
      hasImage: Boolean(item.hasImage || item.materialThumbnailUrl),
      id: item.id,
      name: item.name,
      refUrl: item.materialThumbnailUrl || item.materialUrl || '',
      type: 'scene' as const,
      typeLabel: ENTITY_TYPE_LABELS.scene,
    })),
    ...(graph.elements ?? []).map((item) => ({
      hasImage: Boolean(item.hasImage || item.materialThumbnailUrl),
      id: item.id,
      name: item.name,
      refUrl: item.materialThumbnailUrl || item.materialUrl || '',
      type: 'element' as const,
      typeLabel: ENTITY_TYPE_LABELS.element,
    })),
  ];
});

const filteredEntities = computed(() =>
  entityFilter.value === 'all'
    ? entityOptions.value
    : entityOptions.value.filter((item) => item.type === entityFilter.value),
);

const ENTITY_FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '角色', value: 'character' },
  { label: '场景', value: 'scene' },
  { label: '物品', value: 'element' },
];

function isBoundMaterial(material: MaterialItem) {
  return currentAssetId.value === String(material.id);
}

/** 视频/音频的 storageUrl 不是图片，不能直接塞进 img */
function materialPreview(material: MaterialItem) {
  const url = material.thumbnailUrl || material.storageUrl || '';
  return /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(url) ? url : '';
}

function isAppliedEntity(entity: EntityOption) {
  return String(node.value?.data.details?.entityId ?? '') === String(entity.id);
}

async function loadMaterials() {
  const kind = effectiveMaterialType.value;
  if (!kind) {
    materials.value = [];
    materialError.value = '';
    return;
  }
  materialLoading.value = true;
  materialError.value = '';
  try {
    const result = await aiAssetApi.fetchMaterialList({
      materialType: kind,
      name: keyword.value.trim() || undefined,
      page: 1,
      pageSize: 60,
    });
    materials.value = result?.items ?? [];
  } catch (error) {
    materials.value = [];
    materialError.value = formatApiError(parseApiError(error));
  } finally {
    materialLoading.value = false;
  }
}

function scheduleMaterials() {
  if (materialTimer) {
    clearTimeout(materialTimer);
  }
  materialTimer = setTimeout(() => {
    materialTimer = undefined;
    void loadMaterials();
  }, 300);
}

async function loadEntities() {
  if (!props.novelId || !needsEntityLibrary.value) {
    return;
  }
  if (entityLoadedFor.value === String(props.novelId)) {
    return;
  }
  entityLoading.value = true;
  entityError.value = '';
  try {
    entityGraph.value = await aiAssetApi.fetchNovelAssetGraph(
      props.novelId,
      true,
    );
    entityLoadedFor.value = String(props.novelId);
  } catch (error) {
    entityGraph.value = undefined;
    entityError.value = formatApiError(parseApiError(error));
  } finally {
    entityLoading.value = false;
  }
}

async function persist(patch: Partial<CanvasFlowNodeData>) {
  const current = node.value;
  if (!current) {
    return;
  }
  acting.value = true;
  actionError.value = '';
  store.updateNodeData(current.id, patch);
  const saved = await store.flushSave();
  if (!saved) {
    actionError.value = store.conflict
      ? '画布版本冲突：请刷新后重试'
      : store.error || '保存失败，请重试';
  }
  acting.value = false;
}

async function bindMaterial(material: MaterialItem) {
  if (acting.value || !mediaKind.value) {
    return;
  }
  await persist({
    assetId: String(material.id),
    referenceIds: [material.id],
    details: {
      ...(node.value?.data.details ?? {}),
      materialId: material.id,
      materialName: material.name ?? '',
      materialType: material.materialType ?? mediaKind.value,
      materialUrl: material.storageUrl ?? '',
      thumbnailUrl: material.thumbnailUrl || material.storageUrl || '',
    },
  });
}

async function unbindMaterial() {
  const details = node.value?.data.details ?? {};
  const rest = Object.fromEntries(
    Object.entries(details).filter(([key]) => !MATERIAL_DETAIL_KEYS.has(key)),
  );
  await persist({ assetId: null, referenceIds: [], details: rest });
}

async function applyEntity(entity: EntityOption) {
  if (acting.value || !needsEntities.value) {
    return;
  }
  await persist({
    details: {
      ...(node.value?.data.details ?? {}),
      entityId: entity.id,
      entityName: entity.name,
      entityType: entity.type,
      hasImage: entity.hasImage,
      refUrl: entity.refUrl,
    },
  });
}

watch(
  effectiveMaterialType,
  (kind) => {
    if (!kind) {
      materials.value = [];
      materialError.value = '';
      return;
    }
    void loadMaterials();
  },
  { immediate: true },
);

watch(keyword, () => {
  if (effectiveMaterialType.value) {
    scheduleMaterials();
  }
});

watch(
  [() => props.novelId, needsEntityLibrary],
  ([id, need]) => {
    if (!id || !need) {
      return;
    }
    if (String(id) !== entityLoadedFor.value) {
      entityGraph.value = undefined;
    }
    void loadEntities();
  },
  { immediate: true },
);

watch(
  () => nodeKind.value,
  (kind) => {
    entityFilter.value = kind === 'character' ? 'character' : 'all';
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (materialTimer) {
    clearTimeout(materialTimer);
  }
});
</script>

<template>
  <aside class="canvas-workspace" aria-label="画布工作区">
    <div class="canvas-workspace__head">
      <span class="canvas-workspace__title">画布工作区</span>
      <span class="canvas-workspace__spacer"></span>
      <button
        class="canvas-workspace__close"
        type="button"
        title="收起工作区"
        @click="emit('close')"
      >
        <CloseOutlined />
      </button>
    </div>

    <div class="canvas-workspace__body">
      <section class="canvas-workspace__section">
        <div class="canvas-workspace__section-title">选中节点</div>
        <Empty
          v-if="!node"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="在画布中选中一个节点"
        />
        <template v-else>
          <div class="canvas-workspace__node">
            <span class="canvas-workspace__node-kind">{{ typeLabel }}</span>
            <b>{{ node.data.label }}</b>
            <Tag :bordered="false">{{ node.data.nodeStatus || 'ready' }}</Tag>
          </div>
          <div v-if="node.data.body" class="canvas-workspace__body-text">
            {{ node.data.body }}
          </div>
          <div v-if="node.data.groupClientId" class="canvas-workspace__meta">
            已在分组中
          </div>
        </template>
      </section>

      <section v-if="node || focusMode" class="canvas-workspace__section">
        <div class="canvas-workspace__section-title">
          {{ bindingTitle }}
        </div>

        <template v-if="mediaKind || (!node && focusMode === 'material')">
          <Select
            v-if="!mediaKind"
            v-model:value="libraryType"
            :options="LIBRARY_MATERIAL_TYPES"
            size="small"
          />
          <Input
            v-model:value="keyword"
            allow-clear
            placeholder="搜索素材名称"
            size="small"
          />
          <div v-if="materialLoading" class="canvas-workspace__hint">
            素材加载中…
          </div>
          <div v-else-if="materialError" class="canvas-workspace__hint is-error">
            {{ materialError }}
          </div>
          <Empty
            v-else-if="!materials.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无可用素材"
          />
          <div v-else class="canvas-workspace__list">
            <button
              v-for="material in materials"
              :key="material.id"
              class="canvas-workspace__item"
              :class="{ 'is-active': isBoundMaterial(material) }"
              :disabled="!mediaKind"
              type="button"
              @click="bindMaterial(material)"
            >
              <img
                v-if="materialPreview(material)"
                :src="materialPreview(material)"
                alt=""
                class="canvas-workspace__thumb"
              />
              <span v-else class="canvas-workspace__thumb is-empty">
                <PictureOutlined />
              </span>
              <span class="canvas-workspace__item-main">
                <span class="canvas-workspace__item-name">
                  {{ material.name || `素材 #${material.id}` }}
                </span>
                <span class="canvas-workspace__item-meta">
                  {{ materialStatusText(material.status) }} · #{{ material.id }}
                </span>
              </span>
              <Tag v-if="isBoundMaterial(material)" :bordered="false" color="blue">
                已绑定
              </Tag>
            </button>
          </div>
          <Button
            v-if="currentAssetId"
            :disabled="acting"
            block
            size="small"
            @click="unbindMaterial"
          >
            解绑素材
          </Button>
          <div v-if="!mediaKind" class="canvas-workspace__hint">
            在画布选中 image/video/audio 节点后可绑定素材。
          </div>
        </template>

        <template v-else-if="needsEntities || (!node && focusMode === 'entity')">
          <div v-if="entityLoading" class="canvas-workspace__hint">
            项目实体加载中…
          </div>
          <div v-else-if="entityError" class="canvas-workspace__hint is-error">
            {{ entityError }}
          </div>
          <template v-else>
            <div
              v-if="appliedEntityName"
              class="canvas-workspace__applied"
            >
              已应用：{{ appliedEntityName }}（{{ appliedEntityType }}）
              <Tag :bordered="false" :color="appliedEntityHasImage ? 'blue' : 'default'">
                {{ appliedEntityHasImage ? '有参考图' : '无参考图' }}
              </Tag>
            </div>
            <Segmented
              v-model:value="entityFilter"
              :options="ENTITY_FILTER_OPTIONS"
              block
              size="small"
            />
            <Empty
              v-if="!filteredEntities.length"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="暂无项目实体"
            />
            <div v-else class="canvas-workspace__list">
              <button
                v-for="entity in filteredEntities"
                :key="`${entity.type}-${entity.id}`"
                class="canvas-workspace__item"
                :class="{ 'is-active': isAppliedEntity(entity) }"
                :disabled="!needsEntities"
                type="button"
                @click="applyEntity(entity)"
              >
                <img
                  v-if="entity.refUrl"
                  :src="entity.refUrl"
                  alt=""
                  class="canvas-workspace__thumb"
                />
                <span v-else class="canvas-workspace__thumb is-empty">
                  {{ entity.name.slice(0, 1) }}
                </span>
                <span class="canvas-workspace__item-main">
                  <span class="canvas-workspace__item-name">{{ entity.name }}</span>
                  <span class="canvas-workspace__item-meta">
                    {{ entity.typeLabel }} · {{ entity.hasImage ? '有参考图' : '无参考图' }}
                  </span>
                </span>
                <Tag v-if="isAppliedEntity(entity)" :bordered="false" color="blue">
                  已应用
                </Tag>
              </button>
            </div>
          </template>
          <div v-if="!needsEntities" class="canvas-workspace__hint">
            在画布选中 entity/character 节点后可应用实体。
          </div>
        </template>

        <template v-else-if="node && nodeKind === 'text'">
          <div class="canvas-workspace__readonly">
            <div><span>body</span><b>{{ node.data.body || '—' }}</b></div>
          </div>
          <Button
            :disabled="!store.episodeId || !node.data.body?.trim()"
            block
            size="small"
            @click="store.requestSplit(node.id)"
          >
            拆成分镜
          </Button>
          <div v-if="!store.episodeId" class="canvas-workspace__hint">
            先在顶部选择剧集
          </div>
          <div
            v-else-if="!node.data.body?.trim()"
            class="canvas-workspace__hint"
          >
            文本内容为空，无法拆分
          </div>
        </template>

        <template v-else-if="node && nodeKind === 'shot'">
          <div class="canvas-workspace__readonly">
            <div><span>label</span><b>{{ node.data.label }}</b></div>
            <div><span>body</span><b>{{ node.data.body || '—' }}</b></div>
            <div><span>status</span><b>{{ node.data.nodeStatus || 'ready' }}</b></div>
          </div>
          <template v-if="shotId">
            <div class="canvas-workspace__shot-status">
              <Tag :bordered="false">
                分镜状态 {{ shotStatus?.generationStatus ?? '—' }}
              </Tag>
              <Tag :bordered="false">
                关键帧 {{ shotStatus?.keyframeStatus ?? '—' }}
              </Tag>
              <Tag
                v-if="shotStatus?.storyboardStatus !== undefined"
                :bordered="false"
              >
                分镜确认 {{ shotStatus.storyboardStatus }}
              </Tag>
              <Tag
                v-if="shotGenerating"
                :bordered="false"
                color="processing"
              >
                生成中{{ shotElapsed ? ` · ${shotElapsed}s` : '' }}
              </Tag>
              <Tag v-if="keyframeApproved" :bordered="false" color="success">
                关键帧已通过
              </Tag>
            </div>
            <video
              v-if="shotStatus?.segmentVideoUrl"
              :poster="shotStatus.segmentVideoThumbnailUrl || undefined"
              :src="shotStatus.segmentVideoUrl"
              class="canvas-workspace__shot-video"
              controls
              preload="metadata"
            ></video>
            <video
              v-else-if="shotStatus?.videoUrl"
              :poster="shotStatus.videoThumbnailUrl || undefined"
              :src="shotStatus.videoUrl"
              class="canvas-workspace__shot-video"
              controls
              preload="metadata"
            ></video>
            <img
              v-else-if="
                shotStatus?.segmentVideoThumbnailUrl ||
                shotStatus?.videoThumbnailUrl ||
                shotStatus?.keyframeThumbnailUrl ||
                shotStatus?.keyframeUrl
              "
              :src="
                shotStatus.segmentVideoThumbnailUrl ||
                shotStatus.videoThumbnailUrl ||
                shotStatus.keyframeThumbnailUrl ||
                shotStatus.keyframeUrl ||
                ''
              "
              alt=""
              class="canvas-workspace__shot-thumb"
            />
            <ul
              v-if="shotBlockers.length"
              class="canvas-workspace__shot-blockers"
            >
              <li v-for="(blocker, index) in shotBlockers" :key="index">
                {{ blocker.message }}
                <template v-if="blocker.action">
                  （{{ blocker.action }}）
                </template>
              </li>
            </ul>
            <CanvasShotTakes
              :selecting-take-id="selectingTakeId"
              :selected-url="shotStatus?.keyframeUrl || shotStatus?.keyframeThumbnailUrl"
              :takes="shotStatus?.keyframeTakes"
              kind="keyframe"
              @select="selectTake($event, 'keyframe')"
            />
            <CanvasShotTakes
              :selecting-take-id="selectingTakeId"
              :selected-url="shotStatus?.segmentVideoUrl || shotStatus?.segmentVideoThumbnailUrl"
              :takes="shotStatus?.segmentTakes"
              kind="segment-video"
              @select="selectTake($event, 'segment-video')"
            />
            <div class="canvas-workspace__shot-actions">
              <Button
                :disabled="shotGenerating"
                size="small"
                @click="requestShotAction('keyframe')"
              >
                重新出图
              </Button>
              <Button
                :disabled="Boolean(videoBlockReason) || shotGenerating"
                :title="videoBlockReason || (segmentMode ? '生成本段视频' : '生成真实视频')"
                size="small"
                @click="requestShotAction(segmentMode ? 'segment-video' : 'video')"
              >
                {{ segmentMode ? '生成本段' : '生成视频' }}
              </Button>
              <Button
                v-if="canApproveKeyframe"
                size="small"
                @click="requestShotAction('approve')"
              >
                审批关键帧
              </Button>
              <Button size="small" @click="requestShotAction('edit')">
                编辑
              </Button>
              <Button size="small" @click="requestShotAction('expand')">
                展开
              </Button>
            </div>
            <div v-if="segmentBlocker" class="canvas-workspace__hint">
              {{ segmentBlocker.message }}
              <template v-if="segmentShotCount">
                （本段 {{ segmentShotCount }} 镜）
              </template>
            </div>
            <div v-if="videoBlockReason" class="canvas-workspace__hint">
              {{ videoBlockReason }}
            </div>
            <div v-if="shotMediaError" class="canvas-workspace__hint is-error">
              {{ shotMediaError }}
            </div>
          </template>
          <Empty
            v-else
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="画布节点未绑定真实分镜记录"
          />
        </template>

        <Empty
          v-else
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="该节点类型暂无可绑定数据"
        />

        <div v-if="actionError" class="canvas-workspace__hint is-error">
          {{ actionError }}
        </div>
        <div v-if="acting" class="canvas-workspace__hint">
          <LinkOutlined /> 绑定保存中…
        </div>
      </section>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.canvas-workspace {
  display: flex;
  flex: none;
  flex-direction: column;
  width: 320px;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background: hsl(var(--card));
  border-left: 1px solid hsl(var(--border));

  &__head {
    display: flex;
    flex: none;
    gap: 6px;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__spacer {
    flex: 1;
  }

  &__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 4px;

    &:hover {
      color: hsl(var(--foreground));
      background: hsl(var(--accent));
    }
  }

  &__body {
    flex: 1;
    min-height: 0;
    padding: 10px;
    overflow: hidden auto;
  }

  &__section {
    margin-bottom: 12px;

    :deep(.ant-empty) {
      margin: 12px 0;
    }

    :deep(.ant-empty-description) {
      font-size: 12px;
    }
  }

  &__section-title {
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__node {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: hsl(var(--foreground));

    b {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__node-kind {
    flex: none;
    padding: 1px 6px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
    border-radius: 999px;
  }

  &__body-text {
    display: -webkit-box;
    margin-top: 6px;
    overflow: hidden;
    -webkit-line-clamp: 3;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
  }

  &__meta {
    margin-top: 4px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__hint {
    margin-top: 8px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));

    &.is-error {
      color: hsl(var(--destructive));
    }
  }

  &__applied {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    min-width: 0;
    margin-bottom: 8px;
    font-size: 12px;
    color: hsl(var(--foreground));
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 320px;
    margin: 8px 0;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 4px 6px;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;

    &:hover {
      background: hsl(var(--accent));
    }

    &.is-active {
      background: hsl(var(--primary) / 6%);
      border-color: hsl(var(--primary));
    }
  }

  &__thumb {
    flex: none;
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;

    &.is-empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: hsl(var(--muted-foreground));
      background: hsl(var(--accent));
    }
  }

  &__item-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__item-name {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    font-weight: 500;
    color: hsl(var(--foreground));
    white-space: nowrap;
  }

  &__item-meta {
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__readonly {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
    font-size: 12px;

    div {
      display: flex;
      gap: 8px;
    }

    span {
      flex: none;
      width: 48px;
      color: hsl(var(--muted-foreground));
    }

    b {
      min-width: 0;
      font-weight: 500;
      color: hsl(var(--foreground));
      overflow-wrap: anywhere;
    }
  }

  &__shot-status {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
  }

  &__shot-thumb {
    width: 100%;
    max-height: 160px;
    margin-bottom: 8px;
    object-fit: cover;
    border-radius: 8px;
  }

  &__shot-video {
    width: 100%;
    max-height: 180px;
    margin-bottom: 8px;
    border-radius: 8px;
  }

  &__shot-blockers {
    padding-left: 16px;
    margin: 0 0 8px;
    font-size: 11px;
    color: hsl(var(--destructive));
    overflow-wrap: anywhere;
  }

  &__shot-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }
}
</style>
