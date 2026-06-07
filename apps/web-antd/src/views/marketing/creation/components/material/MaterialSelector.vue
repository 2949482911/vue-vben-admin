<script setup lang="ts" name="MaterialSelector">
import {computed, onMounted, ref} from 'vue';
import {
  Button,
  Card,
  Checkbox,
  List,
  ListItem,
  Pagination,
  Space,
  Tag,
  TreeSelect,
} from 'ant-design-vue';
import {useVbenModal} from '@vben/common-ui';
import {useVbenForm} from '#/adapter/form';
import {materialLibraryApi, uploadEditApi} from '#/api';
import type {VivoMaterialLibrary} from '#/views/marketing/creation/vivo/vivo';
import type {AlbumItem, MaterialItem} from "#/api/models/assert";


// 弹出事件
const emit = defineEmits(["update:material"]);


const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      allowClear: true,
      class: 'w-[120px]',
    },
    labelWidth: 70,
  },
  layout: 'inline',
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '素材名称',
    },
    {
      component: 'Slot',
      fieldName: 'fileFiltering',
      label: '文件夹筛选',
    },
  ],
});

// 参数
const loading = ref(false);
const listData = ref<Array<MaterialItem>>([]);
const selectedAssets = ref<Array<MaterialItem>>([]);
const queryParam = ref({page: 1, pageSize: 20, total: 0});
const albumId = ref<string>('');
const treeData = ref<Array<AlbumItem>>([]);

const maxCount = ref<number>(5);
const internalMaterialType = ref<'image' | 'video'>('image');
// 创意组的下标
const currentMaterialGroupIndex = ref<number>(0);


/**
 * 获取文件夹树
 */
async function requestTreeNode() {
  try {
    treeData.value = await materialLibraryApi.fetchDirectoryTreeList() as unknown as Array<AlbumItem>;
  } catch {
    treeData.value = [];
  }
}


/**
 * 获取搜索参数
 */
async function fetchList() {
  const formValues = await formApi.getValues();
  loading.value = true;
  try {
    const res = await uploadEditApi.fetchMaterialList({
      page: queryParam.value.page,
      pageSize: queryParam.value.pageSize,
      type: internalMaterialType.value === 'image' ? 1 : 2,
      albumId: albumId.value || '',
      needAlbum: false,
      name: formValues?.name || '',
    });
    listData.value = res.items.map((item: VivoMaterialLibrary) => {
      const isPicked = selectedAssets.value.some((s) => s.id === item.id);
      return {...item, selected: isPicked};
    });
    queryParam.value.total = res.total;
  } finally {
    loading.value = false;
  }
}

function isVideo(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '');
}

const isReachQuota = computed(() => {
  return selectedAssets.value.length >= maxCount.value;
});

const isCheckAll = computed({
  get: () => {
    if (listData.value.length === 0) return false;
    if (isReachQuota.value) return true;
    return listData.value.every((item) =>
      selectedAssets.value.some((s) => s.id === item.id)
    );
  },
  set: (val: boolean) => {
    if (val) {
      let remaining = maxCount.value - selectedAssets.value.length;
      if (remaining <= 0) return;
      listData.value.forEach((item) => {
        const already = selectedAssets.value.some((s) => s.id === item.id);
        if (!already && remaining > 0) {
          selectedAssets.value.push(item);
          remaining--;
        }
      });
    } else {
      const currentPageIds = listData.value.map((i) => i.id);
      selectedAssets.value = selectedAssets.value.filter(
        (s) => !currentPageIds.includes(s.id)
      );
    }
  },
});

function handleSelect(item: VivoMaterialLibrary) {
  if (isReachQuota.value && !item.selected) return;
  item.selected = !item.selected;
  if (item.selected) {
    if (!selectedAssets.value.some((s) => s.id === item.id)) {
      selectedAssets.value.push(item);
    }
  } else {
    selectedAssets.value = selectedAssets.value.filter((s) => s.id !== item.id);
  }
}

function onCheckAllChange(e: any) {
  isCheckAll.value = e.target.checked;
}

function handlePageChange(page: number, pageSize: number) {
  queryParam.value.page = page;
  queryParam.value.pageSize = pageSize;
  fetchList();
}

async function search() {
  queryParam.value.page = 1;
  queryParam.value.pageSize = 20;
  await fetchList();
}

function clearSelection() {
  selectedAssets.value = [];
  listData.value.forEach((item) => (item.selected = false));
}

