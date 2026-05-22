import type { ReportFilter } from '#/api/models';

/**
 * 将平铺的表单数据转换为后端要求的 filters 数组
 */
export function buildApiFilters(
  formValues: Record<string, any>,
  operatorMap: Record<string, number>,
): any[] {
  const filters: ReportFilter[] = [];

  Object.keys(operatorMap).forEach((key) => {
    const val = formValues[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      filters.push({
        field: key,
        operator: operatorMap[key] as number,
        values: Array.isArray(val) ? val.map((v) => String(v).trim()) : [String(val).trim()],
      });
    }
  });

  return filters;
}
