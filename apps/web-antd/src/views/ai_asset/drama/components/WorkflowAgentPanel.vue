<script lang="ts" setup name="DramaWorkflowAgentPanel">
/**
 * P7 工作流三栏编排。
 *
 * 中栏 Agent 对话/计划/任务，右栏实时档案；状态机与请求在 useWorkflowTask。
 */
import type { WorkflowSubmitPayload } from './workflow/useWorkflowTask';

import { ref, toRef } from 'vue';

import { Alert, Empty } from 'ant-design-vue';

import { useWorkflowTask } from './workflow/useWorkflowTask';
import WorkflowArchivePanel from './workflow/WorkflowArchivePanel.vue';
import WorkflowComposer from './workflow/WorkflowComposer.vue';
import WorkflowDecisionCard from './workflow/WorkflowDecisionCard.vue';
import WorkflowPlanCard from './workflow/WorkflowPlanCard.vue';
import WorkflowTaskBar from './workflow/WorkflowTaskBar.vue';

type EntityGroup = 'character' | 'element' | 'scene';
type NavigateTarget =
  | 'entities'
  | 'episodes'
  | 'script'
  | 'storyboard'
  | 'style';

interface NavigatePayload {
  group?: EntityGroup;
  target: NavigateTarget;
}

const props = defineProps<{
  novelId?: number | string;
  open: boolean;
  projectRatio?: string;
  styleReferenceUrl?: string;
}>();

const emit = defineEmits<{ navigate: [payload: NavigatePayload] }>();

const composerRef = ref<null | { clear: () => void }>(null);

const {
  archive,
  archiveError,
  archiveLoading,
  canConfirm,
  cancelLoading,
  cancelTask,
  chooseDecision,
  confirmError,
  confirmLoading,
  confirmPlan,
  currentDecision,
  decisionLoading,
  dismissPlan,
  estimateError,
  estimateLoading,
  lastPrompt,
  plan,
  planBlockers,
  planConfirmed,
  planExpanded,
  planMissingFields,
  progressLog,
  refreshArchive,
  refreshTask,
  restoreNotice,
  sendOrder,
  task,
  taskActive,
  taskError,
  thinking,
  thinkingSeconds,
  togglePlanExpanded,
} = useWorkflowTask(
  toRef(props, 'novelId'),
  toRef(props, 'open'),
);

async function handleSubmit(payload: WorkflowSubmitPayload) {
  const success = await sendOrder(payload);
  if (success) {
    composerRef.value?.clear();
  }
}
</script>

<template>
  <div class="workflow-panel">
    <div class="workflow-center">
      <WorkflowTaskBar
        :cancel-loading="cancelLoading"
        :plan="plan"
        :task="task"
        @cancel="cancelTask"
        @navigate="emit('navigate', $event)"
      />

      <div class="workflow-chat">
        <div v-if="lastPrompt" class="workflow-msg workflow-msg--user">
          {{ lastPrompt }}
        </div>

        <div v-if="thinking" class="workflow-msg workflow-msg--agent">
          <div class="workflow-msg__meta">任务 Agent</div>
          <div>正在解析下单与生成任务简报…</div>
        </div>

        <template v-else-if="plan">
          <div class="workflow-msg workflow-msg--agent">
            <div class="workflow-msg__meta">
              任务 Agent · 已思考 {{ thinkingSeconds }} 秒
            </div>
            <div>
              {{
                plan.understanding?.summary ||
                '已生成任务简报，请确认后开始。'
              }}
            </div>
          </div>

          <WorkflowPlanCard
            :blockers="planBlockers"
            :can-confirm="canConfirm"
            :confirmed="planConfirmed"
            :error="confirmError"
            :expanded="planExpanded"
            :loading="confirmLoading"
            :missing-fields="planMissingFields"
            :plan="plan"
            :style-reference-url="styleReferenceUrl"
            @confirm="confirmPlan"
            @dismiss="dismissPlan"
            @navigate="emit('navigate', $event)"
            @update:expanded="togglePlanExpanded"
          />
        </template>

        <Alert
          v-if="restoreNotice"
          :message="restoreNotice"
          type="info"
          show-icon
        />

        <Alert
          v-if="estimateError"
          :message="estimateError.message"
          :type="estimateError.notReady ? 'info' : 'error'"
          show-icon
        />

        <div
          v-for="(line, index) in progressLog"
          :key="index"
          class="workflow-msg workflow-msg--agent workflow-msg--progress"
        >
          <div class="workflow-msg__meta">任务 Agent</div>
          <div>{{ line }}</div>
        </div>

        <WorkflowDecisionCard
          :decision="currentDecision"
          :loading="decisionLoading"
          @decide="chooseDecision"
          @refresh="refreshTask"
        />

        <Alert
          v-if="taskError"
          :message="taskError.message"
          :type="taskError.notReady ? 'info' : 'error'"
          show-icon
        />

        <Empty
          v-if="!lastPrompt && !plan && !task"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="用自然语言下单，Agent 会生成任务简报"
        />
      </div>

      <WorkflowComposer
        ref="composerRef"
        :disabled="taskActive"
        :loading="estimateLoading"
        :novel-id="novelId"
        :project-ratio="projectRatio"
        @submit="handleSubmit"
      />
    </div>

    <WorkflowArchivePanel
      :archive="archive"
      :error="archiveError"
      :loading="archiveLoading"
      :novel-id="novelId"
      :task="task"
      @navigate="emit('navigate', $event)"
      @refresh="refreshArchive"
    />
  </div>
</template>

<style scoped lang="scss">
.workflow-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.workflow-center {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.workflow-chat {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  padding: 12px;
  overflow-y: auto;
}

.workflow-msg {
  max-width: 90%;
  padding: 8px 10px;
  font-size: 14px;
  line-height: 1.6;
  border-radius: 10px;

  &--user {
    align-self: flex-end;
    color: hsl(var(--primary-foreground));
    background: hsl(var(--primary));
  }

  &--agent {
    align-self: flex-start;
    color: hsl(var(--foreground));
    background: hsl(var(--accent));
  }

  &--progress {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    background: transparent;
    border: 1px dashed hsl(var(--border));
  }

  &__meta {
    margin-bottom: 2px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

@media (max-width: 1200px) {
  .workflow-panel {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
