// src/utils/trim.ts
/**去除输入框首位空格的方法 */
export function trimObject<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = { ...obj };

  Object.keys(result).forEach((key) => {
    if (typeof result[key] === 'string') {
      result[key] = result[key].trim();
    }
  });

  return result as T;
}
