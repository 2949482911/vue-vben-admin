import { computed, onMounted } from 'vue';

import { useDictStore } from '@vben/stores';

const PROMPT_MODE_DICT = 'ai_storyboard_prompt_mode';
const SPLIT_MODE_DICT = 'ai_storyboard_split_mode';

interface StoryboardModeOption {
  label: string;
  value: string;
}

/**
 * 分镜台模式字典：拆分模式 / 提示词模式。
 *
 * 字典未就绪时返回空数组，调用方必须禁用对应动作并提示字典编码，不允许回退到写死模式。
 */
export function useStoryboardDicts() {
  const dictStore = useDictStore();

  function options(code: string) {
    return computed<StoryboardModeOption[]>(() =>
      (dictStore.dictMap[code] ?? [])
        .map((item) => ({
          label: String(item.label),
          value: String(item.value),
        }))
        .filter((item) => Boolean(item.value)),
    );
  }

  const promptModes = options(PROMPT_MODE_DICT);
  const splitModes = options(SPLIT_MODE_DICT);

  onMounted(() => {
    void dictStore.loadAllDicts().catch(() => {});
  });

  return {
    promptModes,
    promptReady: computed(() => promptModes.value.length > 0),
    splitModes,
    splitReady: computed(() => splitModes.value.length > 0),
  };
}
