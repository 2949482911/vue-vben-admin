import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';
import type {
  CreateMaterialAlbumRequest,
  MaterialAlbumItem, MaterialItem, MaterialPageRequestParams,
  UpdateMaterialAlbumRequest, UploadMaterialRequest
} from "#/api/models/asset";
import type {BatchOptions} from "#/api/models/core";


// 文件夹
class MaterialAlbumApi extends BaseApi {
  /**
   * material album
   */
  fetchAlbumTree(): Promise<MaterialAlbumItem[]> {
    return requestClient.get<MaterialAlbumItem[]>(this.getServiceUrl("tree"))
  }

  fetchAlbumCreate(params: CreateMaterialAlbumRequest) {
    return requestClient.post(this.getServiceUrl("create"), params);
  }

  fetchAlbumUpdate(params: UpdateMaterialAlbumRequest) {
    return requestClient.post(this.getServiceUrl("update"), params);
  }


}


export const materialAlbumApi = new MaterialAlbumApi("/media_service/material_album");


/**
 *  material request api
 */
class MaterialApi extends BaseApi {

  fetchMaterialList(params: MaterialPageRequestParams) {
    return requestClient.get<MaterialItem[]>(this.getServiceUrl("list"), {params})
  }

  fetchMaterialBatchOptions(params: BatchOptions) {
    return requestClient.post<BatchOptions>(this.getServiceUrl("batch_options"), params)
  }

  /**
   * 文件上传
   * @param params
   */
  fetchMaterialUpload(params: UploadMaterialRequest) {
    requestClient.post(this.getServiceUrl("upload_material"), params, )
  }
}

export const materialApi = new MaterialApi("/media_service/material");




