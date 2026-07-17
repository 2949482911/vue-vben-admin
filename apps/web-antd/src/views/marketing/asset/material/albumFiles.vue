<script setup lang="ts">
import { Card, Checkbox, Dropdown, Menu, MenuItem, Pagination, message } from 'ant-design-vue';
import { uploadEditApi } from '#/api/core';
import { computed, reactive, ref, watch } from 'vue';
import type { FolderItem } from '#/api/models';
import type { MaterialItem } from '#/api/models/assert';
import type { MaterialLibraryFolderType } from './materialType';
import { BatchOptionsType } from '#/constants/locales';

const isShowLoading = ref<Boolean>(true);

const props = defineProps<{
  treeItem: FolderItem[];
  selectedMaterialIds?: string[];
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
  pageSize: 10,
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
  if (!props.treeItem || props.treeItem.length === 0) return;

  const currentFolder = props.treeItem[props.treeItem.length - 1];
  if (!currentFolder || !currentFolder.id) {
    console.warn('当前路径节点无效:', currentFolder);
    return;
  }

  try {
    const res = await uploadEditApi.fetchMaterialList({
      albumId: currentFolder.id,
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

/** 当前页码中所有文件类型素材 */
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

function isSelected(id: string): boolean {
  return (props.selectedMaterialIds ?? []).includes(id);
}

defineExpose({ currentPageFiles });
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 面包屑 -->
    <div class="flex-shrink-0 px-4 py-2 mt-2 text-sm border-t border-b border-gray-200">
      <template v-for="(item, index) in props.treeItem" :key="item?.id || index">
        <span v-if="item">
          <span class="cursor-pointer hover:text-blue-500 transition-colors" @click="handleBreadcrumbClick(item)">
            {{ item.name }}
          </span>
          <span v-if="index < props.treeItem.length - 1" class="mx-2 text-gray-400">/</span>
        </span>
      </template>
    </div>

    <template v-if="!isShowLoading">
      <!-- 空状态 -->
      <div
        v-if="list.length === 0"
        class="flex flex-1 items-center justify-center text-gray-400"
      >
        暂无数据
      </div>

      <!-- 素材卡片网格 -->
      <div
        v-else
        class="flex-1 min-h-0 overflow-y-auto p-4 grid gap-3 auto-rows-max"
        style="grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));"
      >
        <!-- 文件夹卡片 -->
        <Card
          v-for="item in list.filter((i: any) => i.type === 1)"
          :key="item.id"
          hoverable
          size="small"
          class="overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
          @click="handleFolderClick(item)"
        >
          <template #cover>
            <div class="flex items-center justify-center h-[110px] bg-gray-50">
              <img
                src="https://cdn-icons-png.flaticon.com/512/716/716784.png"
                alt="folder"
                class="w-10 h-10 opacity-60"
              />
            </div>
          </template>
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium truncate flex-1 min-w-0" :title="item.name">
                {{ item.name }}
              </span>
              <Dropdown placement="bottomRight" :overlay-style="{ minWidth: '80px' }">
                <a href="javascript:;" class="text-xs text-gray-400 hover:text-gray-600 shrink-0 ml-1" @click.stop>•••</a>
                <template #overlay>
                  <Menu>
                    <MenuItem>
                      <a href="javascript:;" @click.stop="editFile(item)">编辑</a>
                    </MenuItem>
                  </Menu>
                </template>
              </Dropdown>
            </div>
            <span class="text-[10px] text-gray-400">素材 {{ item.count }}</span>
          </div>
        </Card>

        <!-- 文件素材卡片 -->
        <Card
          v-for="item in list.filter((i: any) => i.type !== 1)"
          :key="item.id"
          hoverable
          size="small"
          :class="[
            'overflow-hidden cursor-pointer transition-shadow hover:shadow-md',
            isSelected(item.id) ? 'ring-2 ring-blue-500' : '',
          ]"
          @click="handleMaterialClick(item as MaterialItem)"
        >
          <template #cover>
            <div class="relative w-full h-[110px] bg-gray-100 overflow-hidden">
              <!-- 复选框 — 使用独立 div 阻止冒泡 -->
              <div class="absolute top-1 left-1 z-10" @click.stop>
                <Checkbox :checked="isSelected(item.id)" />
              </div>
              <!-- 图片 -->
              <img
                v-if="!isVideo(item.name) && item.fileUrl"
                :src="item.fileUrl"
                :alt="item.name"
                class="w-full h-full object-cover block"
              />
              <!-- 视频 -->
              <video
                v-else-if="item.fileUrl"
                :src="item.fileUrl"
                preload="metadata"
                class="w-full h-full object-cover bg-black"
                @mouseenter="showControls($event)"
                @mouseleave="hideControls($event)"
              />
              <!-- 无预览占位 -->
              <div
                v-else
                class="w-full h-full flex flex-col items-center justify-center text-gray-400"
              >
                <span class="text-lg">🖼</span>
                <span class="text-[10px] mt-1">暂无预览</span>
              </div>
            </div>
          </template>
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium truncate flex-1 min-w-0" :title="item.name">
                {{ item.name }}
              </span>
              <Dropdown placement="bottomRight" :overlay-style="{ minWidth: '80px' }">
                <a href="javascript:;" class="text-xs text-gray-400 hover:text-gray-600 shrink-0 ml-1" @click.stop>•••</a>
                <template #overlay>
                  <Menu>
                    <MenuItem>
                      <a href="javascript:;" @click.stop="delFile(item)">删除</a>
                    </MenuItem>
                  </Menu>
                </template>
              </Dropdown>
            </div>
            <span class="text-[10px] text-gray-400">上传时间：{{ item.updateTime }}</span>
          </div>
        </Card>
      </div>
    </template>

    <!-- 分页 -->
    <Pagination
      v-if="list.length > 0"
      class="flex-shrink-0 px-4 py-2 border-t border-gray-200"
      show-size-changer
      v-model:current="pages.current"
      v-model:pageSize="pages.pageSize"
      :total="pages.total"
      :show-total="(total: number) => `共 ${total} 条`"
      @change="handlePageChange"
    />
  </div>
</template>
