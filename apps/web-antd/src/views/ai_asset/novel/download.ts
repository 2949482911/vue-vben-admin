import { triggerDownload } from '@vben/utils';

import { backendErrorMessage } from './apiError';

/**
 * 后端导出接口返回 OSS 地址，前端只负责触发下载；
 * 不在这里拼接文件流，避免与后端实际契约（JSON url）不一致。
 */
export function downloadExportUrl(url?: string, fileName?: string) {
  if (!url) {
    throw new Error('导出接口未返回下载地址');
  }
  triggerDownload(url, fileName || '下载文件');
}

/** 导出/下载失败提示：404 说明接口未就绪，400 保留后端原文并追加建议 */
export function downloadErrorText(error: any, fallback: string, advice: string) {
  const code = Number(
    error?.response?.status ?? error?.code ?? error?.data?.code,
  );
  if (code === 404) {
    return '功能未开放：导出接口未就绪，待后端上线后重试';
  }
  const raw = backendErrorMessage(error) || fallback;
  return code === 400 ? `${raw}（${advice}）` : raw;
}
