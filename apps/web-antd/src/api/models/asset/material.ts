import type {BaseItem, PageRequestParams} from "#/api/models/core";

export interface MaterialAlbumItem extends BaseItem {
  name: string;
  parentId: string;
  count: number;
  children: Array<MaterialAlbumItem>
}

export interface CreateMaterialAlbumRequest {
  name: string;
  parentId: string;
  remark: string;
}

export interface UpdateMaterialAlbumRequest extends CreateMaterialAlbumRequest {
  id: string;
}


/**
 * material page request params
 */
export interface MaterialPageRequestParams extends PageRequestParams {
  name: string;
  fileName: string;
  fileMd5: string;
  albumId: string;
  albumRootId: string;
  fileType: string;
}


export interface MaterialItem extends BaseItem {
  name: string;
  type: number;
  count: number;
  coverImage: string;
}




export interface UploadMaterialRequest {
  file: File;
  albumId: string;
  albumRootId: string;
}


export interface CreateMaterialRequest {
  albumId: string;
  fileName: string;
  fileMd5: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl: string;
  fileType: string;
  videoDuration: string;
  width: string;
  height: string;
}

/**
 * UploadResponse interface
 */
export interface UploadResponse {
  fileUrl: string;
  filename: string;
  fileSize: number;
  width: number;
  height: number;
  fileType: string;
  fileMd5: string;
  cover: string;
  videoDuration: string;
  thumbnailUrl: string;
}
