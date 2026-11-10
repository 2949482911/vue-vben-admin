<script lang="ts" setup name="WorkflowPlanCard">
import type { DramaApiError } from '../../error';

import type {
  WorkflowBlocker,
  WorkflowPlan,
  WorkflowPlanScope,
  WorkflowPlanStage,
} from '#/api/models/ai_asset_workflow';

import { computed } from 'vue';

import { Alert, Button, Card, Image, Tag } from 'ant-design-vue';

import { formatApiError } from '../../error';
import {
  blockerHint,
  blockerNavigate,
  type NavigatePayload,
  normalizeKey,
} from './meta';

const props = defineProps<{
  blockers: WorkflowBlocker[];
  canConfirm: boolean;
  confirmed: boolean;
  error?: DramaApiError;
  expanded: boolean;
  loading: boolean;
  missingFields: string[];
  plan: WorkflowPlan;
  styleReferenceUrl?: string;
}>();

const emit = defineEmits<{
  confirm: [];
  dismiss: [];
  navigate: [payload: NavigatePayload];
  'update:expanded': [value: boolean];
}>();

const STAGE_DEFS: Array<{ key: string; label: string }> = [
  { key: 'style', label: '风格' },
  { key: 'entity', label: '实体' },
  { key: 'storyboard_prompt', label: '分镜与提示词' },
  { key: 'asset_view', label: '三视图' },
  { key: 'storyboard_image', label: '分镜图' },
  { key: 'video', label: '视频' },
];

const ENDPOINT_LABELS: Record<string, string> = {
  storyboard_image: '分镜图',
  storyboard_prompt: '分镜+提示词',
  video: '视频',
};

const planStages = computed<WorkflowPlanStage[]>(() => {
  const stages = props.plan.stages;
  if (stages?.length) {
    return stages;
  }
  return STAGE_DEFS.map((item, index) => ({
    label: item.label,
    stage: item.key,
    step: index + 1,
  }));
});

const styleThumbnail = computed(
  () =>
    props.plan.styleReferenceThumbnailUrl ??
    props.plan.styleReferenceUrl ??
    props.styleReferenceUrl ??
    '',
);

const expectedOutput = computed(() => {
  const volume = props.plan.volume;
  return [
    typeof volume?.imageCount === 'number'
      ? `图片 ${volume.imageCount} 张`
      : '',
    typeof volume?.videoSeconds === 'number'
      ? `视频 ${volume.videoSeconds} 秒`
      : '',
    typeof volume?.shotCount === 'number'
      ? `镜头 ${volume.shotCount} 镜`
      : '',
  ]
    .filter(Boolean)
    .join(' · ');
});

const episodeHint = computed(() => {
  const scope = props.plan.scope;
  const actual = scope?.episodeIds?.length ?? 0;
  if (
    actual > 0 &&
    scope?.targetEpisodeCount !== undefined &&
    scope.targetEpisodeCount !== actual
  ) {
    return `将执行前 ${actual} 集（目标 ${scope.targetEpisodeCount} 集）`;
  }
  return '';
});

function endpointText(value?: string) {
  return (value && ENDPOINT_LABELS[value]) || '—';
}

function episodeText(scope?: WorkflowPlanScope) {
  if (!scope) {
    return '—';
  }
  if (scope.episodeIds?.length) {
    return `${scope.episodeIds.length} 集`;
  }
  if (scope.targetEpisodeCount !== undefined) {
    return `${scope.targetEpisodeCount} 集`;
  }
  if (scope.episodeCount !== undefined) {
    return `${scope.episodeCount} 集`;
  }
  return '—';
}

function booleanText(
  value: boolean | undefined,
  positive: string,
  negative: string,
) {
  if (value === undefined) {
    return '—';
  }
  return value ? positive : negative;
}

function stageAction(value?: string) {
  const action = normalizeKey(value);
  if (action === 'reuse') {
    return { color: 'blue', label: '复用' };
  }
  if (action === 'new') {
    return { color: 'processing', label: '新做' };
  }
  return null;
}

function goBlocker(blocker: WorkflowBlocker) {
  const target = blockerNavigate(blocker);
  if (target) {
    emit('navigate', { target });
  }
}
</script>

