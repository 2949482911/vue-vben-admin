import type { Ref } from 'vue';

import type { DramaApiError } from '../../error';

import type {
  WorkflowArchiveResult,
  WorkflowBrief,
  WorkflowDecision,
  WorkflowDecisionOption,
  WorkflowPlan,
  WorkflowTask,
} from '#/api/models/ai_asset_workflow';

import { computed, onBeforeUnmount, ref, watch } from 'vue';

import { aiAssetWorkflowApi } from '#/api/core/ai_asset_workflow';

import { parseApiError } from '../../error';
import { isActiveStatus, normalizeKey, stageLabel } from './meta';

export interface WorkflowSubmitPayload {
  autoFinalizeEntities?: boolean;
  message: string;
  overrides: WorkflowBrief;
}

function isActive(value?: WorkflowTask) {
  return Boolean(value && isActiveStatus(value.status));
}

function progressMessage(next: WorkflowTask) {
  if (next.agentMessage) {
    return next.agentMessage;
  }
  const status = normalizeKey(next.status);
  if (status === 'running') {
    const step = next.currentStep ?? next.stepIndex;
    return [
      step === undefined ? '' : `第 ${step}/${next.totalSteps ?? 6} 步`,
      stageLabel(next.currentStage)
        ? `正在生成：${stageLabel(next.currentStage)}`
        : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
  if (status === 'needsdecision') {
    return `需要你决定：${next.decision?.title ?? '请处理'}`;
  }
  if (status === 'completed') {
    return '任务完成';
  }
  if (status === 'failed') {
    return `任务失败${next.pauseReason ? `：${next.pauseReason}` : ''}`;
  }
  if (status === 'cancelled') {
    return '任务已取消';
  }
  return '';
}

/**
 * P7 工作流任务状态机：estimate → submit → status/archive 3s 轮询 → decision/cancel。
 *
 * 页面只负责展示；请求序号防止旧响应覆盖新任务，卸载/关闭时停止轮询。
 * active task 恢复失败静默降级，不产生页面级错误噪音。
 */
export function useWorkflowTask(
  novelId: Ref<number | string | undefined>,
  open: Ref<boolean>,
) {
  const plan = ref<WorkflowPlan>();
  const planConfirmed = ref(false);
  const planExpanded = ref(false);
  const task = ref<WorkflowTask>();
  const archive = ref<WorkflowArchiveResult>();
  const decision = ref<WorkflowDecision>();
  const progressLog = ref<string[]>([]);
  const lastPrompt = ref('');
  const restoreNotice = ref('');
  const thinking = ref(false);
  const thinkingSeconds = ref(0);
  const estimateLoading = ref(false);
  const estimateError = ref<DramaApiError>();
  const confirmLoading = ref(false);
  const confirmError = ref<DramaApiError>();
  const taskError = ref<DramaApiError>();
  const archiveLoading = ref(false);
  const archiveError = ref<DramaApiError>();
  const decisionLoading = ref(false);
  const cancelLoading = ref(false);

  let pollTimer: ReturnType<typeof setInterval> | undefined;
  let pollSeq = 0;
  let polling = false;
  let restoreSeq = 0;
  let archiveSeq = 0;
  let estimateSeq = 0;
  let archivePending = false;
  let lastArchiveAt = 0;
  let finalArchiveRequested = false;

  const taskActive = computed(() => isActive(task.value));
  const planBlockers = computed(() => plan.value?.blockers ?? []);
  const planMissingFields = computed(() => plan.value?.missingFields ?? []);
  const canConfirm = computed(
    () =>
      Boolean(plan.value?.planId) &&
      plan.value?.planVersion !== undefined &&
      planBlockers.value.length === 0 &&
      planMissingFields.value.length === 0 &&
      !confirmLoading.value &&
      !taskActive.value,
  );
  const currentDecision = computed(() => {
    // 终态历史数据可能仍带旧 decision；非 active 一律不渲染
    if (!task.value || !isActive(task.value)) {
      return undefined;
    }
    return decision.value ?? task.value.decision;
  });

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
    pollSeq += 1;
    polling = false;
  }

  function startPolling() {
    stopPolling();
    if (!task.value || !isActive(task.value)) {
      return;
    }
    pollTimer = setInterval(() => void refreshTask(), 3000);
  }

  function recordProgress(next: WorkflowTask) {
    const text = progressMessage(next);
    if (!text || progressLog.value.at(-1) === text) {
      return;
    }
    progressLog.value = [...progressLog.value, text];
  }

  /**
   * archive 单次可能 10s+：并发时跳过；仅终态最终刷新允许挂起一次。
   * lastArchiveAt 记录发起时间，供 15s 降频判断。
   */
  async function refreshArchive(options?: { final?: boolean }) {
    if (!novelId.value) {
      return;
    }
    if (archiveLoading.value) {
      if (options?.final) {
        archivePending = true;
      }
      return;
    }
    const targetNovel = novelId.value;
    const seq = ++archiveSeq;
    lastArchiveAt = Date.now();
    archiveLoading.value = true;
    try {
      const result =
        await aiAssetWorkflowApi.fetchWorkflowArchive(targetNovel);
      if (
        seq !== archiveSeq ||
        String(novelId.value) !== String(targetNovel)
      ) {
        return;
      }
      archive.value = result ?? {};
      archiveError.value = undefined;
    } catch (error) {
      if (seq === archiveSeq) {
        archiveError.value = parseApiError(error);
      }
    } finally {
      if (seq === archiveSeq) {
        archiveLoading.value = false;
        if (archivePending) {
          archivePending = false;
          lastArchiveAt = Date.now();
          void refreshArchive();
        }
      }
    }
  }

  async function refreshTask() {
    if (!task.value || polling) {
      return;
    }
    const taskId = task.value.taskId;
    const seq = ++pollSeq;
    polling = true;
    try {
      const next = await aiAssetWorkflowApi.fetchWorkflowTask(taskId);
      if (seq !== pollSeq || String(task.value?.taskId) !== String(taskId)) {
        return;
      }
      const previousProgressKey = task.value
        ? `${task.value.status}:${task.value.currentStep}:${task.value.currentStage}:${task.value.agentMessage ?? ''}`
        : '';
      const nextProgressKey = `${next.status}:${next.currentStep}:${next.currentStage}:${next.agentMessage ?? ''}`;
      const previousArchiveKey = task.value
        ? `${task.value.status}:${task.value.currentStage}`
        : '';
      const nextArchiveKey = `${next.status}:${next.currentStage}`;
      task.value = next;
      taskError.value = undefined;
      decision.value = isActive(next) ? next.decision : undefined;
      if (previousProgressKey !== nextProgressKey) {
        recordProgress(next);
      }
      if (!isActive(next)) {
        stopPolling();
        if (!finalArchiveRequested) {
          finalArchiveRequested = true;
          void refreshArchive({ final: true });
        }
      } else if (previousArchiveKey !== nextArchiveKey) {
        void refreshArchive();
      } else if (Date.now() - lastArchiveAt >= 15_000) {
        void refreshArchive();
      }
    } catch (error) {
      if (seq !== pollSeq) {
        return;
      }
      taskError.value = parseApiError(error);
      if (taskError.value.notReady) {
        stopPolling();
      }
    } finally {
      polling = false;
    }
  }

  async function restoreActive() {
    if (!novelId.value || task.value) {
      return;
    }
    const seq = ++restoreSeq;
    try {
      const active = await aiAssetWorkflowApi.fetchActiveWorkflowTask(
        novelId.value,
      );
      if (seq !== restoreSeq || !active) {
        return;
      }
      task.value = active;
      finalArchiveRequested = false;
      decision.value = isActive(active) ? active.decision : undefined;
      if (active.agentMessage) {
        progressLog.value = [active.agentMessage];
      }
      if (isActive(active)) {
        startPolling();
      }
    } catch {
      // active 查询失败静默，页面保持空态
    }
  }

  function resetState() {
    stopPolling();
    restoreSeq += 1;
    archiveSeq += 1;
    estimateSeq += 1;
    plan.value = undefined;
    planConfirmed.value = false;
    planExpanded.value = false;
    task.value = undefined;
    archive.value = undefined;
    decision.value = undefined;
    progressLog.value = [];
    lastPrompt.value = '';
    restoreNotice.value = '';
    thinking.value = false;
    thinkingSeconds.value = 0;
    estimateError.value = undefined;
    confirmError.value = undefined;
    taskError.value = undefined;
    archiveError.value = undefined;
    archiveLoading.value = false;
    archivePending = false;
    lastArchiveAt = 0;
    finalArchiveRequested = false;
  }

  async function activate() {
    if (!novelId.value || !open.value) {
      return;
    }
    await refreshArchive();
    if (task.value) {
      if (isActive(task.value)) {
        startPolling();
      }
      return;
    }
    await restoreActive();
  }

  async function sendOrder(payload: WorkflowSubmitPayload) {
    if (!novelId.value || taskActive.value) {
      return false;
    }
    stopPolling();
    const targetNovel = novelId.value;
    const seq = ++estimateSeq;
    lastPrompt.value = payload.message;
    plan.value = undefined;
    planConfirmed.value = false;
    planExpanded.value = false;
    task.value = undefined;
    taskError.value = undefined;
    decision.value = undefined;
    progressLog.value = [];
    restoreNotice.value = '';
    finalArchiveRequested = false;
    estimateError.value = undefined;
    confirmError.value = undefined;
    thinking.value = true;
    estimateLoading.value = true;
    const startedAt = Date.now();
    try {
      const request = {
        message: payload.message,
        novelId: targetNovel,
        overrides: payload.overrides,
      };
      const result = await aiAssetWorkflowApi.estimateWorkflow({
        ...(payload.autoFinalizeEntities
          ? { autoFinalizeEntities: true }
          : {}),
        ...request,
      });
      if (
        seq !== estimateSeq ||
        String(novelId.value) !== String(targetNovel)
      ) {
        return false;
      }
      plan.value = result;
      thinkingSeconds.value = Math.max(
        1,
        Math.round((Date.now() - startedAt) / 1000),
      );
      return true;
    } catch (error) {
      estimateError.value = parseApiError(error);
      return false;
    } finally {
      estimateLoading.value = false;
      thinking.value = false;
    }
  }

  async function confirmPlan() {
    if (!plan.value || !canConfirm.value) {
      return;
    }
    const planVersion = plan.value.planVersion;
    if (planVersion === undefined) {
      return;
    }
    const planId = plan.value.planId;
    confirmLoading.value = true;
    confirmError.value = undefined;
    try {
      const result = await aiAssetWorkflowApi.createWorkflowTask({
        planId,
        planVersion,
      });
      planConfirmed.value = true;
      planExpanded.value = false;
      progressLog.value = [];
      finalArchiveRequested = false;
      restoreNotice.value = result.existing
        ? '已恢复进行中任务'
        : '';
      task.value = {
        status: result.status ?? 'pending_confirm',
        taskId: result.taskId,
      };
      await refreshTask();
      startPolling();
    } catch (error) {
      confirmError.value = parseApiError(error);
    } finally {
      confirmLoading.value = false;
    }
  }

  function dismissPlan() {
    plan.value = undefined;
    planConfirmed.value = false;
    planExpanded.value = false;
    confirmError.value = undefined;
  }

  function togglePlanExpanded(value: boolean) {
    planExpanded.value = value;
  }

  async function cancelTask() {
    if (!task.value || !isActive(task.value)) {
      return;
    }
    cancelLoading.value = true;
    try {
      await aiAssetWorkflowApi.cancelWorkflowTask(task.value.taskId);
      await refreshTask();
    } catch (error) {
      taskError.value = parseApiError(error);
    } finally {
      cancelLoading.value = false;
    }
  }

  async function chooseDecision(option: WorkflowDecisionOption) {
    const activeDecision = currentDecision.value;
    if (!task.value || !activeDecision?.decisionId) {
      return;
    }
    decisionLoading.value = true;
    try {
      await aiAssetWorkflowApi.decideWorkflowTask(task.value.taskId, {
        action: option.action,
        decisionId: activeDecision.decisionId,
      });
      decision.value = undefined;
      await refreshTask();
    } catch (error) {
      taskError.value = parseApiError(error);
    } finally {
      decisionLoading.value = false;
    }
  }

  watch(
    [novelId, open],
    ([id, isOpen], oldValue) => {
      if (id !== oldValue?.[0]) {
        resetState();
      }
      if (!isOpen || !id) {
        stopPolling();
        return;
      }
      void activate();
    },
    { immediate: true },
  );

  onBeforeUnmount(stopPolling);

  return {
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
    task,
    taskActive,
    taskError,
    thinking,
    thinkingSeconds,
    togglePlanExpanded,
    sendOrder,
  };
}
