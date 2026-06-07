import type {BaseItem} from "#/api/models/core";


/**
 * 素材列表
 */
export interface MaterialItem extends BaseItem {
  albumId: string;
  rootAlbumId: string;
  name: string;
  type: number;
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
}


/**
 * 专辑列表
 */
export interface AlbumItem extends BaseItem{
  name: string;
  parentId: string;
  rootId: string;
  remark: string;
  level: number;
  children: Array<AlbumItem>
}
