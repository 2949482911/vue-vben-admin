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
  hideInBreadcrumb: boolean;
  hideInTab: boolean;
  ignoreAccess: boolean;
  menuVisibleWithForbidden: boolean;
  openInNewWindow: boolean;
  affixTabOrder: number;
  affixTab: boolean;
  hideChildrenInMenu: boolean;
  iframeSrc: string;
  link: string;
  hideInMenu: boolean;
  badgeVariants: string;
  badgeType: string;
  badge: string;
  activeIcon: string;
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
  hideInMenu: number;
  title: string;
  component: string;
  parentId: string;
  sort: number;
  isWhite: number;
  isInternal: number;
  hideInBreadcrumb: boolean;
  hideInTab: boolean;
  ignoreAccess: boolean;
  menuVisibleWithForbidden: boolean;
  openInNewWindow: boolean;
  affixTabOrder: number;
  affixTab: boolean;
  hideChildrenInMenu: boolean;
  iframeSrc: string;
  link: string;
  badgeVariants: string;
  badgeType: string;
  badge: string;
  activeIcon: string;
}

export type UpdateMenuRequest = CreateMenuRequest;
