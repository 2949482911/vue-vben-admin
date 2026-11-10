import { computed, onMounted } from 'vue';

import { useDictStore } from '@vben/stores';

/** 画面比例字典编码（系统字典维护 value/label） */
const ASPECT_RATIO_DICT = 'ai_aspect_ratio';

/**
 * 画面比例选项：只读系统字典，不在前端内置比例列表。
 *
 * 字典未就绪时 options 为空，调用方必须禁用控件并标「待接入」，不要回退到写死的比例。
 */
export function useAspectRatioDict() {
  const dictStore = useDictStore();

  const options = computed(() =>
    (dictStore.dictMap[ASPECT_RATIO_DICT] ?? [])
      .map((item) => ({
        label: String(item.label),
        value: String(item.value),
      }))
      .filter((item) => Boolean(item.value)),
  );

  const ready = computed(() => options.value.length > 0);

  onMounted(() => {
    void dictStore.loadAllDicts().catch(() => {});
  });

  function labelOf(value?: null | string) {
    if (!value) {
      return '';
    }
    return (
      options.value.find((item) => item.value === value)?.label ?? value
    );
  }

  return { labelOf, options, ready };
}
