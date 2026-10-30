/**
 * 后端业务错误原文提取：优先 response.data.message/error，其次 Axios message。
 * 完结被拦、剧本校验/定稿 400 等需要把后端场次/章节清单原样展示，不能再用通用兜底覆盖。
 */
function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === 'string' ? item : JSON.stringify(item),
      )
      .join('；');
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nested = record.message ?? record.msg ?? record.error;
    return typeof nested === 'string' ? nested : JSON.stringify(value);
  }
  return String(value);
}

export function backendErrorMessage(error: any) {
  const body = error?.response?.data ?? error?.data;
  const candidates = [
    body?.message,
    body?.msg,
    body?.error,
    body?.data?.message,
    body?.data?.msg,
    body?.data?.error,
    body?.data,
    error?.message,
    error?.msg,
    error?.error,
  ];
  for (const candidate of candidates) {
    if (
      typeof candidate === 'string' &&
      candidate.startsWith('Request failed with status code')
    ) {
      continue;
    }
    const text = toText(candidate);
    if (text) {
      return text;
    }
  }
  return '';
}

export function apiErrorText(error: any, fallback: string) {
  return backendErrorMessage(error) || fallback;
}
