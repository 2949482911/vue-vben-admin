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

export type ShotGenerateType = 'keyframe' | 'video';

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

function isGenerating(status?: CanvasShotStatus) {
  return status?.generationStatus === 1 || status?.keyframeStatus === 1;
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
    setStatus,
    shotState,
    startPolling,
    stopAllShotPolling,
    stopPolling,
    triggerGenerate,
  };
}
