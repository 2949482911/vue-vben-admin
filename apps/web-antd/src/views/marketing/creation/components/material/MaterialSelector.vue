<script setup lang="ts" name="MaterialSelector">
import type { AlbumItem, MaterialItem } from '#/api/models/assert';
import type { MaterialListParams } from '#/api/models/marketing';

import { computed, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  FolderOutlined,
  LineChartOutlined,
  PlayCircleFilled,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  Pagination,
  Select,
  Tag,
  Tooltip,
  Tree,
} from 'ant-design-vue';

import { materialLibraryApi, uploadEditApi } from '#/api';
import { getLabelColor } from '#/views/marketing/account/label/constants';
import { useAccountLabelOptions } from '#/views/marketing/account/label/useAccountLabelOptions';

type MaterialRow = MaterialItem & {
  duration?: string;
  isUsed?: boolean;
  playCount?: number;
  selected?: boolean;
  totalCost?: number;
  uploadTime?: string;
};

interface MaterialSelectorData {
  currentMaterialGroupIndex?: number;
  materialType?: 'image' | 'video';
  maxCount?: number;
  preSelectedIds?: Array<number | string>;
  preSelectedMaterials?: Array<MaterialItem>;
}

type FolderNode = {
  children?: FolderNode[];
  count?: number | string;
  key: string;
  title: string;
};

const emit = defineEmits(['update:material']);

const { labelNamesOf, labelOptions, loadLabelOptions } = useAccountLabelOptions();

const loading = ref(false);
const listData = ref<MaterialRow[]>([]);
const selectedAssets = ref<MaterialRow[]>([]);
const selectedIds = ref<Set<number | string>>(new Set());
const queryParam = ref({ page: 1, pageSize: 20, total: 0 });
const albumId = ref('');
const treeData = ref<AlbumItem[]>([]);
const expandedFolderKeys = ref<Array<number | string>>(['all']);
const selectedTagId = ref<string | undefined>();
const searchName = ref('');

const maxCount = ref(5);
const internalMaterialType = ref<'image' | 'video'>('image');
const currentMaterialGroupIndex = ref(0);

const modalTitle = computed(() =>
  internalMaterialType.value === 'video' ? '选择视频素材' : '选择图片素材',
);

const isReachQuota = computed(
  () => selectedIds.value.size >= maxCount.value,
);

const isCheckAll = computed({
  get: () => {
    if (listData.value.length === 0) return false;
    if (selectedIds.value.size >= maxCount.value) return true;
    return listData.value.every((item) => selectedIds.value.has(String(item.id)));
  },
  set: (checked: boolean) => {
    if (checked) {
      let remaining = maxCount.value - selectedIds.value.size;
      if (remaining <= 0) return;
      listData.value.forEach((item) => {
        if (remaining <= 0 || selectedIds.value.has(String(item.id))) return;
        selectedIds.value.add(String(item.id));
        if (!selectedAssets.value.some((asset) => asset.id === item.id)) {
          selectedAssets.value.push(item);
        }
        remaining--;
      });
    } else {
      const pageIds = listData.value.map((item) => String(item.id));
      pageIds.forEach((id) => selectedIds.value.delete(id));
      selectedAssets.value = selectedAssets.value.filter(
        (asset) => !pageIds.includes(String(asset.id)),
      );
    }
    listData.value.forEach((item) => {
      item.selected = selectedIds.value.has(String(item.id));
    });
  },
});

const folderTreeData = computed<FolderNode[]>(() => [
  {
    children: treeData.value.map(mapFolderNode),
    key: 'all',
    title: '全部素材',
  },
]);

const selectedTreeKeys = computed(() => [albumId.value || 'all']);

const tagOptions = computed(() =>
  labelOptions.value.map((option) => ({
    label: option.label,
    value: option.value,
  })),
);

const selectedThumbnails = computed(() => selectedAssets.value.slice(0, 5));

function mapFolderNode(node: AlbumItem): FolderNode {
  return {
    children: node.children?.map(mapFolderNode),
    count: (node as any).count,
    key: String(node.id),
    title: node.name,
  };
}

