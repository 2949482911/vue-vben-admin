<script lang="ts" setup name="WorkflowArchivePanel">
import type { DramaApiError } from '../../error';

import type {
  WorkflowArchiveEntityItem,
  WorkflowArchiveResult,
  WorkflowTask,
} from '#/api/models/ai_asset_workflow';

import { computed, ref } from 'vue';

import {
  DownOutlined,
  ReloadOutlined,
  RightOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Image,
  Skeleton,
  Tag,
} from 'ant-design-vue';

import { formatApiError } from '../../error';
import {
  entityStatusMeta,
  type NavigatePayload,
  type NavigateTarget,
  normalizeKey,
  sectionStatusMeta,
  taskStatusMeta,
} from './meta';

const props = defineProps<{
  archive?: WorkflowArchiveResult;
  error?: DramaApiError;
  loading: boolean;
  novelId?: number | string;
  task?: WorkflowTask;
}>();

const emit = defineEmits<{
  navigate: [payload: NavigatePayload];
  refresh: [];
}>();

interface ArchiveViewSection {
  action?: string;
  countText?: string;
  items?: WorkflowArchiveEntityItem[];
  key: string;
  label: string;
  status?: string;
  summary?: string;
  target: NavigateTarget;
}

interface ArchiveGroup {
  items: WorkflowArchiveEntityItem[];
  key: string;
  label: string;
}

const openSections = ref<Record<string, boolean>>({});

const taskMeta = computed(() => taskStatusMeta(props.task?.status));

const sections = computed<ArchiveViewSection[]>(() => {
  const data = props.archive;
  const episodes = data?.episodes;
  const entities = data?.entities;
  const script = data?.script;
  const storyboard = data?.storyboard;
  const assetViews = data?.assetViews;
  const media = data?.media;

  const stageStatus = (key: string) =>
    props.task?.stages?.find(
      (candidate) => normalizeKey(candidate.stage) === normalizeKey(key),
    )?.status;

  const mediaStatus = (ready?: number, total?: number) => {
    if (total === undefined) {
      return undefined;
    }
    if (total === 0) {
      return 'empty';
    }
    return (ready ?? 0) >= total ? 'ready' : 'running';
  };

  return [
    {
      action: '修改内容',
      countText: episodes
        ? `${episodes.total ?? 0} 集 · 已投影 ${episodes.projected ?? 0} 集`
        : undefined,
      key: 'story',
      label: '剧情',
      status: (episodes?.total ?? 0) > 0 ? 'ready' : undefined,
      summary: data?.novelName ? `《${data.novelName}》` : undefined,
      target: 'script',
    },
    {
      action: '改选',
      key: 'style',
      label: '风格',
      status: data?.visualStyle ? 'ready' : undefined,
      summary: data?.visualStyle,
      target: 'style',
    },
    {
      action: '修改内容',
      countText: entities
        ? `${entities.processed ?? 0}/${entities.total ?? 0}`
        : undefined,
      items: entities?.items ?? [],
      key: 'entities',
      label: '实体',
      status: entities?.status,
      summary: entities
        ? `人物 ${entities.characters ?? 0} · 场景 ${entities.scenes ?? 0} · 物品 ${entities.elements ?? 0}`
        : undefined,
      target: 'entities',
    },
    {
      action: '修改内容',
      countText: script
        ? `${script.finalized ?? 0}/${script.total ?? 0}`
        : undefined,
      key: 'script',
      label: '剧本',
      status: script?.status,
      target: 'script',
    },
    {
      action: '修改内容',
      countText: storyboard
        ? `${storyboard.shotCount ?? 0} 镜`
        : undefined,
      key: 'storyboard',
      label: '分镜',
      status: storyboard?.status,
      summary: storyboard
        ? `${storyboard.segmentCount ?? 0} 个分镜 · 已通过 ${storyboard.approvedEpisodes ?? 0} 集`
        : undefined,
      target: 'storyboard',
    },
    {
      countText: assetViews
        ? `${assetViews.ready ?? 0}/${assetViews.required ?? 0}`
        : undefined,
      key: 'three_view',
      label: '三视图',
      status: assetViews?.status ?? stageStatus('asset_view'),
      target: 'storyboard',
    },
    {
      countText: media
        ? `${media.imageReady ?? 0}/${media.imageTotal ?? 0}`
        : undefined,
      key: 'keyframe',
      label: '分镜图',
      status:
        stageStatus('storyboard_image') ??
        mediaStatus(media?.imageReady, media?.imageTotal),
      target: 'storyboard',
    },
    {
      countText: media
        ? `${media.videoReady ?? 0}/${media.videoTotal ?? 0}`
        : undefined,
      key: 'video',
      label: '视频',
      status:
        stageStatus('video') ??
        mediaStatus(media?.videoReady, media?.videoTotal),
      target: 'storyboard',
    },
    {
      countText: data?.corePlot?.length
        ? `${data.corePlot.length} 条`
        : undefined,
      key: 'core_plot',
      label: '核心情节',
      status: data?.corePlot?.length ? 'ready' : undefined,
      target: 'script',
    },
  ];
});

