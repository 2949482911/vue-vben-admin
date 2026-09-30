import { computed, ref, type Ref } from 'vue';

/** 批量操作应用模式：全部应用（共用一个配置）/ 单独设置（逐条配置） */
export type BatchMode = 'all' | 'individual';

export interface BatchRowMeta {
  /** 原始行在 rows 中的下标，用于映射逐条配置（rowConfigs[index]） */
  index: number;
  /** 展示用 ID */
  id: string | number;
  /** 展示用名称 */
  name: string;
  /** 原始行数据 */
  row: any;
}

/**
 * 批量操作「全部应用 / 单独设置」双模式的公共状态：
 * - mode：当前应用模式
 * - searchKeyword：单独设置模式下的顶部搜索关键字
 * - filteredRows：过滤后的行元信息（携带原始下标，方便映射逐条配置）
 */
export function useBatchOperationMode(
  rows: Ref<any[]>,
  idOf: (row: any) => string | number,
  nameOf: (row: any) => string,
) {
  const mode = ref<BatchMode>('all');
  const searchKeyword = ref('');

  const rowMetas = computed<BatchRowMeta[]>(() =>
    rows.value.map((row, index) => ({
      index,
      id: idOf(row) ?? '-',
      name: nameOf(row) ?? '-',
      row,
    })),
  );

  const filteredRows = computed<BatchRowMeta[]>(() => {
    const keyword = searchKeyword.value.trim().toLowerCase();
    if (!keyword) return rowMetas.value;
    return rowMetas.value.filter(
      (meta) =>
        String(meta.id).toLowerCase().includes(keyword) ||
        String(meta.name).toLowerCase().includes(keyword),
    );
  });

  return { mode, searchKeyword, filteredRows };
}
