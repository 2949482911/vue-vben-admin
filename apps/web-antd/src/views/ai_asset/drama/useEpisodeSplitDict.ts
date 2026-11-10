import { computed, onMounted } from 'vue';

import { useDictStore } from '@vben/stores';

const SPLIT_MODE_DICT = 'ai_episode_split_mode';

interface EpisodeSplitModeOption {
  label: string;
  value: string;
}

/**
 * 分集划分模式字典（smart / even）。
 *
 * 字典未就绪时返回空数组，调用方必须禁用「划分分集」，不允许回退到写死模式。
 */
export function useEpisodeSplitDict() {
  const dictStore = useDictStore();

  const modeOptions = computed<EpisodeSplitModeOption[]>(() =>
    (dictStore.dictMap[SPLIT_MODE_DICT] ?? [])
      .map((item) => ({
        label: String(item.label),
        value: String(item.value),
      }))
      .filter((item) => Boolean(item.value)),
  );

  onMounted(() => {
    void dictStore.loadAllDicts().catch(() => {});
  });

  return {
    modeOptions,
    modeReady: computed(() => modeOptions.value.length > 0),
  };
}