function isOpen(section: ArchiveViewSection) {
  const override = openSections.value[section.key];
  if (override !== undefined) {
    return override;
  }
  return (
    normalizeKey(section.status) !== 'pending' ||
    (section.items?.length ?? 0) > 0
  );
}

function toggle(section: ArchiveViewSection) {
  openSections.value = {
    ...openSections.value,
    [section.key]: !isOpen(section),
  };
}

function entityGroups(section: ArchiveViewSection): ArchiveGroup[] {
  const labels: Record<string, string> = {
    character: '人物',
    element: '物品',
    scene: '场景',
  };
  const groups = new Map<string, WorkflowArchiveEntityItem[]>();
  for (const item of section.items ?? []) {
    const type = normalizeKey(item.type);
    const key = type in labels ? type : 'other';
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([key, items]) => ({
    items,
    key,
    label: labels[key] ?? '',
  }));
}

function itemImage(item: WorkflowArchiveEntityItem) {
  return item.thumbnailUrl ?? item.imageUrl;
}

function entityTarget(
  group: ArchiveGroup,
  item: WorkflowArchiveEntityItem,
): NavigatePayload {
  const groupKey = group.key;
  const valid =
    groupKey === 'character' ||
    groupKey === 'element' ||
    groupKey === 'scene';
  return {
    entityId: item.id,
    entityName: item.name,
    group: valid ? groupKey : undefined,
    target: 'entities',
  };
}
</script>