function collectFolderKeys(nodes: AlbumItem[], keys: string[] = []): string[] {
  nodes.forEach((node) => {
    if (node.children?.length) {
      keys.push(String(node.id));
      collectFolderKeys(node.children, keys);
    }
  });
  return keys;
}

async function requestTreeNode() {
  try {
    treeData.value = (await materialLibraryApi.fetchDirectoryTreeList()) as unknown as AlbumItem[];
    expandedFolderKeys.value = ['all', ...collectFolderKeys(treeData.value)];
  } catch {
    treeData.value = [];
  }
}

function isVideo(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return ['avi', 'mkv', 'mov', 'mp4', 'webm'].includes(extension || '');
}

function previewSrc(item: MaterialRow) {
  return item.thumbnailUrl || item.videoCoverUrl || item.fileUrl || '';
}

function durationOf(item: MaterialRow) {
  if (item.duration) return item.duration;
  const seconds = Number(item.videoDurationSecond || 0);
  if (!seconds) return '';
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function spendOf(item: MaterialRow) {
  const raw = (item as any).totalCost ?? (item as any).cost ?? (item as any).spend;
  return typeof raw === 'number' ? raw : undefined;
}

function playCountOf(item: MaterialRow) {
  const raw = (item as any).playCount ?? (item as any).reportPlayCount;
  return typeof raw === 'number' ? raw : undefined;
}

function itemTags(item: MaterialRow) {
  return labelNamesOf(item.labelIds ?? []);
}

async function fetchList() {
  loading.value = true;
  try {
    const params: MaterialListParams = {
      albumId: albumId.value || '',
      name: searchName.value || '',
      needAlbum: false,
      page: queryParam.value.page,
      pageSize: queryParam.value.pageSize,
      type: internalMaterialType.value === 'image' ? 1 : 2,
      ...(selectedTagId.value ? { tagIds: [selectedTagId.value] } : {}),
    };
    const res: any = await uploadEditApi.fetchMaterialList(params);
    listData.value = (res.items || []).map((item: MaterialRow) => {
      const picked = selectedIds.value.has(String(item.id));
      if (picked && !selectedAssets.value.some((asset) => asset.id === item.id)) {
        selectedAssets.value.push(item);
      }
      return { ...item, selected: picked };
    });
    queryParam.value.total = res.total || 0;
  } finally {
    loading.value = false;
  }
}

function handleSelect(item: MaterialRow) {
  if (isReachQuota.value && !item.selected) return;
  item.selected = !item.selected;
  if (item.selected) {
    selectedIds.value.add(String(item.id));
    if (!selectedAssets.value.some((asset) => asset.id === item.id)) {
      selectedAssets.value.push(item);
    }
  } else {
    selectedIds.value.delete(String(item.id));
    selectedAssets.value = selectedAssets.value.filter(
      (asset) => asset.id !== item.id,
    );
  }
}

function removeSelected(id: number | string) {
  selectedIds.value.delete(String(id));
  selectedAssets.value = selectedAssets.value.filter(
    (asset) => String(asset.id) !== String(id),
  );
  const item = listData.value.find((row) => String(row.id) === String(id));
  if (item) item.selected = false;
}

function onCheckAllChange(event: any) {
  isCheckAll.value = event.target.checked;
}

function handlePageChange(page: number, pageSize: number) {
  queryParam.value.page = page;
  queryParam.value.pageSize = pageSize;
  fetchList();
}

function search() {
  queryParam.value.page = 1;
  fetchList();
}

function clearSelection() {
  selectedAssets.value = [];
  selectedIds.value = new Set();
  listData.value.forEach((item) => {
    item.selected = false;
  });
}

function onFolderSelect(keys: Array<number | string>) {
  const key = String(keys[0] ?? 'all');
  albumId.value = key === 'all' ? '' : key;
  search();
}

function buildConfirmResult() {
  const result = [...selectedAssets.value];
  const resultIds = new Set(result.map((item) => String(item.id)));
  for (const id of selectedIds.value) {
    if (!resultIds.has(String(id))) {
      result.push({ id } as any);
    }
  }
  return result;
}

async function confirmSelection() {
  emit('update:material', buildConfirmResult(), currentMaterialGroupIndex.value);
  selectedAssets.value = [];
  selectedIds.value = new Set();
  listData.value = [];
  await modalApi.close();
}

async function cancelSelection() {
  selectedAssets.value = [];
  selectedIds.value = new Set();
  listData.value = [];
  await modalApi.close();
}

const [Modal, modalApi] = useVbenModal<MaterialSelectorData>({
  closeOnClickModal: false,
  async onCancel() {
    await cancelSelection();
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) return;
    selectedAssets.value = [];
    selectedIds.value = new Set();
    listData.value = [];
    queryParam.value = { page: 1, pageSize: 20, total: 0 };
    albumId.value = '';
    searchName.value = '';
    selectedTagId.value = undefined;
    const data = modalApi.getData();
    if (data) {
      maxCount.value = data.maxCount ?? 5;
      internalMaterialType.value = data.materialType ?? 'image';
      currentMaterialGroupIndex.value = data.currentMaterialGroupIndex ?? 0;
      if (data.preSelectedMaterials?.length) {
        selectedAssets.value = data.preSelectedMaterials.map((item: any) => ({ ...item }));
        data.preSelectedMaterials.forEach((item: any) => {
          selectedIds.value.add(String(item.localMaterialId ?? item.id));
        });
      } else if (data.preSelectedIds?.length) {
        data.preSelectedIds.forEach((id) => selectedIds.value.add(String(id)));
      }
    }
    await fetchList();
  },
});

