<script lang="ts" setup name="StudioRefPickerDrawer">
/**
 * 参考素材选择抽屉（图生图 / 图编辑）
 *
 * 两个来源：
 * - 素材库：营销素材库（GET /album/tree 专辑 + GET /material/list 分页，仅图片）
 * - 资产库：当前工作区的资产素材（GET /ai_asset/material/list?materialType=image，带 X-Workspace-Id）
 * 多选上限 3；确定后把选中的 URL 列表交回页面 → GenerateRequest.refImages。
 */
import type { RefAsset } from "../constants";

import type { MaterialItem as WorkspaceMaterial } from "#/api/models/ai_asset";

import { computed, ref } from "vue";

import { useVbenDrawer, VbenLoading } from "@vben/common-ui";

import { CheckOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons-vue";
import { Empty, Input, message, Pagination, Select } from "ant-design-vue";

import { aiAssetApi } from "#/api";
import { materialLibraryApi, uploadEditApi } from "#/api/core/marketing";

import { MATERIAL_STATUS_MAP, materialDisplayName } from "../../constants";

const emit = defineEmits<{ confirm: [refs: RefAsset[]] }>();

type SourceTab = "album" | "workspace";

const activeTab = ref<SourceTab>("album");
const maxCount = ref(3);
const sources = ref<SourceTab[]>(["album", "workspace"]);
const drawerTitle = ref("选择参考素材");
const drawerHint = ref("最多选 3 张 · 用于图生图 / 图编辑（选中后作为 refImages 提交）");

// ==================== 素材库（营销素材库） ====================

const albumOptions = ref<Array<{ label: string; value: string }>>([]);
const albumId = ref<string | undefined>();
const albumKeyword = ref("");
const albumRows = ref<RefAsset[]>([]);
const albumTotal = ref(0);
const albumPage = ref(1);
const albumPageSize = ref(30);
const albumLoading = ref(false);

/** 专辑树 → 下拉选项（按层级缩进） */
function flattenAlbums(
  nodes: any[],
  depth = 0,
  out: Array<{ label: string; value: string }> = []
) {
  for (const node of nodes ?? []) {
    out.push({
      label: `${"　".repeat(depth)}${node.name ?? `专辑 #${node.id}`}`,
      value: String(node.id)
    });
    if (node.children?.length) {
      flattenAlbums(node.children, depth + 1, out);
    }
  }
  return out;
}

async function loadAlbums() {
  try {
    const raw: any = await materialLibraryApi.fetchDirectoryTreeList();
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    albumOptions.value = flattenAlbums(list);
  } catch {
    albumOptions.value = [];
  }
}

/** 营销素材行：type=1 是文件夹（排除），仅图片 */
function toAlbumRef(item: any): RefAsset {
  const parts: string[] = [];
  if (item.width && item.height) {
    parts.push(`${item.width}×${item.height}`);
  }
  if (item.fileSizeStr) {
    parts.push(item.fileSizeStr);
  }
  return {
    description: parts.join(" · "),
    id: item.id,
    name: item.name ?? `素材 #${item.id}`,
    url: item.thumbnailUrl || item.fileUrl
  };
}

async function loadAlbumRows() {
  albumLoading.value = true;
  try {
    const res: any = await uploadEditApi.fetchMaterialList({
      albumId: albumId.value,
      name: albumKeyword.value.trim() || undefined,
      page: albumPage.value,
      pageSize: albumPageSize.value,
      type: 1 // 仅图片
    });
    albumRows.value = ((res?.items ?? []) as any[])
      .filter((item) => item.type !== 1 && item.thumbnailUrl)
      .map(toAlbumRef);
    albumTotal.value = res?.total ?? albumRows.value.length;
  } finally {
    albumLoading.value = false;
  }
}

// ==================== 资产库（当前工作区） ====================

const wsStatus = ref<number | undefined>();
const wsRows = ref<RefAsset[]>([]);
const wsTotal = ref(0);
const wsPage = ref(1);
const wsPageSize = ref(12);
const wsLoading = ref(false);

function toWorkspaceRef(item: WorkspaceMaterial): RefAsset {
  const parts: string[] = [];
  if (item.width && item.height) {
    parts.push(`${item.width}×${item.height}`);
  }
  if (item.fileSizeStr) {
    parts.push(item.fileSizeStr);
  }
  parts.push(MATERIAL_STATUS_MAP[item.status ?? 1]?.label ?? "");
  return {
    description: parts.filter(Boolean).join(" · "),
    id: item.id,
    name: materialDisplayName(item),
    url: item.thumbnailUrl || item.storageUrl || ""
  };
}

async function loadWorkspaceRows() {
  wsLoading.value = true;
  try {
    const res = await aiAssetApi.fetchMaterialList({
      materialType: "image",
      page: wsPage.value,
      pageSize: wsPageSize.value,
      status: wsStatus.value
    });
    wsRows.value = (res?.items ?? [])
      .map(toWorkspaceRef)
      .filter((item) => item.url);
    wsTotal.value = res?.total ?? wsRows.value.length;
  } finally {
    wsLoading.value = false;
  }
}

// ==================== 多选 ====================

const selectedMap = ref<Map<string, RefAsset>>(new Map());
const selectedList = computed(() => [...selectedMap.value.values()]);

function isSelected(id: number | string) {
  return selectedMap.value.has(String(id));
}

function toggle(item: RefAsset) {
  const key = String(item.id);
  if (selectedMap.value.has(key)) {
    selectedMap.value.delete(key);
  } else {
    if (selectedMap.value.size >= maxCount.value) {
      message.warning(`最多选 ${maxCount.value} 张`);
      return;
    }
    selectedMap.value.set(key, item);
  }
  selectedMap.value = new Map(selectedMap.value);
}

function switchTab(tab: SourceTab) {
  activeTab.value = tab;
  if (tab === "album" && albumRows.value.length === 0) {
    void loadAlbumRows();
  }
  if (tab === "workspace" && wsRows.value.length === 0) {
    void loadWorkspaceRows();
  }
}

function onAlbumPageChange(current: number, size: number) {
  albumPage.value = current;
  albumPageSize.value = size;
  void loadAlbumRows();
}

function onWsPageChange(current: number, size: number) {
  wsPage.value = current;
  wsPageSize.value = size;
  void loadWorkspaceRows();
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: "w-[760px]",
  // 抽屉内容改成 flex 列：筛选固定 / 网格占满并内滚 / 分页与已选固定
  contentClass: "flex min-h-0 flex-col gap-3 p-3",
  closeOnPressEscape: true,
  async onConfirm() {
    if (selectedList.value.length === 0) {
      await message.warning("请先选择参考图");
      return;
    }
    emit("confirm", selectedList.value);
    await drawerApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    const data = drawerApi.getData() as
      | undefined
      | {
          hint?: string;
          max?: number;
          selected?: RefAsset[];
          sources?: SourceTab[];
          title?: string;
        };
    selectedMap.value = new Map(
      (data?.selected ?? []).map((item) => [String(item.id), item])
    );
    maxCount.value = data?.max ?? 3;
    sources.value = data?.sources ?? ["album", "workspace"];
    drawerTitle.value = data?.title ?? "选择参考素材";
    drawerHint.value =
      data?.hint ?? `最多选 ${maxCount.value} 张 · 选中后作为参考素材`;
    activeTab.value = sources.value[0] ?? "workspace";
    if (activeTab.value === "album") {
      if (albumOptions.value.length === 0) {
        void loadAlbums();
      }
      void loadAlbumRows();
    } else {
      void loadWorkspaceRows();
    }
  }
});
</script>

