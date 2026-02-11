import { calcFileMd5 } from './fileMd5';
import { getImageSize } from './fileImageInfo';

export interface FileMeta {
  fileMd5: string;
  fileSize: number;
  width: number;
  height: number;
}

/** 异步获取视频宽高 */
function getVideoSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    video.onerror = () => {
      resolve({ width: 0, height: 0 }); // 容错处理
    };
  });
}

export async function getFileMeta(file: File): Promise<FileMeta> {
  // 1. 先计算 MD5（现在支持大文件了）
  const md5 = await calcFileMd5(file);
  
  // 2. 根据类型获取宽高
  const isVideo = file.type.startsWith('video/');
  const info = isVideo ? await getVideoSize(file) : await getImageSize(file);

  return {
    fileMd5: md5,
    fileSize: file.size,
    width: info.width,
    height: info.height,
  };
}
