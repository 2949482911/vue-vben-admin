/**
 * 素材库 / 资产 页面公共定义
 *
 * 素材库、资产是两个菜单入口、同一个页面。页头/操作按钮已下到各面板自己的工具栏里
 * （对齐营销素材库：上边一条工具栏 + 下面素材网格），所以这里只留页面级分段的定义。
 */
import { ref } from 'vue';

export type LibraryTab = 'catalog' | 'media' | 'setting';

/** 页面级分段（素材库 / 资产） */
export const LIBRARY_PAGE_TABS: Array<{ label: string; value: LibraryTab }> = [
  { label: '素材库', value: 'media' },
  { label: '资产', value: 'catalog' },
  { label: '创作素材', value: 'setting' },
];

export function useLibraryPage(defaultTab: LibraryTab) {
  const topTab = ref<LibraryTab>(defaultTab);
  return { topTab };
}
