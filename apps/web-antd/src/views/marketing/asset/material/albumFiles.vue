<script setup lang="ts">
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  Empty,
  Menu,
  MenuItem,
  Modal,
  Pagination,
  Tag,
  Tooltip,
  message,
} from 'ant-design-vue';
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  FileOutlined,
  FolderFilled,
  FolderOpenOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons-vue';
import { Spinner } from '@vben/common-ui';
import { uploadEditApi } from '#/api/core';
import { computed, reactive, ref, watch } from 'vue';
import type { FolderItem } from '#/api/models';
import type { MaterialListParams } from '#/api/models/marketing';
import type { MaterialItem } from '#/api/models/assert';
import type { MaterialLibraryFolderType } from './materialType';
import { BatchOptionsType } from '#/constants/locales';

const isShowLoading = ref(true);

const props = defineProps<{
  treeItem: FolderItem[];
  selectedMaterialIds?: string[];
  filterParams?: Partial<MaterialListParams>;
}>();

const emit = defineEmits<{
  (e: 'openFile', rowVal: MaterialLibraryFolderType): void;
  (e: 'breadcrumbClick', item: FolderItem): void;
  (e: 'toggleMaterialSelect', material: MaterialItem): void;
}>();

watch(
  () => props.treeItem,
  (newVal) => {
    if (newVal && newVal.length) {
      pages.current = 1;
      fileList();
    }
  },
  { immediate: true },
);

const pages = reactive({
  pageSize: 24,
  current: 1,
  total: 0,
});

const handlePageChange = (page: number, pageSize: number) => {
  pages.current = page;
  pages.pageSize = pageSize;
  fileList();
};

const list = ref<MaterialItem[]>([]);

async function fileList() {
  isShowLoading.value = true;
  if (!props.treeItem || props.treeItem.length === 0) {
    isShowLoading.value = false;
    return;
  }

  const currentFolder = props.treeItem[props.treeItem.length - 1];
  if (!currentFolder || !currentFolder.id) {
    console.warn('当前路径节点无效:', currentFolder);
    isShowLoading.value = false;
    return;
  }

  try {
    const res = await uploadEditApi.fetchMaterialList({
      albumId: currentFolder.id,
      name: props.filterParams?.name?.trim() || '',
      type: props.filterParams?.type,
      format: props.filterParams?.format,
      fileMd5: props.filterParams?.fileMd5,
      aspectXy: props.filterParams?.aspectXy,
      aspectRatio: props.filterParams?.aspectRatio,
      timeRange: props.filterParams?.timeRange,
      pageSize: pages.pageSize,
      page: pages.current,
    });
    pages.total = res.total;
    list.value = (res.items ?? []) as MaterialItem[];
    isShowLoading.value = false;
  } catch (err) {
    console.error(err);
    isShowLoading.value = false;
  }
}

/** 文件夹在前、文件素材在后的展示顺序 */
const displayList = computed<(MaterialItem & { count?: string })[]>(() => {
  const folders = list.value.filter((item) => item.type === 1);
  const materials = list.value.filter((item) => item.type !== 1);
  return [...folders, ...materials] as (MaterialItem & { count?: string })[];
});

/** 当前展示中所有文件类型素材（用于全选当前页） */
const currentPageFiles = computed(() =>
  list.value.filter((item: any) => item.type !== 1),
);

function handleMaterialClick(material: MaterialItem) {
  emit('toggleMaterialSelect', material);
}

function handleFolderClick(item: any) {
  if (item.type === 1) {
    pages.current = 1;
    emit('breadcrumbClick', item);
  }
}

function editFile(rowVal: MaterialLibraryFolderType) {
  emit('openFile', rowVal);
}

function handleBreadcrumbClick(item: FolderItem) {
  if (!props.treeItem || props.treeItem.length === 0) return;
  const currentFolder = props.treeItem[props.treeItem.length - 1];
  if (item.id === currentFolder?.id) {
    return;
  }
  emit('breadcrumbClick', item);
}

async function delFile(item: any) {
  await uploadEditApi.fetchDelMaterials({
    targetIds: [item.id],
    type: BatchOptionsType.Delete,
    values: new Map<string, any>(),
  });
  fileList();
  message.success('删除成功');
}

function isVideo(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '');
}

function showControls(event: Event) {
  const video = event.target as HTMLVideoElement;
  video.controls = true;
}

function hideControls(event: Event) {
  const video = event.target as HTMLVideoElement;
  video.controls = false;
}

function isSelected(id?: string): boolean {
  return Boolean(id && (props.selectedMaterialIds ?? []).includes(id));
}

