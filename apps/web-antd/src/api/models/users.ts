import type {BaseItem} from "#/api/models/core";


export interface OrgItem  extends BaseItem{
  name: string;
  code: string;
  parentId: string;
  children: OrgItem[];
}

export interface OrgCreateRequest {
  id: string;
  name: string;
  parentId: string;
}

export interface OrgUpdateRequest extends OrgCreateRequest{}
