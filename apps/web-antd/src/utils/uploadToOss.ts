// src/utils/uploadToOss.ts
import type { OssClient } from '#/types/ali-oss-client';

/**抽离出来OSS上传的方法 */
export async function uploadToOss(
  client: OssClient,
  file: File,
  objectKey: string,
  onProgress?: (percent: number) => void
) {
  return client.put(objectKey, file, {
    progress: (p: number) => {
      onProgress?.(Math.floor(p * 100));
    },
  });
}