const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: false,
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      selectedAssets.value = [];
      listData.value = [];
      queryParam.value = {page: 1, pageSize: 20, total: 0};
      albumId.value = '';
      const data = modalApi.getData();
      if (data) {
        maxCount.value = data.maxCount ?? 5;
        internalMaterialType.value = data.materialType ?? 'image';
        // 设置下标
        currentMaterialGroupIndex.value = data.currentMaterialGroupIndex ?? 0;
      }
      await fetchList();
    }
  },
  onCancel() {
    selectedAssets.value = [];
    listData.value = [];
    modalApi.close();
  },
  async onConfirm() {
    const selected = selectedAssets.value;
    emit('update:material', selected, currentMaterialGroupIndex.value);
    selectedAssets.value = [];
    listData.value = [];
    await modalApi.close();
  },
});

onMounted(async () => {
  await requestTreeNode();
});

</script>

<template>
  <div>
    <Modal title="素材库" class="w-[65.5%]">
      <div class="flex flex-col h-[65vh]">
        <div class="flex items-center gap-2 mb-4 px-4 pt-2">
          <Form>
            <template #fileFiltering>
              <TreeSelect
                v-model:value="albumId"
                style="width: 180px"
                placeholder="请选择文件夹"
                :tree-data="treeData"
                :field-names="{label: 'name', value: 'id', children: 'children'}"
                allow-clear
                show-search
              >
                <template #title="slotData">
                  <div class="tree-node-title">
                    <span class="tree-node-name">{{
                        slotData?.name ?? slotData?.data?.name ?? ''
                      }}</span>
                  </div>
                </template>
              </TreeSelect>
            </template>
          </Form>
          <Button type="primary" @click="search">搜索</Button>
        </div>

        <div class="flex-1 overflow-y-auto px-4 pr-2">
          <List
            :grid="{gutter: 12, xs: 1, sm: 2, md: 3, lg: 4, xl: 5}"
            :data-source="listData"
            :loading="loading"
          >
            <template #renderItem="{item}">
              <ListItem class="!p-0 !mb-3">
                <Card
                  hoverable
                  :class="[
                  'material-card',
                  item.selected ? 'is-selected' : '',
                  isReachQuota && !item.selected ? 'is-disabled' : '',
                ]"
                  @click="handleSelect(item)"
                >
                  <template #cover>
                    <div
                      class="relative w-full h-[100px] flex items-center justify-center overflow-hidden">
                      <div class="absolute top-1 right-2 z-10" @click.stop>
                        <Checkbox :checked="item.selected"
                                  :disabled="isReachQuota && !item.selected"
                                  @change="handleSelect(item)"/>
                      </div>
                      <div v-if="item.fileUrl" class="w-full h-full">
                        <img v-if="!isVideo(item.name)" :src="item.fileUrl" :alt="item.name"
                             class="w-full h-full object-contain"/>
                        <video v-else :src="item.fileUrl" preload="metadata"
                               class="w-full h-full object-contain"
                               @mouseenter="(e: Event) => { (e.target as HTMLVideoElement).controls = true; }"
                               @mouseleave="(e: Event) => { (e.target as HTMLVideoElement).controls = false; }"/>
                      </div>
                      <div v-else class="text-[10px] flex flex-col items-center justify-center">
                        <div class="mb-1 text-lg">️</div>
                        暂无预览
                      </div>
                      <span v-if="item.duration"
                            class="absolute bottom-1 right-1 text-white text-[10px] px-1 rounded">
                      {{ item.duration }}
                    </span>
                    </div>
                  </template>
                  <div class="p-2 h-[60px] flex flex-col justify-between overflow-hidden">
                    <div class="text-[12px] font-medium leading-snug truncate" :title="item.name">
                      {{ item.name }}
                    </div>
                    <div class="text-[10px]">{{ (item as any).fileSize }} ·
                      {{ (item as any).uploadTime }}
                    </div>
                    <div class="flex gap-1">
                      <Tag v-if="(item as any).isUsed" color="success" size="small">已使用</Tag>
                      <Tag v-else color="default" size="small">无消耗</Tag>
                    </div>
                  </div>
                </Card>
              </ListItem>
            </template>
          </List>
        </div>

        <div class="flex-none border-t pt-3 px-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <span>共 {{ queryParam.total }} 条</span>
              <Pagination v-model:current="queryParam.page" :total="queryParam.total"
                          :page-size="queryParam.pageSize" size="small" show-size-changer
                          @change="handlePageChange"/>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm">已选素材: {{ selectedAssets.length }}/{{ maxCount }} <Button
                type="link" size="small" @click="clearSelection">清空</Button></span>
              <Space>
                <Checkbox :checked="isCheckAll" @change="onCheckAllChange">全选</Checkbox>
              </Space>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.material-card {
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  height: 180px !important;

  :deep(.ant-card-body) {
    padding: 0 !important;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &.is-selected {
    outline: 2px solid var(--ant-color-primary);
    outline-offset: -2px;
  }
}

.is-disabled {
  filter: grayscale(100%);
  opacity: 0.5;
  pointer-events: none;
}

:deep(.ant-list-spin-container) {
  height: 100%;
}
</style>