<template>
  <div class="workflow-archive">
    <div class="workflow-archive__head">
      <span class="workflow-archive__title">档案</span>
      <Tag
        v-if="task"
        :bordered="false"
        :color="taskMeta.color"
      >
        {{ taskMeta.label }}
      </Tag>
      <span class="workflow-archive__spacer"></span>
      <Button
        :disabled="!novelId"
        :loading="loading"
        size="small"
        type="text"
        @click="emit('refresh')"
      >
        <template #icon><ReloadOutlined /></template>
      </Button>
    </div>

    <Alert
      v-if="error"
      :message="formatApiError(error)"
      :type="error.notReady ? 'info' : 'error'"
      show-icon
    />

    <div class="workflow-archive__body">
      <div
        v-for="section in sections"
        :key="section.key"
        class="workflow-archive-section"
      >
        <button
          class="workflow-archive-section__head"
          type="button"
          @click="toggle(section)"
        >
          <span class="workflow-archive-section__label">
            {{ section.label }}
          </span>
          <Tag
            :bordered="false"
            :color="sectionStatusMeta(section.status).color"
          >
            {{ sectionStatusMeta(section.status).label }}
          </Tag>
          <span class="workflow-archive-section__count">
            {{ section.countText }}
          </span>
          <span class="workflow-archive-section__spacer"></span>
          <DownOutlined v-if="isOpen(section)" />
          <RightOutlined v-else />
        </button>

        <div v-show="isOpen(section)" class="workflow-archive-section__body">
          <div v-if="section.summary" class="workflow-archive-section__summary">
            {{ section.summary }}
          </div>

          <Skeleton
            v-if="
              normalizeKey(section.status) === 'running' &&
              !(section.items?.length ?? 0)
            "
            :paragraph="{ rows: 2 }"
            active
          />

          <div
            v-else-if="!(section.items?.length ?? 0)"
            class="workflow-archive-section__empty"
          >
            {{ normalizeKey(section.status) === 'pending' ? '待生成' : '暂无明细' }}
          </div>

          <template v-else>
            <div
              v-for="group in entityGroups(section)"
              :key="group.key"
              class="workflow-entity-group"
            >
              <div v-if="group.label" class="workflow-entity-group__title">
                {{ group.label }} {{ group.items.length }}
              </div>
              <div
                v-for="item in group.items"
                :key="item.id"
                class="workflow-entity-item"
              >
                <Image
                  v-if="itemImage(item)"
                  :src="itemImage(item)"
                  :preview="{ src: itemImage(item) }"
                  class="workflow-entity-item__image"
                />
                <div v-else class="workflow-entity-item__placeholder">
                  无图
                </div>
                <div class="workflow-entity-item__content">
                  <div class="workflow-entity-item__name">
                    {{ item.name || '未命名' }}
                  </div>
                  <div
                    v-if="item.description"
                    class="workflow-entity-item__desc"
                  >
                    {{ item.description }}
                  </div>
                  <div class="workflow-entity-item__meta">
                    <Tag v-if="item.voiceName" :bordered="false" color="blue">
                      {{ item.voiceName }}
                    </Tag>
                    <Tag v-if="item.reused" :bordered="false" color="blue">
                      复用
                    </Tag>
                    <Tag
                      v-if="item.status"
                      :bordered="false"
                      :color="entityStatusMeta(item.status).color"
                    >
                      {{ entityStatusMeta(item.status).label }}
                    </Tag>
                  </div>
                </div>
                <Button
                  size="small"
                  type="text"
                  @click="emit('navigate', entityTarget(group, item))"
                >
                  {{ itemImage(item) ? '换成我的图' : '上传图片' }}
                </Button>
              </div>
            </div>
          </template>

          <Button
            v-if="section.action"
            size="small"
            type="link"
            @click="emit('navigate', { target: section.target })"
          >
            {{ section.action }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.workflow-archive {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;

  &__head {
    display: flex;
    flex: none;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__spacer {
    flex: 1;
  }

  &__body {
    flex: 1;
    min-height: 0;
    padding: 8px;
    overflow-y: auto;
  }
}

.workflow-archive-section {
  margin-bottom: 6px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &__head {
    display: flex;
    gap: 6px;
    align-items: center;
    width: 100%;
    padding: 8px 10px;
    font-size: 13px;
    color: hsl(var(--foreground));
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  &__label {
    font-weight: 500;
  }

  &__count {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__spacer {
    flex: 1;
  }

  &__body {
    padding: 0 10px 10px;
  }

  &__summary {
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
  }

  &__empty {
    padding: 8px 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.workflow-entity-group {
  margin-bottom: 6px;

  &__title {
    margin: 6px 0 4px;
    font-size: 12px;
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }
}

.workflow-entity-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 6px;
  margin-bottom: 4px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;

  &__image {
    flex: none;
    width: 48px;
    height: 48px;
    overflow: hidden;
    border-radius: 6px;

    :deep(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__placeholder {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
    border-radius: 6px;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 13px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__desc {
    display: -webkit-box;
    margin-top: 2px;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    font-size: 12px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;

    :deep(.ant-tag) {
      margin: 0;
    }
  }
}
</style>
