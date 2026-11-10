/**
 * 短剧工作台错误原文提取。
 *
 * 后端业务错误包装为 {code,msg,data}：400/409 展示 msg 原文，404 只标记「接口未就绪」，
 * 5xx/网络错误标记可重试；data.blockers 原样保留 action/target，供调用方展示。
 * 这里不弹 toast，调用方决定内联展示还是提示，避免一次操作出现多条错误。
 */
export interface DramaBlocker {
  action?: string;
  code?: string;
  message: string;
  seq?: number;
  targetId?: number | string;
  targetType?: string;
}

export interface DramaApiError {
  blockers: DramaBlocker[];
  message: string;
  notReady: boolean;
  retryable: boolean;
  status?: number;
}

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return toText(record.msg) || toText(record.message) || toText(record.error);
  }
  return '';
}

function parseBlockers(value: unknown): DramaBlocker[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const blockers: DramaBlocker[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) {
      continue;
    }
    const record = item as Record<string, unknown>;
    const message = toText(record.message ?? record.msg);
    if (!message) {
      continue;
    }
    blockers.push({
      action: toText(record.action) || undefined,
      code: toText(record.code) || undefined,
      message,
      seq: typeof record.seq === 'number' ? record.seq : undefined,
      targetId:
        typeof record.targetId === 'number' || typeof record.targetId === 'string'
          ? record.targetId
          : undefined,
      targetType: toText(record.targetType) || undefined,
    });
  }
  return blockers;
}

function getDataRecord(value: unknown) {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

export function parseApiError(error: unknown): DramaApiError {
  const record = error as {
    message?: unknown;
    response?: { data?: unknown; status?: number };
  };
  const status = record?.response?.status;
  const body = record?.response?.data;
  const bodyRecord = getDataRecord(body);
  const dataRecord = getDataRecord(bodyRecord?.data);
  const axiosMessage = toText(record?.message);
  const message =
    toText(bodyRecord?.msg) ||
    toText(bodyRecord?.message) ||
    toText(bodyRecord?.error) ||
    toText(bodyRecord?.data) ||
    (axiosMessage.startsWith('Request failed with status code')
      ? ''
      : axiosMessage) ||
    (status ? `请求失败（HTTP ${status}）` : '请求失败');
  const blockers = parseBlockers(dataRecord?.blockers);
  if (!blockers.length) {
    blockers.push(...parseBlockers(bodyRecord?.blockers));
  }
  return {
    blockers,
    message,
    notReady: status === 404,
    retryable: status === undefined || status >= 500,
    status,
  };
}

/** 统一错误展示文案：接口未就绪 / 后端原文 / 可重试 / blockers */
export function formatApiError(info?: DramaApiError): string {
  if (!info) {
    return '';
  }
  if (info.notReady) {
    return '接口未就绪';
  }
  const parts = [info.message];
  if (info.retryable) {
    parts.push('可重试');
  }
  for (const blocker of info.blockers) {
    parts.push(
      blocker.action
        ? `${blocker.message}（${blocker.action}）`
        : blocker.message,
    );
  }
  return parts.filter(Boolean).join('；');
}
