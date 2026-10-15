/**
 * 素材库 / 资产 页面公共状态
 *
 * 素材库、资产是两个菜单入口、同一个页面：两个入口文件各自用 vben Page 包最外层，
 * 这里集中提供分段状态、页头文案与右上角操作转发，避免入口文件各维护一套逻辑。
 */
import { computed, ref } from 'vue';

export type LibraryTab = 'catalog' | 'media';

/** 页面级分段（素材库 / 资产） */
export const LIBRARY_PAGE_TABS: Array<{ label: string; value: LibraryTab }> = [
  { label: '素材库', value: 'media' },
  { label: '资产', value: 'catalog' },
];

/** 面板对外暴露：右上角按钮文案 + 打开新增抽屉 */
export interface LibraryPanelExpose {
  addLabel: string;
  openCreate: () => void;
}

const PAGE_META: Record<LibraryTab, { description: string; title: string }> = {
  catalog: {
    description: '角色 / 场景 / 分集 —— 多轮生成「一致性」的锚',
    title: '资产',
  },
  media: {
    description: '上传 / 生成 / 管理 AI 图片、视频、音频素材',
    title: '素材库',
  },
};

export function useLibraryPage(defaultTab: LibraryTab) {
  const topTab = ref<LibraryTab>(defaultTab);
  const panelRef = ref<LibraryPanelExpose | null>(null);

  /** 页头标题/说明跟随当前分段 */
  const meta = computed(() => PAGE_META[topTab.value]);

  /** 右上角按钮文案由当前面板提供（素材库=新增素材，资产=新增角色/场景/分集） */
  const addLabel = computed(() => panelRef.value?.addLabel ?? '新增');

  function openCreate() {
    panelRef.value?.openCreate();
  }

  /** 面板切换用函数式 ref，保证始终指向当前挂载的面板 */
  function setPanelRef(el: any) {
    panelRef.value = (el as LibraryPanelExpose | null) ?? null;
  }

  return { addLabel, meta, openCreate, setPanelRef, topTab };
}
