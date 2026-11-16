import { ref } from 'vue';

import { accountLabelApi } from '#/api';

export interface AccountLabelOption {
  label: string;
  value: string;
}

/**
 * 标签多选数据源（platform_advertiser_tag 列表）
 * 资产类数据统一存 labelIds（标签ID数组），展示时按 ID 映射名称。
 * @param labelType 标签类型（字典 label_type），不同资产只查自己的标签
 */
export function useAccountLabelOptions(labelType?: string) {
  const labelOptions = ref<AccountLabelOption[]>([]);
  let loaded = false;

  async function loadLabelOptions(force = false) {
    if (loaded && !force) {
      return labelOptions.value;
    }
    const res: any = await accountLabelApi.fetchGetAccountLabelList({
      page: 1,
      pageSize: 1000,
      ...(labelType ? { labelType } : {}),
    });
    labelOptions.value = (res?.items ?? [])
      .filter((item: any) => item.status === undefined || item.status === 1)
      .map((item: any) => ({
        label: item.name || String(item.id),
        value: String(item.id),
      }));
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
