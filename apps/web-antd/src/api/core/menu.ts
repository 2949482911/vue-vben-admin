import type { RouteRecordStringComponent } from '@vben/types';

import type {
  CreateMenuRequest,
  MenuItem,
  UpdateMenuRequest,
} from '#/api/models/menu';

import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
}

export async function fetchMenuTree() {
  return requestClient.get<MenuItem[]>('/sys/menu/list');
}

export async function fetchCreateMenu(params: CreateMenuRequest) {
  return requestClient.post(`/sys/menu/create`, params);
}

export async function fetchUpdateMenu(params: UpdateMenuRequest) {
  return requestClient.post(`/sys/menu/update`, params);
}
