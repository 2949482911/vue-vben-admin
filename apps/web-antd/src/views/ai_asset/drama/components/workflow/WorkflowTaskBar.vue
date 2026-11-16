<script lang="ts" setup name="WorkflowTaskBar">
import type {
  WorkflowBlocker,
  WorkflowPlan,
  WorkflowTask,
} from '#/api/models/ai_asset_workflow';

import { computed, ref, watch } from 'vue';

import { DownOutlined, RightOutlined } from '@ant-design/icons-vue';
import { Alert, Button, Modal, Tag } from 'ant-design-vue';

import {
  blockerHint,
  blockerNavigate,
  isActiveStatus,
  type NavigatePayload,
  normalizeKey,
  stageLabel,
  stageStatusMeta,
  taskStatusMeta,
} from './meta';

const props = defineProps<{
  cancelLoading: boolean;
  plan?: WorkflowPlan;
  task?: WorkflowTask;
}>();

const emit = defineEmits<{
  cancel: [];
  navigate: [payload: NavigatePayload];
}>();

const stagesExpanded = ref(true);

/** 终态才展示六步结果；运行中仍用现有步骤标题，避免重复堆叠 */
const terminalStages = computed(() => {
  if (!props.task) {
    return [];
  }
  const status = normalizeKey(props.task.status);
  if (status !== 'completed' && status !== 'failed') {
    return [];
  }
  return props.task.stages ?? [];
});

watch(
  () => props.task?.taskId,
  () => {
    stagesExpanded.value = true;
  },
  { immediate: true },
);

const view = computed(() => {
  if (props.task) {
    const current = props.task;
    const status = normalizeKey(current.status);
    const meta = taskStatusMeta(current.status);
    let label = current.statusLabel || meta.label;
    if (status === 'running') {
      const step = current.currentStep ?? current.stepIndex;
      const stage = stageLabel(current.currentStage);
      label = [
        step === undefined ? '' : `第 ${step}/${current.totalSteps ?? 6} 步`,
        stage ? `正在生成：${stage}` : current.statusLabel || '',
      ]
        .filter(Boolean)
        .join(' ');
    }
    const active = isActiveStatus(status);
    return {
      // 终态历史 blockers 不再展示
      blockers: active ? (current.blockers ?? []) : [],
      canCancel: active,
      color: meta.color,
      label,
      progress:
        typeof current.progressPercent === 'number'
          ? current.progressPercent
          : undefined,
    };
  }
  if (props.plan) {
    return {
      blockers: [],
      canCancel: false,
      color: 'default',
      label: '待确认',
      progress: undefined,
    };
  }
  return null;
});

function goBlocker(blocker: WorkflowBlocker) {
  const target = blockerNavigate(blocker);
  if (target) {
    emit('navigate', { target });
  }
}

function requestCancel() {
  if (!view.value?.canCancel) {
    return;
  }
  Modal.confirm({
    cancelText: '继续执行',
    content: '取消后当前任务会停止，已完成产物会保留；不提供续跑。',
    okText: '取消任务',
    onOk: () => emit('cancel'),
    title: '取消任务？',
  });
}
</script>

<template>
  <div v-if="view" class="workflow-taskbar">
    <div class="workflow-taskbar__main">
      <span class="workflow-taskbar__title">任务推进</span>
      <Tag :bordered="false" :color="view.color">{{ view.label }}</Tag>
      <span
        v-if="view.progress !== undefined"
        class="workflow-taskbar__percent"
      >
        {{ view.progress }}%
      </span>
      <span class="workflow-taskbar__spacer"></span>
      <Button
        v-if="view.canCancel"
        :loading="cancelLoading"
        size="small"
        @click="requestCancel"
      >
        取消任务
      </Button>
    </div>
    <div
      v-if="view.progress !== undefined"
      class="workflow-taskbar__track"
    >
      <i :style="{ width: `${view.progress}%` }"></i>
    </div>
    <Alert
      v-if="view.blockers.length"
      message="当前任务存在阻断项"
      type="error"
      show-icon
    >
      <template #description>
        <ul class="workflow-blockers">
          <li v-for="(blocker, index) in view.blockers" :key="index">
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

    <div v-if="terminalStages.length" class="workflow-taskbar__stages">
      <button
        class="workflow-taskbar__stages-head"
        type="button"
        @click="stagesExpanded = !stagesExpanded"
      >
        <span class="workflow-taskbar__stages-title">阶段结果</span>
        <span class="workflow-taskbar__spacer"></span>
        <DownOutlined v-if="stagesExpanded" />
        <RightOutlined v-else />
      </button>
      <div v-show="stagesExpanded" class="workflow-taskbar__stage-list">
        <div
          v-for="(stage, index) in terminalStages"
          :key="stage.stage"
          class="workflow-taskbar__stage"
        >
          <span class="workflow-taskbar__stage-index">
            {{ stage.step ?? index + 1 }}
          </span>
          <span class="workflow-taskbar__stage-name">
            {{ stageLabel(stage.stage) || stage.stage }}
          </span>
          <Tag
            :bordered="false"
            :color="stageStatusMeta(stage.status).color"
          >
            {{ stageStatusMeta(stage.status).label }}
          </Tag>
          <span v-if="stage.message" class="workflow-taskbar__stage-message">
            {{ stage.message }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.workflow-taskbar {
  flex: none;
  padding: 10px 12px;
  border-bottom: 1px solid hsl(var(--border));

  &__main {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__percent {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__spacer {
    flex: 1;
  }

  &__track {
    height: 4px;
    margin-top: 8px;
    overflow: hidden;
    background: hsl(var(--accent));
    border-radius: 999px;

    i {
      display: block;
      height: 100%;
      background: hsl(var(--primary));
      border-radius: 999px;
      transition: width 0.3s ease;
    }
  }

  &__stages {
    margin-top: 8px;
    border-top: 1px dashed hsl(var(--border));
  }

  &__stages-head {
    display: flex;
    gap: 6px;
    align-items: center;
    width: 100%;
    padding: 8px 0 4px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  &__stages-title {
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__stage-list {
    padding-bottom: 4px;
  }

  &__stage {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
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

  &__stage-message {
    flex-basis: 100%;
    padding-left: 26px;
    font-size: 12px;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
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