const selectedCount = computed(() => props.selectedMaterialIds?.length ?? 0);

// ==================== 素材预览 ====================
const previewMaterial = ref<MaterialItem | null>(null);
const previewVisible = ref(false);

function openPreview(material: MaterialItem) {
  previewMaterial.value = material;
  previewVisible.value = true;
}

/** 更新时间：仅保留日期部分 */
function formatDate(value?: string): string {
  if (!value) return '';
  return value.slice(0, 10);
}

/** 分辨率展示 */
function resolutionOf(item: MaterialItem): string {
  if (item.width > 0 && item.height > 0) {
    return `${item.width}×${item.height}`;
  }
  if (item.aspectRatio) {
    return item.aspectRatio;
  }
  return '';
}

/** 视频时长 mm:ss */
function durationOf(item: MaterialItem): string {
  const seconds = Number(item.videoDurationSecond || 0);
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

defineExpose({
  currentPageFiles,
  reload: () => {
    pages.current = 1;
    return fileList();
  },
});
</script>

<template>
  <div class="flex flex-col">
    <!-- 面包屑 + 统计 -->
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-1 text-sm">
        <FolderOpenOutlined class="mr-1 text-[#f5a623]" />
        <template v-for="(item, index) in props.treeItem" :key="item?.id || index">
          <span v-if="item">
            <span
              class="cursor-pointer transition-colors hover:text-[#006be6]"
              :class="
                index === props.treeItem.length - 1
                  ? 'font-medium text-gray-800'
                  : 'text-gray-400'
              "
              @click="handleBreadcrumbClick(item)"
            >
              {{ item.name }}
            </span>
            <span v-if="index < props.treeItem.length - 1" class="mx-1.5 text-gray-300">
              /
            </span>
          </span>
        </template>
        <span v-if="pages.total > 0" class="ml-3 text-xs text-gray-400">
          共 {{ pages.total }} 项
        </span>
      </div>
      <span v-if="selectedCount > 0" class="text-xs text-gray-400">
        已选 <span class="font-semibold text-[#006be6]">{{ selectedCount }}</span> 个素材
      </span>
    </div>

    <Spinner :spinning="isShowLoading" class="min-h-[200px]">
      <!-- 空状态 -->
      <Empty
        v-if="displayList.length === 0"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        description="该目录下暂无素材"
        class="!py-16"
      />

      <!-- 素材卡片网格 -->
      <div
        v-else
        class="grid gap-4"
        style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));"
      >
        <!-- 文件夹卡片 -->
        <Card
          v-for="item in displayList.filter((i) => i.type === 1)"
          :key="item.id"
          hoverable
          size="small"
          class="folder-card !h-auto"
          @click="handleFolderClick(item)"
        >
          <template #cover>
            <div class="m-cover m-cover--folder">
              <FolderFilled class="!text-6xl text-[#f5a623]" />
            </div>
          </template>
          <div class="m-info">
            <div class="flex items-start justify-between gap-1">
              <span class="m-name">{{ item.name }}</span>
              <Dropdown placement="bottomRight" :overlay-style="{ minWidth: '96px' }">
                <Button type="text" size="small" @click.stop>
                  <template #icon>
                    <EllipsisOutlined />
                  </template>
                </Button>
                <template #overlay>
                  <Menu>
                    <MenuItem @click="editFile(item as unknown as MaterialLibraryFolderType)">
                      <EditOutlined class="mr-1" />
                      编辑
                    </MenuItem>
                  </Menu>
                </template>
              </Dropdown>
            </div>
            <div class="m-meta">
              <FolderFilled class="mr-1 !text-xs" />
              文件夹 · {{ item.count || 0 }} 个素材
            </div>
          </div>
        </Card>

        <!-- 文件素材卡片 -->
        <Card
          v-for="item in displayList.filter((i) => i.type !== 1)"
          :key="item.id"
          hoverable
          size="small"
          class="material-card !h-auto"
          :class="{ 'material-card--selected': isSelected(item.id) }"
          @click="handleMaterialClick(item as MaterialItem)"
        >
          <!-- 封面 -->
          <template #cover>
            <div class="m-cover">
              <!-- 复选框 -->
              <div
                class="m-check"
                @click.stop="handleMaterialClick(item as MaterialItem)"
              >
                <Checkbox :checked="isSelected(item.id)" />
              </div>

              <!-- 类型角标 -->
              <Tag
                class="m-tag"
                :color="isVideo(item.name) ? 'blue' : 'default'"
                :bordered="false"
              >
                <PlayCircleOutlined v-if="isVideo(item.name)" />
                <FileOutlined v-else />
                {{ isVideo(item.name) ? '视频' : '图片' }}
              </Tag>
              <Tag v-if="durationOf(item as MaterialItem)" class="m-tag m-tag--left" :bordered="false">
                {{ durationOf(item as MaterialItem) }}
              </Tag>

              <!-- 视频 -->
              <video
                v-if="isVideo(item.name) && item.fileUrl"
                :src="item.fileUrl"
                preload="metadata"
                class="m-media"
                @mouseenter="showControls($event)"
                @mouseleave="hideControls($event)"
              />
              <!-- 图片 -->
              <img
                v-else-if="item.fileUrl"
                :src="item.fileUrl"
                :alt="item.name"
                loading="lazy"
                class="m-media"
              />
              <!-- 无预览占位 -->
              <div v-else class="m-placeholder">
                <FileOutlined class="!text-4xl text-gray-300" />
              </div>

              <!-- 悬浮操作 -->
              <div class="m-actions" @click.stop>
                <Tooltip title="预览">
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    @click="openPreview(item as MaterialItem)"
                  >
                    <template #icon>
                      <EyeOutlined />
                    </template>
                  </Button>
                </Tooltip>
                <Dropdown placement="bottomRight" :overlay-style="{ minWidth: '96px' }">
                  <Button shape="circle" size="small">
                    <template #icon>
                      <EllipsisOutlined />
                    </template>
                  </Button>
                  <template #overlay>
                    <Menu>
                      <MenuItem @click="delFile(item)">
                        <DeleteOutlined class="mr-1 text-red-500" />
                        删除
                      </MenuItem>
                    </Menu>
                  </template>
                </Dropdown>
              </div>
            </div>
          </template>

          <!-- 信息区：文件名完整展示，允许换行 -->
          <div class="m-info">
            <span class="m-name">{{ item.name }}</span>
            <div class="m-meta">
              <span>{{ formatDate(item.updateTime) }}</span>
              <template v-if="item.fileSizeStr">
                <span class="mx-1">·</span>
                <span>{{ item.fileSizeStr }}</span>
              </template>
              <template v-if="resolutionOf(item as MaterialItem)">
                <span class="mx-1">·</span>
                <span>{{ resolutionOf(item as MaterialItem) }}</span>
              </template>
            </div>
          </div>
        </Card>
      </div>
    </Spinner>

    <!-- 分页 -->
    <div v-if="pages.total > pages.pageSize" class="mt-4 flex justify-end border-t border-gray-100 pt-3">
      <Pagination
        show-size-changer
        v-model:current="pages.current"
        v-model:pageSize="pages.pageSize"
        :total="pages.total"
        :show-total="(total: number) => `共 ${total} 条`"
        @change="handlePageChange"
      />
    </div>

    <!-- 预览弹窗 -->
    <Modal
      v-model:open="previewVisible"
      :footer="null"
      :width="760"
      :centered="true"
      destroy-on-close
    >
      <div v-if="previewMaterial">
        <div class="mb-3 text-center text-sm font-medium text-gray-700">
          {{ previewMaterial.name }}
        </div>
        <video
          v-if="isVideo(previewMaterial.name) && previewMaterial.fileUrl"
          :src="previewMaterial.fileUrl"
          controls
          autoplay
          class="mx-auto max-h-[60vh] w-full rounded-lg"
        />
        <img
          v-else-if="previewMaterial.fileUrl"
          :src="previewMaterial.fileUrl"
          :alt="previewMaterial.name"
          class="mx-auto max-h-[60vh] rounded-lg object-contain"
        />
        <Empty
          v-else
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="该素材暂无可预览内容"
          class="!py-10"
        />
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
/* 只保留布局定位所需样式，表层背景一律交由 antd Card / Tag / Button 原生提供 */
.material-card {
  cursor: pointer;

  &--selected {
    border-color: hsl(var(--primary)) !important;
    box-shadow: 0 0 0 1px hsl(var(--primary)) inset;
  }
}

.folder-card {
  cursor: pointer;
}

.m-cover {
  position: relative;
  width: 100%;
  overflow: hidden;
  aspect-ratio: 4 / 3;

  &--folder {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.m-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.m-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.m-check {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
}

.m-tag {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 2;
  margin-inline-end: 0;

  &--left {
    right: auto;
    left: 8px;
  }
}

.m-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  display: none;
  gap: 6px;
}

.material-card:hover .m-actions {
  display: flex;
}

.m-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 2px;
}

.m-name {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: hsl(var(--foreground));
  word-break: break-all;
}

.m-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 11px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}
</style>
