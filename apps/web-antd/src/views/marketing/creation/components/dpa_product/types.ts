import type { BytedanceDpaProductListItem } from '#/api/models/bytedance';

export type DpaProductAllocationMethod =
  | 'ALL_SAME'
  | 'AVERAGE'
  | 'PER_ACCOUNT';

/** 巨量投放商品配置：统一配置 / 分账户配置 / 平均分配 */
export interface DpaProductAllocationConfig {
  config: {
    method: DpaProductAllocationMethod;
  };
  /**
   * 统一配置 / 平均分配：key='0'
   * 分账户配置：key=advertiserId
   */
  data: Map<string, BytedanceDpaProductListItem[]>;
}

export function createEmptyDpaProductConfig(): DpaProductAllocationConfig {
  return {
    config: { method: 'ALL_SAME' },
    data: new Map(),
  };
}

/** 兼容策略组复用后 Map 被 JSON 序列化成普通对象 */
export function normalizeDpaProductConfig(
  value?: DpaProductAllocationConfig | null,
): DpaProductAllocationConfig {
  if (!value) {
    return createEmptyDpaProductConfig();
  }
  const data =
    value.data instanceof Map
      ? value.data
      : new Map<string, BytedanceDpaProductListItem[]>(
          Object.entries(value.data || {}),
        );
  return {
    config: { method: value.config?.method || 'ALL_SAME' },
    data,
  };
}

export interface DpaProductResolveContext {
  advertiserId: string;
  /** 当前账户下的计划序号 */
  projectIndex: number;
  /** 所有账户展开后的全局计划序号，用于平均分配 */
  globalProjectIndex: number;
}

/**
 * 按配置解析某个项目应使用的商品。
 *
 * - 统一配置：所有计划使用第 1 个商品
 * - 分账户配置：账户内计划按顺序循环使用该账户商品
 * - 平均分配：全局计划按顺序循环使用商品
 */
export function resolveDpaProduct(
  config: DpaProductAllocationConfig | null | undefined,
  ctx: DpaProductResolveContext,
): BytedanceDpaProductListItem | null {
  if (!config?.data) {
    return null;
  }
  const method = config.config.method;

  if (method === 'PER_ACCOUNT') {
    const accountProducts = config.data.get(ctx.advertiserId) ?? [];
    if (accountProducts.length === 0) {
      return null;
    }
    return (
      accountProducts[ctx.projectIndex % accountProducts.length] ?? null
    );
  }

  const products = config.data.get('0') ?? [];
  if (products.length === 0) {
    return null;
  }
  if (method === 'AVERAGE') {
    return products[ctx.globalProjectIndex % products.length] ?? null;
  }
  return products[0] ?? null;
}

/** 当前配置下已选商品总数（按账户配置时累加所有账户） */
export function countDpaProducts(
  config: DpaProductAllocationConfig | null | undefined,
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
