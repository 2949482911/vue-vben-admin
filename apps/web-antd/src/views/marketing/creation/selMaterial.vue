<script setup lang="ts">
import {useVbenModal} from '@vben/common-ui';
import {ref, computed} from 'vue';
import {Card, List, Checkbox, Pagination, ListItem, Button} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {uploadEditApi} from '#/api/core';
import type {VivoMaterialLibrary} from './vivo/vivo';
import type {LocalMaterialData} from './creation';


const materialType = ref<string>('image');
const currentGroupIndex = ref<number>(0);

// 选中的素材列表
const materialList = ref<LocalMaterialData[]>([]);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      allowClear: true,
      class: 'w-[120px]'
    },
    labelWidth: 56,
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '素材名称',
    },
  ],
});

const loading = ref(false);
const listData = ref<VivoMaterialLibrary[]>([]);
const queryParam = ref({page: 1, pageSize: 20, total: 0});
// 存放跨分页、跨搜索的所有选中项
const selectedAssets = ref<VivoMaterialLibrary[]>([]);

// 2. 封装获取数据函数
async function fetchList() {
  const nameStr = await formApi.getValues()
  loading.value = true;
  try {
    const res = await uploadEditApi.fetchMaterialList({
      page: queryParam.value.page,
      pageSize: queryParam.value.pageSize,
      type: materialType.value === 'image'? 1 : 2,
      needAlbum: false,
      name: nameStr?.name || ''
    });
    listData.value = res.items.map((item: VivoMaterialLibrary) => {
      const isPicked = selectedAssets.value.some(s => s.id === item.id);
      return {...item, isPicked};//判断数据有没有被选中
    });
    queryParam.value.total = res.total;
  } finally {
    loading.value = false;
  }
}

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    materialList.value = [];
    modalApi.close()
  },
  async onConfirm() {
    if (selectedAssets.value.length === 0) {
      await modalApi.close();
      return;
    }
    selectedAssets.value.forEach(
      x => {
        materialList.value.push({
          name: x.name,
          url: x.fileUrl,
          localMaterialId: x.id
        })
      }
    )

    modalApi.setData({
      materialList: materialList.value,
      materialType: materialType.value,
      currentGroupIndex: currentGroupIndex.value
    });
    materialList.value = []
    await modalApi.close();

  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      selectedAssets.value = []; // 打开时清空上次的操作记录
      const {type, groupIndex} = modalApi.getData();
      materialType.value = type;
      currentGroupIndex.value = groupIndex;
      await fetchList();
    }
  },
});

// 3. 选中逻辑
const isCheckAll = computed({
  get: () => {
    if (listData.value.length === 0) return false;

    // 获取配额
    const data = modalApi.getData();
    const quota = data?.remainingQuota ?? 999;

    // 情况 1: 如果当前已选总数已经达到或超过配额，全选框亮起（表示无法再选更多了）
    if (selectedAssets.value.length >= quota) {
      return true;
    }

    // 情况 2: 标准逻辑——当前页所有项是否都在已选池中
    return listData.value.every((item) =>
      selectedAssets.value.some((s) => s.id === item.id)
    );
  },
  set: (val: boolean) => {
    const data = modalApi.getData();
    const quota = data?.remainingQuota ?? 999;

    if (val) {
      // 这里的逻辑保持你原来的：按配额尽可能多选
      let remainingCanSelect = quota - selectedAssets.value.length;
      if (remainingCanSelect <= 0) return;

      listData.value.forEach((item) => {
        const isAlreadyPicked = selectedAssets.value.some(s => s.id === item.id);
        if (!isAlreadyPicked && remainingCanSelect > 0) {
          item.selected = true;
          selectedAssets.value.push(item);
          remainingCanSelect--;
        }
      });
    } else {
      // 取消全选：只移除当前页存在于已选池中的项
      const currentPageIds = listData.value.map(i => i.id);
      listData.value.forEach(item => item.selected = false);
      selectedAssets.value = selectedAssets.value.filter(s => !currentPageIds.includes(s.id));
    }
  },
});

function onCheckAllChange(e: any) {
  isCheckAll.value = e.target.checked;
}

function handlePageChange(page: number, pageSize: number) {
  queryParam.value.page = page;
  queryParam.value.pageSize = pageSize;
  fetchList();
}

const isReachQuota = computed(() => {
  const data = modalApi.getData();
  const quota = data?.remainingQuota ?? 0;
  // 统计“选中池”的总数
  return selectedAssets.value.length >= quota;
});

