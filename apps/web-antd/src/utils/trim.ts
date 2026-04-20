export function trimObject<T>(obj: T): T {
  const seen = new WeakSet();

  function deepTrim(target: unknown): unknown {
    if (target === null || target === undefined || typeof target !== 'object') {
      return target;
    }
    if (seen.has(target)) return target;
    seen.add(target);

    if (Array.isArray(target)) {
      return target.map(item => deepTrim(item));
    }
    if (target instanceof Date || target instanceof RegExp || target instanceof Map || target instanceof Set) {
      return target;
    }

    const result: Record<string, any> = {};
    for (const key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        const value = target[key];
        // 删除 所有空白（半角空格+全角空格+制表+换行+中间空格）
        result[key] = typeof value === 'string' 
          ? value.replace(/[\s\u3000]/g, '') 
          : deepTrim(value);
      }
    }
    return result;
  }

  return deepTrim(obj) as T;
}
