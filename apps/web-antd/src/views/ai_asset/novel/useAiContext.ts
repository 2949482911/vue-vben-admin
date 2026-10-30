import type { Ref } from 'vue';

import type {
  AiContextConflict,
  AiReferenceSource,
  EpisodeItem,
} from '#/api/models/ai_asset';

import { computed, ref } from 'vue';

import { MEMORY_STATUS } from './status';

/**
 * AI 结果的参考来源与冲突状态。
 * 调用方：BookWorkbench 的 aiAction、细纲 plan、批量分集响应，拿到响应后立即 capture。
 * 后端尚未返回 conflicts 字段时按空数组处理，即“无数据不阻断”；
 * 字段就绪后只有 level=error 才参与硬冲突 gating。
 */
export function useAiContext(options: {
  currentSeq: () => number | undefined;
  episodes: Ref<EpisodeItem[]>;
}) {
  const references = ref<AiReferenceSource>();
  const conflicts = ref<AiContextConflict[]>([]);
  const staleEpisodes = ref<number[]>([]);

  const hardConflicts = computed(() =>
    conflicts.value.filter((item) => item.level === 'error'),
  );

  function staleEpisodeSeqs(seqs?: Array<number | string>) {
    const currentSeq = Number(options.currentSeq() ?? 0);
    const candidates =
      seqs?.length
        ? seqs
        : options.episodes.value
            .filter(
              (item) =>
                Number(item.seq ?? 0) < currentSeq &&
                Number(item.seq ?? 0) >= currentSeq - 3,
            )
            .map((item) => item.seq ?? 0);
    return candidates
      .filter((seq) => {
        const target = options.episodes.value.find(
          (item) => Number(item.seq) === Number(seq),
        );
        const status = target?.memoryStatus ?? MEMORY_STATUS.NONE;
        return (
          status === MEMORY_STATUS.STALE || status === MEMORY_STATUS.FAILED
        );
      })
      .map((seq) => Number(seq));
  }

  function clear() {
    references.value = undefined;
    conflicts.value = [];
    staleEpisodes.value = [];
  }

  function capture(res: {
    conflicts?: AiContextConflict[];
    historyEpisodes?: Array<number | string>;
    references?: AiReferenceSource;
  }) {
    references.value = res.references;
    conflicts.value = Array.isArray(res.conflicts) ? res.conflicts : [];
    staleEpisodes.value = staleEpisodeSeqs(
      res.references?.episodes ?? res.historyEpisodes,
    );
  }

  return {
    capture,
    clear,
    conflicts,
    hardConflicts,
    hasHardConflicts: () => hardConflicts.value.length > 0,
    references,
    staleEpisodes,
  };
}