function handleSelect(item: any) {
  if (isReachQuota.value && !item.selected) return;

  item.selected = !item.selected;

  if (item.selected) {
    // 放入选中池（去重）
    if (!selectedAssets.value.some(s => s.id === item.id)) {
      selectedAssets.value.push(item);
    }
  } else {
    // 从选中池移除
    selectedAssets.value = selectedAssets.value.filter(s => s.id !== item.id);
  }
}

async function search() {
  queryParam.value.page = 1;
  queryParam.value.pageSize = 20;
  await fetchList()
}
</script>

<template>
  <Modal title="素材库" class="w-[65.5%]">
    <div class="flex flex-col h-[65vh]">
      <div class="flex border-b pb-1 mb-4">
        <Form/>
        <Button class="ml-4" type="primary" @click="search">搜索</Button>
      </div>

      <div class="flex-1 overflow-y-auto pr-2">
        <List
          :grid="{ gutter: 12, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }"
          :data-source="listData"
          :loading="loading"
        >
          <template #renderItem="{ item }">
            <ListItem class="!p-0 !mb-3 h-full w-[230px]">
              <Card
                hoverable
                :class="[
                  'material-card',
                  item.selected ? 'is-selected' : '',
                  // 核心：已达上限且自己没被选中时，应用禁用样式
                  (isReachQuota && !item.selected) ? 'is-disabled' : ''
                ]"
                @click="handleSelect(item)"
              >
                <template #cover>
                  <div
                    class="relative w-full h-[100px] bg-[#f0f2f5] flex items-center justify-center overflow-hidden">
                    <div class="absolute top-1 left-1 z-10" @click.stop>
                      <Checkbox
                        :checked="item.selected" 
                        :disabled="isReachQuota && !item.selected" 
                        @change="handleSelect(item)"
                      />
                    </div>

                    <img
                      v-if="item.fileUrl"
                      :src="item.fileUrl"
                      class="w-full h-full object-contain bg-black"
                    />
                    <div v-else class="text-gray-400 text-[10px] flex flex-col items-center">
                      <div class="mb-1 text-lg">🖼️</div>
                      暂无预览
                    </div>

                    <span v-if="item.duration"
                          class="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                      {{ item.duration }}
                    </span>
                  </div>
                </template>

                <div class="p-2 h-[70px] flex flex-col justify-between overflow-hidden">
                  <div class="text-[12px] font-medium name-text mb-1 leading-snug"
                       :title="item.name">
                    {{ item.name }}
                  </div>
                  <!-- <div class="flex gap-1">
                    <Tag color="blue" size="small" v-if="item.isUsed" class="!text-[10px] !px-1">已使用</Tag>
                    <Tag color="orange" size="small" v-if="item.noConsume" class="!text-[10px] !px-1">无消耗</Tag>
                  </div> -->
                </div>
              </Card>
            </ListItem>
          </template>
        </List>
      </div>

      <div class="flex-none flex justify-between items-center border-t pt-4 mt-2">
        <div class="flex items-center gap-4">
          <div class="text-gray-500 text-sm">共 {{ queryParam.total }} 条</div>
          <Pagination
            v-model:current="queryParam.page"
            :total="queryParam.total"
            :page-size="queryParam.pageSize"
            size="small"
            show-size-changer
            @change="handlePageChange"
          />
        </div>
        <div class="flex items-center">
          <Checkbox :checked="isCheckAll" @change="onCheckAllChange">全选</Checkbox>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="less" scoped>
.material-card {
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;

  // 【最核心】强制固定高度，不再依赖内容
  height: 170px !important;
  width: 100% !important;
  display: flex;
  flex-direction: column;

  :deep(.ant-card-body) {
    padding: 0 !important;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }

  &.is-selected {
    border: 1px solid #1890ff;
    background-color: #e6f7ff;

    .p-2 {
      background-color: #e6f7ff;
    }
  }
}

// 强制多行省略
.name-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
  height: 32px; // 设定标题固定高度，防止1行和2行高度不一致
}

// 修正 Ant Design List 内部容器由于 flex 导致的高度塌陷
:deep(.ant-list-spin-container) {
  height: 100%;
}

:deep(.ant-row) {
  width: 100%; // 强制 Row 铺满，防止关闭控制台后收缩
}

.is-disabled {
  // 灰色滤镜，视觉上表现为不可选
  filter: grayscale(100%);
  opacity: 0.5;
  // 禁止所有鼠标事件，包括点击和悬浮效果
  pointer-events: none;
  cursor: not-allowed;
}

// 确保 Checkbox 即使在 pointer-events: none 下也有正确的禁用样式
:deep(.ant-checkbox-disabled) {
  cursor: not-allowed;
}
</style>