<template>
  <div v-if="confirmed && !expanded" class="workflow-plan-summary">
    <Tag :bordered="false" color="success">已确认</Tag>
    <span>任务简报已确认</span>
    <Button size="small" type="link" @click="emit('update:expanded', true)">
      查看
    </Button>
  </div>

  <Card v-else class="workflow-plan" :body-style="{ padding: '12px' }">
    <div class="workflow-plan__head">
      <span class="workflow-plan__title">任务简报</span>
      <Tag :bordered="false" color="default">
        {{ confirmed ? '已确认' : '待确认' }}
      </Tag>
    </div>

    <div
      v-if="plan.understanding?.story || plan.understanding?.summary"
      class="workflow-plan__story"
    >
      <div class="workflow-plan__label">我理解的故事</div>
      <div v-if="plan.understanding?.story">
        {{ plan.understanding.story }}
      </div>
      <div v-if="plan.understanding?.summary" class="workflow-plan__summary">
        {{ plan.understanding.summary }}
      </div>
    </div>

    <div class="workflow-plan__grid">
      <div class="workflow-plan__field">
        <span>终点</span>
        <b>{{ endpointText(plan.endpoint) }}</b>
      </div>
      <div class="workflow-plan__field">
        <span>集数</span>
        <b>{{ episodeText(plan.scope) }}</b>
      </div>
      <div
        v-if="typeof plan.scope?.maxShots === 'number'"
        class="workflow-plan__field"
      >
        <span>镜头</span>
        <b>前 {{ plan.scope.maxShots }} 镜</b>
      </div>
      <div class="workflow-plan__field">
        <span>画面风格</span>
        <div class="workflow-plan__style">
          <b>{{ plan.visualStyle || '—' }}</b>
          <Image
            v-if="styleThumbnail"
            :src="styleThumbnail"
            :preview="{ src: styleThumbnail }"
            class="workflow-plan__style-thumb"
          />
        </div>
      </div>
      <div class="workflow-plan__field">
        <span>横竖屏</span>
        <b>{{ plan.aspectRatio || '—' }}</b>
      </div>
      <div class="workflow-plan__field">
        <span>自动定稿实体</span>
        <b>
          {{ booleanText(plan.autoFinalizeEntities, '开', '关') }}
        </b>
      </div>
    </div>

    <div v-if="episodeHint" class="workflow-plan__hint">
      {{ episodeHint }}
    </div>

    <div v-if="expectedOutput" class="workflow-plan__output">
      <span>预计产出</span>
      <b>{{ expectedOutput }}</b>
    </div>

    <div class="workflow-plan__stages">
      <div class="workflow-plan__label">
        执行计划（{{ planStages.length }} 步）
      </div>
      <div
        v-for="stage in planStages"
        :key="stage.stage"
        class="workflow-plan__stage"
      >
        <span class="workflow-plan__stage-index">{{ stage.step }}</span>
        <span class="workflow-plan__stage-name">
          {{ stage.label || stage.stage }}
        </span>
        <Tag
          v-if="stageAction(stage.action)"
          :bordered="false"
          :color="stageAction(stage.action)?.color"
        >
          {{ stageAction(stage.action)?.label }}
        </Tag>
        <span
          v-if="
            typeof stage.imageCount === 'number' ||
            typeof stage.videoSeconds === 'number'
          "
          class="workflow-plan__stage-output"
        >
          <template v-if="typeof stage.imageCount === 'number'">
            图 {{ stage.imageCount }} 张
          </template>
          <template v-if="typeof stage.videoSeconds === 'number'">
            · 视频 {{ stage.videoSeconds }}s
          </template>
        </span>
      </div>
      <div v-if="planStages.some((stage) => Boolean(stage.message))" class="workflow-plan__hint">
        <div v-for="stage in planStages" :key="`${stage.stage}-note`">
          <template v-if="stage.message">
            {{ stage.label || stage.stage }}：{{ stage.message }}
          </template>
        </div>
      </div>
    </div>

    <Alert
      v-if="missingFields.length"
      message="任务简报还缺以下信息"
      type="warning"
      show-icon
    >
      <template #description>
        <span>{{ missingFields.join('、') }}</span>
      </template>
    </Alert>

    <Alert
      v-if="blockers.length"
      message="计划存在阻断项"
      type="error"
      show-icon
    >
      <template #description>
        <ul class="workflow-blockers">
          <li v-for="(blocker, index) in blockers" :key="index">
            <span>
              {{ blocker.message }}
              <template v-if="blockerHint(blocker)">
                （{{ blockerHint(blocker) }}）
              </template>
            </span>
            <Button
              v-if="blockerNavigate(blocker)"
              size="small"
              type="link"
              @click="goBlocker(blocker)"
            >
              去处理
            </Button>
          </li>
        </ul>
      </template>
    </Alert>

    <Alert
      v-if="error"
      :message="formatApiError(error)"
      :type="error.notReady ? 'info' : 'error'"
      show-icon
    />

    <div class="workflow-plan__actions">
      <Button v-if="!confirmed" @click="emit('dismiss')">取消</Button>
      <Button
        v-if="!confirmed"
        :disabled="!canConfirm"
        :loading="loading"
        type="primary"
        @click="emit('confirm')"
      >
        确认并开始
      </Button>
      <Button
        v-else
        size="small"
        type="text"
        @click="emit('update:expanded', false)"
      >
        收起
      </Button>
    </div>
  </Card>
</template>

<style scoped lang="scss">
.workflow-plan-summary {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.workflow-plan {
  width: 100%;
  background: color-mix(in srgb, hsl(var(--primary)) 4%, hsl(var(--card)));
  border-color: color-mix(
    in srgb,
    hsl(var(--primary)) 25%,
    hsl(var(--border))
  );

  &__head {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__story {
    padding: 8px 10px;
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.6;
    color: hsl(var(--foreground));
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
  }

  &__label {
    margin-bottom: 4px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__summary {
    margin-top: 6px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
    margin-top: 10px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 8px;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 6px;

    span {
      font-size: 12px;
      color: hsl(var(--muted-foreground));
    }

    b {
      font-size: 13px;
      font-weight: 500;
      color: hsl(var(--foreground));
    }
  }

  &__style {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__style-thumb {
    flex: none;
    width: 32px;
    height: 32px;
    overflow: hidden;
    border-radius: 4px;

    :deep(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__output {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 10px;
    margin-top: 10px;
    font-size: 13px;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;

    span {
      color: hsl(var(--muted-foreground));
    }

    b {
      color: hsl(var(--foreground));
    }
  }

  &__stages {
    margin-top: 10px;
  }

  &__stage {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 0;
    font-size: 13px;
    color: hsl(var(--foreground));
  }

  &__stage-index {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--accent));
    border-radius: 50%;
  }

  &__stage-name {
    flex: 1;
  }

  &__stage-output {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__hint {
    margin-top: 4px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 10px;
  }
}

.workflow-blockers {
  padding-left: 18px;
  margin: 0;
  font-size: 12px;

  li {
    display: flex;
    gap: 6px;
    align-items: center;
  }
}
</style>
