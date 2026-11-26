import { ref } from 'vue';

import { accountLabelApi } from '#/api';

export interface AccountLabelOption {
  label: string;
  value: string;
}

/**
 * 全局标签数据源（platform_advertiser_tag 列表）
 * 资产类数据统一存 labelIds（标签ID数组），展示时按 ID 映射名称。
 * 历史数据存在同名重复，选择器按名称去重临时展示。
 */
export function useAccountLabelOptions() {
  const labelOptions = ref<AccountLabelOption[]>([]);
  let loaded = false;

  async function loadLabelOptions(force = false) {
    if (loaded && !force) {
      return labelOptions.value;
    }
    const res: any = await accountLabelApi.fetchGetAccountLabelList({
      page: 1,
      pageSize: 1000,
    });
    const seen = new Set<string>();
    labelOptions.value = (res?.items ?? [])
      .filter((item: any) => item.status === undefined || item.status === 1)
      .map((item: any) => ({
        label: item.name || String(item.id),
        value: String(item.id),
      }))
      .filter((item: AccountLabelOption) => {
        if (seen.has(item.label)) return false;
        seen.add(item.label);
        return true;
      });
    loaded = true;
    return labelOptions.value;
  }

  function labelNamesOf(labelIds?: Array<number | string>) {
    return (labelIds ?? [])
      .map(
        (id) =>
          labelOptions.value.find((item) => item.value === String(id))?.label ??
          String(id),
      )
      .filter(Boolean);
  }

  return { labelNamesOf, labelOptions, loadLabelOptions };
}
