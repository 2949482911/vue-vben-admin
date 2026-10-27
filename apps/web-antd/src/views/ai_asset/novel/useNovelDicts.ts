import { computed, onMounted } from 'vue';

import { useDictStore } from '@vben/stores';

import {
  DICT_CODES,
  dictItemToOption,
  FALLBACK_OPTIONS,
  type OptionMap,
} from './constants';

/** 字典优先、常量兜底：字典接口未就绪时页面仍可用 */
export function useNovelDicts() {
  const dictStore = useDictStore();

  const options = computed<OptionMap>(() => {
    const result: OptionMap = {};
    (Object.keys(DICT_CODES) as Array<keyof typeof DICT_CODES>).forEach((key) => {
      const items = dictStore.dictMap[DICT_CODES[key]] ?? [];
      result[key] = items.length
        ? items.map(dictItemToOption)
        : (FALLBACK_OPTIONS[key] ?? []);
    });
    return result;
  });

  onMounted(() => {
    void dictStore.loadAllDicts().catch(() => {});
  });

  function labelOf(key: string, value?: string) {
    if (!value) {
      return '';
    }
    return options.value[key]?.find((item) => item.value === value)?.label ?? value;
  }

  return { options, labelOf };
}
