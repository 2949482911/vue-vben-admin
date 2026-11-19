<script lang="ts" setup name="CanvasWorkspace">
import type { CanvasFlowNode, CanvasFlowNodeData } from './store';

import type { MaterialItem, NovelAssetGraph } from '#/api/models/ai_asset';

import { computed, onBeforeUnmount, ref, watch } from 'vue';

import {
  CloseOutlined,
  LinkOutlined,
  PictureOutlined,
} from '@ant-design/icons-vue';
import { Button, Empty, Input, Segmented, Tag } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { formatApiError, parseApiError } from '../error';
import { useCanvasGraphStore } from './store';

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

const store = useCanvasGraphStore();
const keyword = ref('');
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
  const kind = mediaKind.value;
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
  if (!props.novelId || !needsEntities.value) {
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
  if (acting.value) {
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
  if (acting.value) {
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

watch(mediaKind, (kind) => {
  if (!kind) {
    materials.value = [];
    materialError.value = '';
    return;
  }
  void loadMaterials();
});

watch(keyword, () => {
  if (mediaKind.value) {
    scheduleMaterials();
  }
});

watch(
  [() => props.novelId, needsEntities],
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

      <section v-if="node" class="canvas-workspace__section">
        <div class="canvas-workspace__section-title">
          {{ mediaKind ? '绑定素材' : needsEntities ? '应用实体' : '节点数据' }}
        </div>

        <template v-if="mediaKind">
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
        </template>

        <template v-else-if="needsEntities">
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
        </template>

        <template v-else-if="nodeKind === 'shot'">
          <div class="canvas-workspace__readonly">
            <div><span>label</span><b>{{ node.data.label }}</b></div>
            <div><span>body</span><b>{{ node.data.body || '—' }}</b></div>
            <div><span>status</span><b>{{ node.data.nodeStatus || 'ready' }}</b></div>
          </div>
          <Empty
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
    overflow-y: auto;
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
      font-weight: 500;
      color: hsl(var(--foreground));
      word-break: break-all;
    }
  }
}
</style>