onMounted(async () => {
  await Promise.all([requestTreeNode(), loadLabelOptions()]);
});
</script>

<template>
  <Modal
    :body-style="{ padding: 0 }"
    :footer="false"
    class="material-selector-modal w-[1340px] max-w-[95vw]"
  >
    <template #title>
      <div class="selector-head">
        <span class="selector-mark"><FolderOutlined /></span>
        <div>
          <div class="selector-title">{{ modalTitle }}</div>
          <div class="selector-subtitle">
            按素材文件夹、标签筛选，支持跨页多选
          </div>
        </div>
      </div>
    </template>

    <div class="selector-shell">
      <div class="material-selector">
        <aside class="folder-pane">
        <div class="folder-head">
          <span>素材文件夹</span>
          <span class="muted">{{ queryParam.total }} 条</span>
        </div>
        <Tree
          v-model:expanded-keys="expandedFolderKeys"
          :block-node="true"
          :selected-keys="selectedTreeKeys"
          :show-line="true"
          :tree-data="folderTreeData"
          class="folder-tree"
          @select="onFolderSelect"
        >
          <template #title="node">
            <span class="tree-title">
              <FolderOutlined class="tree-icon" />
              <span class="tree-label">{{ node.title }}</span>
              <span v-if="node.count" class="tree-count">{{ node.count }}</span>
            </span>
          </template>
        </Tree>
      </aside>

      <main class="result-pane">
        <div class="filter-bar">
          <Input
            v-model:value="searchName"
            allow-clear
            placeholder="搜索素材名称 / ID"
            style="width: 260px"
            @press-enter="search"
          >
            <template #prefix><SearchOutlined /></template>
          </Input>
          <Select
            v-model:value="selectedTagId"
            :options="tagOptions"
            allow-clear
            option-filter-prop="label"
            placeholder="全部标签"
            show-search
            style="width: 160px"
            @change="search"
          />
          <Button type="primary" @click="search">搜索</Button>
          <span class="filter-tip">素材报表数据将在后续版本接入</span>
        </div>

        <div class="result-head">
          <span class="muted">
            共 <b>{{ queryParam.total }}</b> 个素材 · 已选
            <b>{{ selectedIds.size }}</b> / {{ maxCount }}
          </span>
          <div class="result-actions">
            <Checkbox :checked="isCheckAll" @change="onCheckAllChange">
              全选本页
            </Checkbox>
            <Button size="small" type="link" @click="clearSelection">清空已选</Button>
          </div>
        </div>

        <div class="material-grid">
          <Card
            v-for="item in listData"
            :key="item.id"
            :class="[
              item.selected ? 'selected' : '',
              isReachQuota && !item.selected ? 'disabled' : '',
            ]"
            hoverable
            size="small"
            class="material-card"
            @click="handleSelect(item)"
          >
            <template #cover>
              <div class="material-preview">
                <img
                  v-if="previewSrc(item)"
                  :src="previewSrc(item)"
                  :alt="item.name"
                  class="preview-image"
                  loading="lazy"
                />
                <div v-else class="preview-empty">暂无预览</div>
                <Checkbox
                  :checked="item.selected"
                  :disabled="isReachQuota && !item.selected"
                  class="card-check"
                  @change="handleSelect(item)"
                  @click.stop
                />
                <PlayCircleFilled v-if="isVideo(item.name)" class="play-icon" />
                <span v-if="durationOf(item)" class="duration">{{ durationOf(item) }}</span>
              </div>
            </template>

            <div class="card-body">
              <div class="name-row">
                <span class="material-name" :title="item.name">{{ item.name }}</span>
                <Tag :color="item.isUsed ? 'success' : 'default'">
                  {{ item.isUsed ? '已使用' : '未使用' }}
                </Tag>
              </div>
              <div class="meta-line">
                {{ item.fileSizeStr || item.fileSize || '-' }}
                <span v-if="item.uploadTime"> · {{ item.uploadTime }}</span>
              </div>
              <div v-if="itemTags(item).length > 0" class="tag-row">
                <Tag
                  v-for="tag in itemTags(item).slice(0, 2)"
                  :key="tag"
                  :bordered="false"
                  :color="getLabelColor(tag)"
                >
                  {{ tag }}
                </Tag>
                <Tag
                  v-if="itemTags(item).length > 2"
                  :bordered="false"
                  color="default"
                >
                  +{{ itemTags(item).length - 2 }}
                </Tag>
              </div>
              <div class="report-row">
                <span class="spend">
                  近7日消耗
                  <b v-if="spendOf(item) !== undefined">
                    {{
                      spendOf(item) === 0
                        ? '无消耗'
                        : `¥${spendOf(item)?.toLocaleString('zh-CN')}`
                    }}
                  </b>
                  <b v-else class="placeholder">--</b>
                </span>
                <span v-if="playCountOf(item) !== undefined" class="plays">
                  <LineChartOutlined />
                  {{ playCountOf(item) }}
                </span>
                <span v-else class="plays placeholder">报表 --</span>
              </div>
            </div>
          </Card>

          <Empty
            v-if="!loading && listData.length === 0"
            class="grid-empty"
            description="暂无匹配素材"
          />
        </div>

        <div class="result-foot">
          <span class="muted">共 {{ queryParam.total }} 条</span>
          <Pagination
            :current="queryParam.page"
            :page-size="queryParam.pageSize"
            :total="queryParam.total"
            show-size-changer
            size="small"
            @change="handlePageChange"
          />
        </div>
      </main>
    </div>

    <footer class="selector-foot">
      <div class="selected-tray">
        <span class="muted">已选素材</span>
        <Tooltip v-for="item in selectedThumbnails" :key="item.id" :title="item.name">
          <span class="tray-thumb" @click="item.id !== undefined && removeSelected(item.id)">
            <img v-if="previewSrc(item)" :src="previewSrc(item)" :alt="item.name" />
            <span v-else class="tray-empty"></span>
          </span>
        </Tooltip>
        <span v-if="selectedAssets.length > 5" class="tray-more">
          +{{ selectedAssets.length - 5 }}
        </span>
        <span class="muted">{{ selectedIds.size }} / {{ maxCount }}</span>
      </div>
      <div class="foot-actions">
        <Button @click="cancelSelection">取消</Button>
        <Button :disabled="selectedIds.size === 0" type="primary" @click="confirmSelection">
          确认选择{{ selectedIds.size > 0 ? `（${selectedIds.size}）` : '' }}
        </Button>
      </div>
      </footer>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.selector-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selector-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
  border: 1px solid hsl(var(--primary) / 30%);
  border-radius: 8px;
}

