import { uploadToOss } from '#/utils/uploadToOss';
import { useOssClient } from '#/views/marketing/asset/material/useOssClient';

const OSS_BASE = 'https://proxy-ads.oss-cn-shenzhen.aliyuncs.com';

/**
 * AI 资产 — OSS 直传（前端拿 STS → 直传 OSS → 返回完整可访问 url）
 *
 * 资产（角色/场景/小说）与素材上传共用；后端 `storageUrl` 存完整地址（含域名）。
 */
export function useAssetUpload(prefix = 'ai-asset/catalog') {
  async function upload(file: File): Promise<string> {
    const client = await useOssClient();
    const safe = file.name.replaceAll(/[^\w.-]/g, '_');
    const objectKey = `${prefix}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}-${safe}`;
    await uploadToOss(client, file, objectKey);
    return `${OSS_BASE}/${objectKey}`;
  }

  return { upload };
}
