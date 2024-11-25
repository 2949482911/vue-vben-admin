export interface MenuItem {
  id: string;
  type: number;
  name: string;
  icon: string;
  path: string;
  redirect: string;
  backendUrl: string;
  mark: string;
  isLogin: number;
  hideMenu: number;
  title: string;
  component: string;
  parentId: string;
  sort: number;
  isWhite: number;
  isInternal: number;
  children: MenuItem[];
}

export interface CreateMenuRequest {
  id: string;
  type: number;
  name: string;
  icon: string;
  path: string;
  redirect: string;
  backendUrl: string;
  mark: string;
  isLogin: number;
  hideMenu: number;
  title: string;
  component: string;
  parentId: string;
  sort: number;
  isWhite: number;
  isInternal: number;
}

export type UpdateMenuRequest = CreateMenuRequest;
