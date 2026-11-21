import type { DramaApiError } from '../error';

import type {
  CanvasShotGenerateRequest,
  CanvasShotSaveRequest,
  CanvasShotStatus,
} from '#/api/models/ai_asset_canvas';

import { reactive, ref } from 'vue';

import { aiAssetCanvasApi } from '#/api/core/ai_asset_canvas';

import { parseApiError } from '../error';

export interface ShotMediaState {
  approved: boolean;
  error?: DramaApiError;
  forceUntil?: number;
  loading: boolean;
  startedAt?: number;
  status?: CanvasShotStatus;
  timer?: ReturnType<typeof setInterval>;
}

export type ShotGenerateType = 'keyframe' | 'segment-video' | 'video';

const POLL_INTERVAL = 5000;
const FORCE_POLL_MS = 180_000;

const states = reactive<Record<string, ShotMediaState>>({});
const clock = ref(Date.now());
const pausedKeys = new Set<string>();
let clockTimer: ReturnType<typeof setInterval> | undefined;

function stateKey(canvasId: number | string, shotId: number | string) {
  return `${String(canvasId)}::${String(shotId)}`;
}

function stateFor(canvasId: number | string, shotId: number | string) {
  const key = stateKey(canvasId, shotId);
  if (!states[key]) {
    states[key] = { approved: false, loading: false };
  }
  return states[key];
}

export function normalizedShotCode(value?: null | string) {
  return String(value ?? '')
    .replaceAll(/[-_\s]/g, '')
    .toLowerCase();
}

export function isShotGenerating(status?: CanvasShotStatus) {
  const segmentStatus = normalizedShotCode(
    status?.segmentVideoStatus === undefined ||
      status?.segmentVideoStatus === null
      ? ''
      : String(status.segmentVideoStatus),
  );
  return (
    status?.generationStatus === 1 ||
    status?.keyframeStatus === 1 ||
    segmentStatus === '1' ||
    segmentStatus === 'running' ||
    segmentStatus === 'generating' ||
    segmentStatus === 'processing'
  );
}

export function segmentModeBlocker(status?: CanvasShotStatus) {
  return status?.blockers?.find(
    (blocker) =>
      normalizedShotCode(blocker.code) === 'segmentmode' ||
      normalizedShotCode(blocker.action) === 'segmentmode',
  );
}

export function otherBlockerReason(status?: CanvasShotStatus) {
  const segmentBlocker = segmentModeBlocker(status);
  return (status?.blockers ?? [])
    .filter((blocker) => blocker !== segmentBlocker)
    .map((blocker) =>
      blocker.action ? `${blocker.message}（${blocker.action}）` : blocker.message,
    )
    .join('；');
}

export function shotTakeId(take: { id?: number | string; takeId?: number | string }) {
  return take.takeId ?? take.id;
}

/** 段落模式优先走 segment-video；generic keyframe_not_approved 不阻断本段生成 */
export function segmentVideoBlockReason(status?: CanvasShotStatus) {
  const segmentBlocker = segmentModeBlocker(status);
  return (status?.blockers ?? [])
    .filter(
      (blocker) =>
        blocker !== segmentBlocker &&
        normalizedShotCode(blocker.code) !== 'keyframenotapproved',
    )
    .map((blocker) =>
      blocker.action ? `${blocker.message}（${blocker.action}）` : blocker.message,
    )
    .join('；');
}

export function isKeyframeSelected(status?: CanvasShotStatus) {
  return Boolean(status?.keyframeUrl || status?.keyframeThumbnailUrl);
}

export function canApproveKeyframe(status?: CanvasShotStatus) {
  if (!status || status.keyframeStatus === 1) {
    return false;
  }
  if (isKeyframeSelected(status)) {
    return true;
  }
  const pendingTakes = status.keyframeTakes?.length ?? 0;
  return status.keyframeStatus === 2 && pendingTakes === 0;
}

export function shotVideoBlockReason(status?: CanvasShotStatus) {
  if (!status) {
    return '状态加载中';
  }
  const blocker = status.blockers?.find((item) =>
    /keyframe.*approv|approv.*keyframe/i.test(
      `${item.code ?? ''}${item.action ?? ''}`,
    ),
  );
  if (blocker) {
    return blocker.message;
  }
  if (status.keyframeStatus === 1) {
    return '关键帧生成中';
  }
  if (!isKeyframeSelected(status) && status.keyframeStatus !== 2) {
    return '请先生成并审批关键帧';
  }
  return '';
}

function isGenerating(status?: CanvasShotStatus) {
  return isShotGenerating(status);
}

function shouldPoll(state: ShotMediaState) {
  return (
    isGenerating(state.status) ||
    Boolean(state.forceUntil && Date.now() < state.forceUntil)
  );
}

function ensureClock() {
  if (!clockTimer) {
    clockTimer = setInterval(() => {
      clock.value = Date.now();
    }, 1000);
  }
}

function maybeStopClock() {
  if (!Object.values(states).some((state) => state.timer)) {
    if (clockTimer) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
  }
}

function startPolling(canvasId: number | string, shotId: number | string) {
  const state = stateFor(canvasId, shotId);
  if (state.timer) {
    return;
  }
  state.timer = setInterval(() => {
    void refresh(canvasId, shotId);
  }, POLL_INTERVAL);
  ensureClock();
}

function stopPolling(canvasId: number | string, shotId: number | string) {
  const state = stateFor(canvasId, shotId);
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = undefined;
  }
  maybeStopClock();
}

