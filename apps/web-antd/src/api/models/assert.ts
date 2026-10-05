import type { BaseItem, PageRequestParams } from "#/api/models/core";


/**
 * 素材列表行
 * 对应后端 MaterialItem：素材行与文件夹行共用同一结构
 */
export interface MaterialItem extends BaseItem {
  albumId: string;
  rootAlbumId: string;
  name: string;
  /**
   * 行类型：1 文件夹 / 2 素材文件。
   * 注意它不是媒体类型 —— 素材表自己的 type（1 图片/2 视频/3 音频）在后端 DTO 里被覆盖了，
   * 媒体类型需要按扩展名或 videoDurationSecond 判断。
   */
  type: number;
  /** 格式：1 横版 / 2 竖版 */
  format: number;
  fileMd5: string;
  fileSize: string;
  fileUrl: string;
  thumbnailUrl: string;
  videoCoverUrl: string;
  fileSizeStr: string;
  videoDuration: string;
  videoDurationSecond: number;
  height: number;
  width: number;
  aspectRatio: string;
  aspectXy: string;
  /** 剪辑师ID */
  editor: string;
  /** 剪辑师姓名 */
  editorName: string;
  /** 备注 */
  remark: string;
  /** 文件夹下的素材数（仅文件夹行） */
  count: string;
  /** 父级文件夹ID（仅文件夹行） */
  parentId: string;
}


/**
 * 专辑列表
 */
export interface AlbumItem extends BaseItem {
  name: string;
  parentId: string;
  rootId: string;
  remark: string;
  level: number;
  children: Array<AlbumItem>;
}


/**
 * 落地页
 */

export interface PageViewItem extends BaseItem {
  name: string;
  platform: string;
  config: Record<string, any>;
}


/**
 * 素材推送
 */
export interface CreateMaterialPushTaskRequest {
  platform: string;
  name: string;
  materialIds: Array<string>;
  advertiserIds: Array<string>;
}


/**
 * push任务推送
 */
export interface PushTaskPageRequest extends PageRequestParams {
  name: string;
  platform: string;
  taskStatus: number;
}


/**
 * 素材推送任务
 */
export interface PushMaterialTaskItem extends BaseItem {
  name: string;
  platform: string;
  materialIds: Array<string>;
  accountIds: Array<string>;
  totalCount: number;
  successCount: number;
  failedCount: number;
  skipCount: number;
  taskStatus: number;
  startTime: string;
  endTime: string;
  version: number;
}


/**
 * 进度响应
 */
export interface PushMaterialTaskProgressVO {
  taskId: string;
  taskStatus: string;
  taskStatusName: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  skipCount: number;
  pendingCount: number;
  progressPercent: number;
  items: Array<PushMaterialTaskProgressItem>
}

// 具体的进度
export interface PushMaterialTaskProgressItem{
  materialId: string;
  materialName: string;
  advertiserId: string;
  advertiserName: string;
  status: string;
  platformMaterialId: string;
  platformVideoImgId: string;
  errorMessage: string;
  retryCount: number;
}
