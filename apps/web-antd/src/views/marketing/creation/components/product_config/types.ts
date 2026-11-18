export type ProductConfigAllocationMethod =
  | 'ALL_SAME'
  | 'AVERAGE'
  | 'PER_ACCOUNT';

/** 单条产品配置项 */
export interface ProductConfigItem {
  titles: string[];
  selling_points: string[];
  action_buttons: string[];
  image_button: string[];
}

/** 巨量产品配置：多条配置项 + 分配规则 */
export interface ProductConfigAllocationConfig {
  config: {
    method: ProductConfigAllocationMethod;
  };
  /**
   * 统一配置 / 平均分配：key='0'
   * 分账户配置：key=advertiserId
   */
  data: Map<string, ProductConfigItem[]>;
}

export function createEmptyProductConfigItem(): ProductConfigItem {
  return {
    action_buttons: [],
    image_button: [],
    selling_points: [],
    titles: [],
  };
}

export function createEmptyProductConfig(): ProductConfigAllocationConfig {
  return {
    config: { method: 'ALL_SAME' },
    data: new Map(),
  };
}

export function cloneProductConfigItem(
  item: ProductConfigItem,
): ProductConfigItem {
  return {
    action_buttons: [...(item.action_buttons ?? [])],
    image_button: [...(item.image_button ?? [])],
    selling_points: [...(item.selling_points ?? [])],
    titles: [...(item.titles ?? [])],
  };
}

export function normalizeProductConfig(
  value?: null | ProductConfigAllocationConfig,
): ProductConfigAllocationConfig {
  if (!value) {
    return createEmptyProductConfig();
  }
  const rawMethod = String(value.config?.method || 'ALL_SAME');
  const method: ProductConfigAllocationMethod =
    rawMethod === 'PER_ACCOUNT'
      ? 'PER_ACCOUNT'
      : rawMethod === 'AVERAGE' || rawMethod === 'PER_PROJECT'
        ? 'AVERAGE'
        : 'ALL_SAME';
  const rawData =
    value.data instanceof Map
      ? value.data
      : new Map<string, ProductConfigItem[]>(
          Object.entries(value.data || {}),
        );
  const data = new Map<string, ProductConfigItem[]>();
  rawData.forEach((items, key) => {
    data.set(
      key,
      (items ?? []).map((item) => cloneProductConfigItem(item)),
    );
  });
  return { config: { method }, data };
}

export interface ProductConfigResolveContext {
  advertiserId: string;
  /** 当前账户下的计划序号 */
  projectIndex: number;
  /** 所有账户展开后的全局计划序号，用于平均分配 */
  globalProjectIndex: number;
}

/**
 * 按配置解析某个计划应使用的产品配置项。
 *
 * - 统一配置：所有账户共用一组，账户内计划从第 1 条循环
 * - 分账户配置：账户内计划循环使用该账户配置
 * - 平均分配：全局计划按顺序循环使用配置项
 */
export function resolveProductConfigItem(
  config: null | ProductConfigAllocationConfig | undefined,
  ctx: ProductConfigResolveContext,
): null | ProductConfigItem {
  if (!config?.data) {
    return null;
  }
  const method = config.config.method;

  if (method === 'PER_ACCOUNT') {
    const items = config.data.get(ctx.advertiserId) ?? [];
    if (items.length === 0) {
      return null;
    }
    return items[ctx.projectIndex % items.length] ?? null;
  }

  const items = config.data.get('0') ?? [];
  if (items.length === 0) {
    return null;
  }
  if (method === 'AVERAGE') {
    return items[ctx.globalProjectIndex % items.length] ?? null;
  }
  return items[ctx.projectIndex % items.length] ?? null;
}

export function countProductConfigs(
  config: null | ProductConfigAllocationConfig | undefined,
): number {
  if (!config?.data) {
    return 0;
  }
  let total = 0;
  config.data.forEach((items) => {
    total += items.length;
  });
  return total;
}
