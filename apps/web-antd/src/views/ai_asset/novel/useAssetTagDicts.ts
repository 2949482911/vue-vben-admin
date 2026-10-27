import type { TagDimension } from './appearanceTags';

import { computed, onMounted } from 'vue';

import { useDictStore } from '@vben/stores';

import {
  CHARACTER_TAG_DIMENSIONS,
  SCENE_TAG_DIMENSIONS,
} from './appearanceTags';

export interface TagOption {
  label: string;
  value: string;
}

export type TagOptionsMap = Record<string, TagOption[]>;

/** 资产外观/场景标签字典：只认后端字典，某维度为空则整组不渲染 */
export function useAssetTagDicts() {
  const dictStore = useDictStore();

  const optionsMap = computed<TagOptionsMap>(() => {
    const result: TagOptionsMap = {};
    [...CHARACTER_TAG_DIMENSIONS, ...SCENE_TAG_DIMENSIONS].forEach((dimension) => {
      const items = dictStore.dictMap[dimension.dictCode] ?? [];
      result[dimension.dictCode] = items.map((item) => ({
        label: String(item.label),
        value: String(item.value),
      }));
    });
    return result;
  });

  function optionsOf(dimension: TagDimension): TagOption[] {
    return optionsMap.value[dimension.dictCode] ?? [];
  }

  function visible(dimensions: TagDimension[]) {
    return dimensions.filter((dimension) => optionsOf(dimension).length > 0);
  }

  function labelOf(dimension: TagDimension, value: string) {
    return (
      optionsOf(dimension).find((item) => item.value === value)?.label ?? value
    );
  }

  onMounted(() => {
    void dictStore.loadAllDicts().catch(() => {});
  });

  return {
    characterDimensions: CHARACTER_TAG_DIMENSIONS,
    labelOf,
    optionsMap,
    optionsOf,
    sceneDimensions: SCENE_TAG_DIMENSIONS,
    visible,
  };
}