<template>
  <Drawer :title="drawerTitle">
    <p class="ref-hint">{{ drawerHint }}</p>

    <!-- 来源切换 -->
    <div class="ref-tabs">
      <button
        v-if="sources.includes('album')"
        class="ref-tab"
        :class="{ 'is-on': activeTab === 'album' }"
        type="button"
        @click="switchTab('album')"
      >
        素材库
      </button>
      <button
        v-if="sources.includes('workspace')"
        class="ref-tab"
        :class="{ 'is-on': activeTab === 'workspace' }"
        type="button"
        @click="switchTab('workspace')"
      >
        资产库
      </button>
      <span class="ref-tabs__src">
        {{
          activeTab === "album"
            ? "营销素材库 · 仅图片"
            : "AI 资产库（当前工作区）"
        }}
      </span>
    </div>

    <!-- 筛选 -->
    <div class="ref-filter">
      <template v-if="activeTab === 'album'">
        <Input
          v-model:value="albumKeyword"
          allow-clear
          class="ref-search"
          placeholder="搜索素材名称"
          @press-enter="albumPage = 1; loadAlbumRows()"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </Input>
        <Select
          v-model:value="albumId"
          allow-clear
          class="ref-select"
          :options="albumOptions"
          placeholder="全部专辑"
          @change="albumPage = 1; loadAlbumRows()"
        />
      </template>
      <template v-else>
        <Select
          v-model:value="wsStatus"
          allow-clear
          class="ref-select"
          :options="[
            { label: '已确认', value: 2 },
            { label: '已入库', value: 3 },
            { label: '草稿', value: 1 },
          ]"
          placeholder="全部状态"
          @change="wsPage = 1; loadWorkspaceRows()"
        />
      </template>
    </div>

    <!-- 素材网格：占满剩余高度，自身滚动（与素材库一致） -->
    <div class="ref-body">
      <div
        v-if="(activeTab === 'album' ? albumRows : wsRows).length > 0"
        class="ref-grid"
      >
        <button
          v-for="item in activeTab === 'album' ? albumRows : wsRows"
          :key="item.id"
          class="ref-card"
          :class="{ 'is-on': isSelected(item.id) }"
          type="button"
          @click="toggle(item)"
        >
          <span class="ref-card__thumb">
            <img :alt="item.name" :src="item.url" />
            <span class="ref-card__badge">
              <CheckOutlined v-if="isSelected(item.id)" />
            </span>
          </span>
          <span class="ref-card__name" :title="item.name">{{ item.name }}</span>
          <span v-if="item.description" class="ref-card__desc">
            {{ item.description }}
          </span>
        </button>
      </div>
      <Empty
        v-else
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        description="暂无图片素材"
      />

      <VbenLoading :spinning="activeTab === 'album' ? albumLoading : wsLoading" />
    </div>

    <!-- 分页（与素材库同款） -->
    <div class="ref-pager">
      <Pagination
        v-if="activeTab === 'album'"
        :current="albumPage"
        :page-size="albumPageSize"
        show-size-changer
        :show-total="(t: number) => `共 ${t} 张`"
        :total="albumTotal"
        @change="onAlbumPageChange"
      />
      <Pagination
        v-else
        :current="wsPage"
        :page-size="wsPageSize"
        show-size-changer
        :show-total="(t: number) => `共 ${t} 张`"
        :total="wsTotal"
        @change="onWsPageChange"
      />
    </div>

    <!-- 已选：固定在分页下方 -->
    <div class="ref-picked">
      <span class="ref-picked__label">
        已选 <b>{{ selectedList.length }}</b> / {{ maxCount }}
      </span>
      <span v-for="item in selectedList" :key="item.id" class="ref-picked__item">
        <img :alt="item.name" :src="item.url" />
        <button type="button" @click="toggle(item)">
          <CloseOutlined />
        </button>
      </span>
      <span v-if="selectedList.length === 0" class="ref-picked__empty">
        还没选参考图
      </span>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.ref-hint {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.ref-tabs {
  display: flex;
  flex: none;
  gap: 8px;
  align-items: center;
}

.ref-tab {
  height: 28px;
  padding: 0 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
}

.ref-tab.is-on {
  color: hsl(var(--primary));
  background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
  border-color: color-mix(in srgb, hsl(var(--primary)) 35%, transparent);
}

.ref-tabs__src {
  margin-left: auto;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.ref-filter {
  display: flex;
  flex: none;
  gap: 8px;
  align-items: center;
}

.ref-search {
  width: 220px;
}

.ref-select {
  width: 200px;
}

/* 素材网格：占满剩余高度、内滚（和素材库同样的锁高做法） */
.ref-body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.ref-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.ref-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  text-align: left;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  transition: border-color 0.15s ease,
  box-shadow 0.15s ease;
}

.ref-card:hover {
  border-color: color-mix(in srgb, hsl(var(--primary)) 34%, transparent);
}

.ref-card.is-on {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px color-mix(in srgb, hsl(var(--primary)) 18%, transparent);
}

.ref-card__thumb {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: hsl(var(--accent));
  border-radius: 7px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ref-card__badge {
  position: absolute;
  top: 5px;
  left: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 11px;
  color: #fff;
  background: rgb(0 0 0 / 35%);
  border-radius: 4px;
}

.ref-card.is-on .ref-card__badge {
  background: hsl(var(--primary));
}

.ref-card__name {
  overflow: hidden;
  font-size: 12px;
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ref-card__desc {
  overflow: hidden;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 分页（固定） */
.ref-pager {
  display: flex;
  flex: none;
  justify-content: flex-end;
}

/* 已选（固定在分页下方） */
.ref-picked {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-height: 56px;
  padding: 8px 10px;
  background: hsl(var(--accent));
  border-radius: 10px;
}

.ref-picked__label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  b {
    color: hsl(var(--primary));
  }
}

.ref-picked__empty {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.ref-picked__item {
  position: relative;
  display: block;
  width: 40px;
  height: 40px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
  }

  button {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 9px;
    color: #fff;
    cursor: pointer;
    background: rgb(0 0 0 / 55%);
    border: none;
    border-radius: 50%;
  }
}
</style>
