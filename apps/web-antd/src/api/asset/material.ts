import {BaseApi} from "#/api/core/baseapi";
import {requestClient} from '#/api/request';
import type {
  CreateMaterialAlbumRequest, CreateMaterialRequest,
  MaterialAlbumItem, MaterialItem, MaterialPageRequestParams,
  UpdateMaterialAlbumRequest, UploadMaterialRequest, UploadResponse
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

    fetchAlbumBatchOptions(params: BatchOptions) {
      return requestClient.post(this.getServiceUrl("batch_options"), params)
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
        return requestClient.post(this.getServiceUrl("upload_material"), params,)
    }

    /**
     * 文件上传
     * @param file
     */
    fetchUpload(file: File) : Promise<UploadResponse> {
        return requestClient.upload(this.getServiceUrl("upload"), {file})
    }

  /**
   * create material
   * @param params
   */
  fetchCreateMaterial(params: CreateMaterialRequest) {
        return requestClient.post(this.getServiceUrl("create"), params)
    }
}

export const materialApi = new MaterialApi("/media_service/material");




