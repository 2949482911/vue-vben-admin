import { ref } from 'vue';

import { useDictStore } from '@vben/stores';

import { SKILL_TYPE_DICT_CODE } from './constants';

/** Skill 类型下拉：来自系统字典 skill_type */
export function useSkillTypeOptions() {
  const dictStore = useDictStore();
  const skillTypeOptions = ref<Array<{ label: string; value: string }>>([]);

  async function fetchSkillTypeOptions() {
    const items = await dictStore.getDict(SKILL_TYPE_DICT_CODE);
    return {
      items: items.map((item) => ({
        label: item.label,
        value: String(item.value),
      })),
    };
  }

  async function loadSkillTypeOptions() {
    const { items } = await fetchSkillTypeOptions();
    skillTypeOptions.value = items;
    return items;
  }

  function skillTypeLabel(value?: string) {
    if (!value) {
      return '-';
    }
    const label = dictStore.getDictLabel(SKILL_TYPE_DICT_CODE, value);
    return label === undefined || label === null || label === ''
      ? value
      : String(label);
  }

  return {
    fetchSkillTypeOptions,
    loadSkillTypeOptions,
    skillTypeLabel,
    skillTypeOptions,
  };
}
