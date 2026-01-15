// src/utils/fileMeta.ts
import { calcFileMd5 } from './fileMd5';
import { getImageSize } from './fileImageInfo';

export interface FileMeta {
  fileMd5: string;
  fileSize: number;
  width: number;
  height: number;
}

/**统计md5大小、宽高、文件size */
export async function getFileMeta(file: File): Promise<FileMeta> {
  const [md5, imageInfo] = await Promise.all([
    calcFileMd5(file),
    getImageSize(file),
  ]);

  return {
    fileMd5: md5,
    fileSize: file.size,
    width: imageInfo.width,
    height: imageInfo.height,
  };
}