.selector-title {
  font-size: 16px;
  font-weight: 650;
}

.selector-subtitle {
  margin-top: 2px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  font-weight: 400;
}

.selector-shell {
  display: flex;
  flex-direction: column;
  height: 72vh;
  min-height: 600px;
  overflow: hidden;
}

.material-selector {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.folder-pane {
  display: flex;
  flex: none;
  flex-direction: column;
  width: 214px;
  padding: 12px 10px;
  background: hsl(var(--muted) / 55%);
  border-right: 1px solid hsl(var(--border));
}

.folder-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 8px;
  font-weight: 600;
}

.folder-tree {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.folder-tree :deep(.ant-tree-node-content-wrapper) {
  min-width: 0;
}

.tree-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.tree-icon {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.tree-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-count {
  margin-left: auto;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.result-pane {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 12px 16px 0;
}

.filter-bar {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid hsl(var(--border));
}

.filter-tip {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.result-head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.material-grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: max-content;
  gap: 10px;
  min-height: 0;
  padding-bottom: 10px;
  overflow-y: auto;
  align-content: start;
}

.material-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  transition: all 0.16s ease;
}

.material-card :deep(.ant-card-body) {
  flex: 1;
  padding: 0;
}

.material-card :deep(.ant-card-cover) {
  flex: none;
}

.material-card:hover {
  border-color: hsl(var(--primary) / 45%);
}

.material-card.selected {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 1px hsl(var(--primary) / 12%);
}

.material-card.disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.material-preview {
  position: relative;
  height: 140px;
  overflow: hidden;
  background: hsl(var(--muted));
}

.material-preview::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    to bottom,
    rgb(15 23 42 / 8%),
    transparent 30%,
    rgb(15 23 42 / 32%)
  );
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.card-check {
  position: absolute;
  top: 7px;
  left: 7px;
  z-index: 2;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  color: #fff;
  font-size: 28px;
  filter: drop-shadow(0 1px 4px rgb(0 0 0 / 38%));
  transform: translate(-50%, -50%);
}

.duration {
  position: absolute;
  right: 7px;
  bottom: 6px;
  z-index: 2;
  padding: 1px 5px;
  color: #fff;
  font-size: 10px;
  background: rgb(15 23 42 / 62%);
  border-radius: 4px;
}

.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 9px 11px 11px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.name-row :deep(.ant-tag) {
  flex: none;
  margin: 0;
  padding: 0 5px;
  font-size: 10px;
  line-height: 18px;
}

.material-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-line {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 18px;
}

.tag-row :deep(.ant-tag) {
  margin: 0;
  font-size: 10px;
}

.report-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-top: 7px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  border-top: 1px solid hsl(var(--border) / 65%);
}

.spend b {
  margin-left: 3px;
  color: hsl(var(--foreground));
}

.placeholder {
  color: hsl(var(--muted-foreground));
  font-weight: 400;
}

.plays {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.grid-empty {
  grid-column: 1 / -1;
  padding: 36px 0;
}

.result-foot {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  border-top: 1px solid hsl(var(--border));
}

.selector-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 62px;
  padding: 0 16px;
  background: hsl(var(--muted) / 45%);
  border-top: 1px solid hsl(var(--border));
}

.selected-tray {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.tray-thumb {
  display: block;
  width: 34px;
  height: 28px;
  overflow: hidden;
  cursor: pointer;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 5px;
}

.tray-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tray-empty {
  display: block;
  width: 100%;
  height: 100%;
}

.tray-more {
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.foot-actions {
  display: flex;
  flex: none;
  gap: 8px;
}

@media (max-width: 1200px) {
  .material-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .folder-pane {
    width: 180px;
  }

  .material-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
