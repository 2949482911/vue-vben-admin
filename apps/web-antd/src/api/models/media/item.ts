import type {BaseItem, PageRequestParams} from "#/api/models/core";


export interface BrandParams extends PageRequestParams {
  platform: string;
  name: string;
  nameEn: string;
}

export interface BrandItem extends BaseItem {
  platform: string;
  name: string;
  nameEn: string;
}


export interface CategoryParams extends PageRequestParams {
  platform: string;
  name: string;
  accountId: string;
}

export interface CategoryItem extends BaseItem {
  platform: string;
  platformCategoryId: string;
  platformCategoryName: string;
  platformCategoryPid: string;
  children: Array<CategoryParams>;
}
