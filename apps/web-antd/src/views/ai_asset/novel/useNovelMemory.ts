import type { Ref } from 'vue';

import type { EpisodeItem, NovelMemoryOverview } from '#/api/models/ai_asset';

import { computed, onBeforeUnmount, ref } from 'vue';

import { message } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { FINISHED_FLAG, MEMORY_STATUS, MEMORY_STATUS_META } from './status';

/**
 * 长篇小说记忆编排：定稿、单章重建、status 轮询、超时兜底与全书概览。
 * 记忆状态唯一来源是 episode.memoryStatus（后端 memory_status），不再维护布尔开关。
 * 轮询采用 2s 起步、逐次翻倍、10s 封顶；超过 10 分钟停止并暴露手动重建。
 */
export function useNovelMemory(options: {
  beforeFinalize: () => Promise<boolean>;
  episode: Ref<EpisodeItem | undefined>;
  episodes: Ref<EpisodeItem[]>;
  hasHardConflicts: () => boolean;
  modelId: () => number | string | undefined;
  novelId: () => number | string | undefined;
  updateEpisodeRow: (item: EpisodeItem) => void;
}) {
  const memoryOverview = ref<NovelMemoryOverview>();
  const chapterMemoryOpen = ref(false);
  const novelMemoryOpen = ref(false);
  const finalizing = ref(false);
  const memoryRebuilding = ref(false);
  const memoryTimedOutIds = ref<string[]>([]);
  const POLL_MIN_DELAY = 2000;
  const POLL_MAX_DELAY = 10_000;
  const POLL_MAX_MS = 10 * 60 * 1000;
  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  let pollStartedAt: number | undefined;
  let pollDelay = POLL_MIN_DELAY;

  /**
   * 唯一状态来源：后端 memory_status。
   * 列表/详情暂未返回 memoryStatus 时，用 finalized=1 降级为“生成中”，避免定稿后刷新显示未定稿；
   * 权威值仍由进入章节时调用 memory/status 校准。
   */
  function memoryStatusOf(item: EpisodeItem) {
    const status = Number(item.memoryStatus ?? MEMORY_STATUS.NONE);
    if (status !== MEMORY_STATUS.NONE) {
      return status;
    }
    return Number(item.finalized ?? FINISHED_FLAG.NO) === FINISHED_FLAG.YES
      ? MEMORY_STATUS.GENERATING
      : MEMORY_STATUS.NONE;
  }

  function memoryStatusMeta(item: EpisodeItem) {
    return MEMORY_STATUS_META[memoryStatusOf(item)];
  }

  function isMemoryTimedOutId(id: number | string) {
    return memoryTimedOutIds.value.includes(String(id));
  }

  function memoryStatusLabel(item: EpisodeItem) {
    const status = memoryStatusOf(item);
    const base = MEMORY_STATUS_META[status]?.label ?? '记忆状态未知';
    return status === MEMORY_STATUS.GENERATING && isMemoryTimedOutId(item.id)
      ? `${base}（可手动重建）`
      : base;
  }

  function memoryDotClass(item: EpisodeItem) {
    return memoryStatusOf(item) === MEMORY_STATUS.GENERATING &&
      isMemoryTimedOutId(item.id)
      ? `is-${MEMORY_STATUS.GENERATING} is-timeout`
      : `is-${memoryStatusOf(item)}`;
  }

  const currentMemoryTimedOut = computed(() => {
    const current = options.episode.value;
    return current ? isMemoryTimedOutId(current.id) : false;
  });

  function stopMemoryStatusPoll() {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = undefined;
    }
  }

  function applyMemoryDetail(episodeId: number | string, detail: any) {
    const target = options.episodes.value.find(
      (item) => String(item.id) === String(episodeId),
    );
    if (!target) {
      return;
    }
    // 只合并记忆字段，禁止把列表里的 scriptStatus/needsRecompose 等状态回滚覆盖当前集
    const patch = {
      memoryStatus: detail?.memoryStatus ?? target.memoryStatus,
      memorySource: detail?.memorySource ?? target.memorySource,
      memoryError: detail?.errorMsg ?? '',
      contentVersion: detail?.contentVersion ?? target.contentVersion,
    };
    Object.assign(target, patch);
    if (String(options.episode.value?.id) === String(episodeId)) {
      options.episode.value = { ...options.episode.value!, ...patch };
    }
    options.updateEpisodeRow(target);
  }

  function markTimedOut(episodeId: number | string) {
    stopMemoryStatusPoll();
    memoryTimedOutIds.value = [
      ...new Set([...memoryTimedOutIds.value, String(episodeId)]),
    ];
    message.info(
      '记忆生成超过 10 分钟，已停止自动刷新；可在章节目录或本章记忆里手动重建',
    );
  }

  /**
   * 轮询 memory/status：2s→4s→8s→10s 退避。
   * 生成中超过 10 分钟停止轮询并记录超时，目录状态点可手动重建。
   * initialDelay 用于刚用 status 校准过状态时避免立刻重复请求。
   */
  function startMemoryStatusPoll(episodeId: number | string, initialDelay = 0) {
    stopMemoryStatusPoll();
    memoryTimedOutIds.value = memoryTimedOutIds.value.filter(
      (id) => id !== String(episodeId),
    );
    pollStartedAt = Date.now();
    pollDelay = POLL_MIN_DELAY;
    const poll = async () => {
      try {
        const detail = await aiAssetApi.fetchEpisodeMemoryStatus(episodeId);
        applyMemoryDetail(episodeId, detail);
        const target = options.episodes.value.find(
          (item) => String(item.id) === String(episodeId),
        );
        // 用 memoryStatusOf 统一推导：后端暂时只回 0 但已定稿时仍按生成中继续轮询
        const status = target
          ? memoryStatusOf(target)
          : Number(detail?.memoryStatus ?? MEMORY_STATUS.NONE);
        if (status === MEMORY_STATUS.GENERATING) {
          if (Date.now() - (pollStartedAt ?? Date.now()) > POLL_MAX_MS) {
            markTimedOut(episodeId);
            return;
          }
          pollTimer = setTimeout(poll, pollDelay);
          pollDelay = Math.min(POLL_MAX_DELAY, pollDelay * 2);
          return;
        }
        stopMemoryStatusPoll();
        memoryTimedOutIds.value = memoryTimedOutIds.value.filter(
          (id) => id !== String(episodeId),
        );
        if (
          status === MEMORY_STATUS.STALE ||
          status === MEMORY_STATUS.FAILED
        ) {
          message.warning(
            status === MEMORY_STATUS.FAILED
              ? '记忆生成失败，可手动重建'
              : '记忆已过期，可重建',
          );
        }
        await loadMemoryOverview();
      } catch (error: any) {
        const code = Number(
          error?.response?.status ?? error?.code ?? error?.data?.code,
        );
        if (code === 404) {
          stopMemoryStatusPoll();
          message.warning('记忆状态接口未就绪，已停止自动刷新');
          return;
        }
        // 状态接口短暂失败时继续按退避节奏重试，超过总时限同样转人工重建
        if (Date.now() - (pollStartedAt ?? Date.now()) > POLL_MAX_MS) {
          markTimedOut(episodeId);
          return;
        }
        pollTimer = setTimeout(poll, pollDelay);
        pollDelay = Math.min(POLL_MAX_DELAY, pollDelay * 2);
      }
    };
    if (initialDelay > 0) {
      pollTimer = setTimeout(poll, initialDelay);
    } else {
      void poll();
    }
  }

  function openChapterMemory() {
    chapterMemoryOpen.value = true;
  }

  async function loadMemoryOverview() {
    const novelId = options.novelId();
    if (!novelId) {
      return;
    }
    try {
      memoryOverview.value =
        await aiAssetApi.fetchNovelMemoryOverview(novelId);
    } catch {
      // 全书概览接口未就绪时隐藏统计条
    }
  }

  function failMessage(error: any, fallback: string, advice: string) {
    const code = Number(
      error?.response?.status ?? error?.code ?? error?.data?.code,
    );
    if (code === 404) {
      return '接口未就绪，待后端上线后重试';
    }
    const raw = error?.message || fallback;
    return code === 400 ? `${raw}（${advice}）` : raw;
  }

  /** 定稿：先保存正文，再显式触发记忆；普通保存不会调用这里 */
  async function finalizeChapter() {
    const current = options.episode.value;
    if (!current || finalizing.value) {
      return;
    }
    if (options.hasHardConflicts()) {
      message.warning('存在硬冲突，请先处理后再定稿');
      return;
    }
    if (!(await options.beforeFinalize())) {
      return;
    }
    finalizing.value = true;
    try {
      const updated = await aiAssetApi.finalizeEpisode({
        episodeId: current.id,
        modelId: options.modelId(),
      });
      options.episode.value = {
        ...options.episode.value!,
        ...updated,
        // 定稿响应缺失或仍为 0 时立即推进为生成中，避免停在“未定稿”
        finalized: updated?.finalized ?? FINISHED_FLAG.YES,
        memoryStatus:
          Number(updated?.memoryStatus ?? MEMORY_STATUS.NONE) !==
          MEMORY_STATUS.NONE
            ? Number(updated?.memoryStatus)
            : MEMORY_STATUS.GENERATING,
      };
      options.updateEpisodeRow(options.episode.value!);
      message.success('本章已定稿，结构化记忆生成中');
      startMemoryStatusPoll(current.id);
      await loadMemoryOverview();
    } catch (error: any) {
      message.error(
        failMessage(
          error,
          '定稿失败，请稍后重试',
          '请确认正文已保存且文本模型可用',
        ),
      );
    } finally {
      finalizing.value = false;
    }
  }

  /** 目录状态点 / 本章记忆手动重建；只对过期、失败、超时生成中开放 */
  async function retryEpisodeMemory(item: EpisodeItem) {
    const status = memoryStatusOf(item);
    const canRetry =
      status === MEMORY_STATUS.STALE ||
      status === MEMORY_STATUS.FAILED ||
      (status === MEMORY_STATUS.GENERATING && isMemoryTimedOutId(item.id));
    if (!canRetry || memoryRebuilding.value) {
      return;
    }
    memoryRebuilding.value = true;
    try {
      const updated = await aiAssetApi.rebuildChapterMemory({
        episodeId: item.id,
        force: true,
        modelId: options.modelId(),
      });
      item.memoryStatus =
        Number(updated?.memoryStatus ?? MEMORY_STATUS.NONE) !==
        MEMORY_STATUS.NONE
          ? Number(updated?.memoryStatus)
          : MEMORY_STATUS.GENERATING;
      item.memorySource = updated?.memorySource;
      item.memoryError = updated?.errorMsg;
      // 能重建说明本章已定稿，避免状态接口暂未返回状态时又退回未定稿
      item.finalized = FINISHED_FLAG.YES;
      options.updateEpisodeRow(item);
      startMemoryStatusPoll(item.id);
      message.success('已提交重建，正在后台生成记忆');
      await loadMemoryOverview();
    } catch (error: any) {
      message.error(
        failMessage(
          error,
          '重建章节记忆失败',
          '请确认该章已定稿且文本模型可用',
        ),
      );
    } finally {
      memoryRebuilding.value = false;
    }
  }

  function onChapterMemoryUpdated() {
    const current = options.episode.value;
    if (!current) {
      return;
    }
    current.memoryStatus = MEMORY_STATUS.GENERATING;
    current.finalized = FINISHED_FLAG.YES;
    options.updateEpisodeRow(current);
    startMemoryStatusPoll(current.id);
    void loadMemoryOverview();
  }

  /** 全书操作后只刷新目录状态，不重载当前正文 */
  async function onNovelMemoryUpdated() {
    const novelId = options.novelId();
    if (!novelId) {
      return;
    }
    try {
      const page = await aiAssetApi.fetchEpisodes({
        novelId,
        page: 1,
        pageSize: 200,
      });
      options.episodes.value = page?.items ?? options.episodes.value;
      const current = options.episode.value;
      if (current) {
        const latest = options.episodes.value.find(
          (item) => String(item.id) === String(current.id),
        );
        if (latest) {
          current.memoryStatus = latest.memoryStatus;
        }
      }
    } catch {
      // 目录刷新失败不影响当前编辑
    }
    void loadMemoryOverview();
  }

  /**
   * 进入章节时用 episode/memory/status 校准一次：
   * 列表字段承担首屏快速渲染，status 是权威兜底；若仍在生成中则继续轮询。
   */
  async function refreshCurrentEpisodeMemoryStatus() {
    const current = options.episode.value;
    if (!current) {
      stopMemoryStatusPoll();
      return;
    }
    const episodeId = current.id;
    try {
      const detail = await aiAssetApi.fetchEpisodeMemoryStatus(episodeId);
      applyMemoryDetail(episodeId, detail);
    } catch {
      // 接口未就绪或短暂失败时保留列表 / finalized 推导结果，不打断编辑
    }
    // 请求期间已切到别的集：交给新一集的校准处理
    if (String(options.episode.value?.id) !== String(episodeId)) {
      return;
    }
    if (memoryStatusOf(options.episode.value!) === MEMORY_STATUS.GENERATING) {
      startMemoryStatusPoll(episodeId, POLL_MIN_DELAY);
    } else {
      stopMemoryStatusPoll();
    }
  }

  onBeforeUnmount(stopMemoryStatusPoll);

  return {
    chapterMemoryOpen,
    currentMemoryTimedOut,
    finalizeChapter,
    finalizing,
    loadMemoryOverview,
    memoryDotClass,
    memoryOverview,
    memoryRebuilding,
    memoryStatusLabel,
    memoryStatusMeta,
    memoryStatusOf,
    novelMemoryOpen,
    onChapterMemoryUpdated,
    onNovelMemoryUpdated,
    openChapterMemory,
    refreshCurrentEpisodeMemoryStatus,
    retryEpisodeMemory,
    startMemoryStatusPoll,
    stopMemoryStatusPoll,
  };
}
