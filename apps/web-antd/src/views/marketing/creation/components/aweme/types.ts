import type {
  AwemeConfigData,
  AwemeDistributionRule,
  AwemeMapping,
} from '#/views/marketing/creation/creation';

export function createEmptyAwemeConfig(): AwemeConfigData {
  return {
    config: { method: 'ALL_SAME' },
    data: new Map(),
  };
}

export function normalizeAwemeConfig(
  value?: AwemeConfigData | null,
): AwemeConfigData {
  if (!value) {
    return createEmptyAwemeConfig();
  }
  const rawMethod = String(value.config?.method || 'ALL_SAME');
  const method: AwemeDistributionRule =
    rawMethod === 'PER_ACCOUNT'
      ? 'PER_ACCOUNT'
      : rawMethod === 'AVERAGE' ||
          rawMethod === 'PER_PROJECT' ||
          rawMethod === 'PER_AD'
        ? 'AVERAGE'
        : 'ALL_SAME';
  const data =
    value.data instanceof Map
      ? value.data
      : new Map<string, AwemeMapping[]>(
          Object.entries(value.data || {}),
        );
  const normalized = new Map<string, AwemeMapping[]>();
  data.forEach((items, key) => {
    normalized.set(
      key,
      (items ?? []).map((item) => ({ ...item })),
    );
  });
  return { config: { method }, data: normalized };
}

export interface AwemeResolveContext {
  advertiserId: string;
  /** 当前账户下的计划序号 */
  projectIndex: number;
  /** 所有账户展开后的全局计划序号 */
  globalProjectIndex: number;
}

/**
 * 解析某个计划应使用的抖音号。
 *
 * - 统一配置：全账户共用一组，账户内计划循环
 * - 分账户配置：账户内计划循环
 * - 平均分配：全局计划顺序循环
 */
export function resolveAweme(
  config: AwemeConfigData | null | undefined,
  ctx: AwemeResolveContext,
): AwemeMapping | null {
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

export function countAwemes(
  config: AwemeConfigData | null | undefined,
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