async function refresh(
  canvasId: number | string,
  shotId: number | string,
): Promise<CanvasShotStatus | undefined> {
  const state = stateFor(canvasId, shotId);
  if (state.loading) {
    return state.status;
  }
  state.loading = true;
  try {
    state.status = await aiAssetCanvasApi.fetchCanvasShotStatus(
      canvasId,
      shotId,
    );
    state.error = undefined;
    if (isGenerating(state.status) && !state.startedAt) {
      state.startedAt = Date.now();
    }
  } catch (error) {
    const info = parseApiError(error);
    state.error =
      info.notReady || /static resource|接口未就绪/i.test(info.message)
        ? { ...info, message: '接口未就绪', notReady: true }
        : info;
  } finally {
    state.loading = false;
    if (shouldPoll(state)) {
      startPolling(canvasId, shotId);
    } else {
      stopPolling(canvasId, shotId);
    }
  }
  return state.status;
}

function ensureStatus(canvasId?: number | string, shotId?: number | string) {
  if (!canvasId || shotId === undefined || shotId === null || shotId === '') {
    return;
  }
  const state = stateFor(canvasId, shotId);
  if (state.status || state.loading) {
    if (shouldPoll(state)) {
      startPolling(canvasId, shotId);
    }
    return;
  }
  void refresh(canvasId, shotId);
}

async function triggerGenerate(
  canvasId: number | string,
  shotId: number | string,
  type: ShotGenerateType,
  payload: CanvasShotGenerateRequest,
) {
  const state = stateFor(canvasId, shotId);
  state.error = undefined;
  state.forceUntil = Date.now() + FORCE_POLL_MS;
  state.startedAt = Date.now();
  const result =
    type === 'keyframe'
      ? await aiAssetCanvasApi.generateCanvasShotKeyframe(
          canvasId,
          shotId,
          payload,
        )
      : type === 'segment-video'
        ? await aiAssetCanvasApi.generateCanvasSegmentVideo(
            canvasId,
            shotId,
            payload,
          )
        : await aiAssetCanvasApi.generateCanvasShotVideo(
            canvasId,
            shotId,
            payload,
          );
  await refresh(canvasId, shotId);
  startPolling(canvasId, shotId);
  return result;
}

async function approveKeyframe(
  canvasId: number | string,
  shotId: number | string,
) {
  const result = await aiAssetCanvasApi.approveCanvasShotKeyframe(
    canvasId,
    shotId,
  );
  const state = stateFor(canvasId, shotId);
  state.approved = true;
  if (state.status) {
    state.status = {
      ...state.status,
      keyframeStatus: result.keyframeStatus ?? state.status.keyframeStatus,
    };
  }
  await refresh(canvasId, shotId);
  return result;
}

async function selectTake(
  canvasId: number | string,
  shotId: number | string,
  takeId: number | string,
  kind?: 'keyframe' | 'segment-video',
) {
  const state = stateFor(canvasId, shotId);
  try {
    const status = await aiAssetCanvasApi.selectCanvasShotTake(
      canvasId,
      shotId,
      takeId,
    );
    state.status = status;
    state.error = undefined;
    if (kind === 'keyframe') {
      // 画布 takes/select 语义 = 审核通过 + 选中，一次完成
      state.approved = true;
    }
    await refresh(canvasId, shotId);
    return status;
  } catch (error) {
    const info = parseApiError(error);
    state.error =
      info.notReady || /static resource|接口未就绪/i.test(info.message)
        ? { ...info, message: '接口未就绪', notReady: true }
        : info;
    throw error;
  }
}

async function saveShot(
  canvasId: number | string,
  shotId: number | string,
  data: CanvasShotSaveRequest,
) {
  const status = await aiAssetCanvasApi.saveCanvasShot(canvasId, shotId, data);
  setStatus(canvasId, shotId, status);
  return status;
}

function setStatus(
  canvasId: number | string,
  shotId: number | string,
  status?: CanvasShotStatus,
) {
  const state = stateFor(canvasId, shotId);
  state.status = status;
  state.error = undefined;
}

function shotState(
  canvasId?: number | string,
  shotId?: number | string,
) {
  if (!canvasId || shotId === undefined || shotId === null || shotId === '') {
    return undefined;
  }
  return stateFor(canvasId, shotId);
}

function elapsedSeconds(canvasId?: number | string, shotId?: number | string) {
  const state = shotState(canvasId, shotId);
  if (!state?.startedAt) {
    return 0;
  }
  return Math.max(0, Math.floor((clock.value - state.startedAt) / 1000));
}

function stopAllShotPolling() {
  for (const [key, state] of Object.entries(states)) {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = undefined;
    }
    pausedKeys.delete(key);
  }
  maybeStopClock();
}

function stopTimersOnHidden() {
  for (const [key, state] of Object.entries(states)) {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = undefined;
      pausedKeys.add(key);
    }
  }
  maybeStopClock();
}

function resumeOnVisible() {
  for (const key of [...pausedKeys]) {
    const [canvasId, shotId] = key.split('::');
    pausedKeys.delete(key);
    if (canvasId && shotId) {
      void refresh(canvasId, shotId);
    }
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTimersOnHidden();
    } else {
      resumeOnVisible();
    }
  });
}

export function useCanvasShotMedia() {
  return {
    approveKeyframe,
    elapsedSeconds,
    ensureStatus,
    refresh,
    saveShot,
    selectTake,
    setStatus,
    shotState,
    startPolling,
    stopAllShotPolling,
    stopPolling,
    triggerGenerate,
  };
}
