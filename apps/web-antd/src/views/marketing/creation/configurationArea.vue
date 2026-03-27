<script setup lang="ts">
import { Select, Input, Tooltip } from 'ant-design-vue';
import { onMounted, ref } from 'vue';
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { advertiserApi, projectApi } from '#/api';
import { trimObject } from '#/utils/trim';
import type { SelectValue } from 'ant-design-vue/es/select';
import type { Project } from '#/views/marketing/creation/creation';
import type { AdvertiserItem } from '#/api/models';
import type { MediaAccount } from './vivo/vivo';

const emit = defineEmits(['update:accountInfo', 'update:productInfo']);

const { project } = defineProps({
  project: {
    type: Object,
    default: () => {
      return {
        projectId: '',
        projectName: '',
        icon: '',
      };
    },
  },
});

const productList = ref();
// 媒体账户显示文字 (String 格式方便绑定 Input)
const mediaAccountLabel = ref<string>('');
// 选中的ID数组方便回显
const selectedAccountIds = ref<string[]>([]);
// 定义一个变量存储完整的行对象
const selectedRowsData = ref<any[]>([]);
// 内部维护一个临时变量，记录弹窗中所有的勾选对象
const tempSelectedRows = ref<AdvertiserItem[]>([]);

onMounted(async () => {
  const res = await projectApi.fetchProjectList({ page: 1, pageSize: 1000 });
  productList.value = res.items;
});

// 当项目 ID 改变时，查找完整对象并 emit
function handleProjectChange(val: SelectValue) {
  const selectedProject = productList.value?.find((item: any) => item.id === val);
  if (selectedProject) {
    project.projectId = selectedProject.id;
    project.projectName = selectedProject.name;
    project.icon = selectedProject.icon;
    project.packageName = selectedProject.packageName;
    emit('update:productInfo', project);
  }
}

//媒体账户选择弹框
const [Modal, modalApi] = useVbenModal({
  contentClass: 'modalStyle',
  onConfirm: async () => {
    // 【关键】只有点击确定时，才把临时变量同步到页面显示的变量中
    const finalRows = tempSelectedRows.value;
    selectedRowsData.value = [...finalRows]; // 补充这一行

    // 更新外层显示文字
    mediaAccountLabel.value = finalRows.map((r) => r.advertiserName).join('，');
    // 更新外层选中的 ID 数组
    selectedAccountIds.value = finalRows.map((r) => r.id);

    // 构造发送给后端或父组件的数据
    const uniqueAccountInfo = finalRows.map((row: AdvertiserItem) => ({
      localAdvertiserId: row.id,
      advertiserName: row.advertiserName,
    }));

    emit('update:accountInfo', uniqueAccountInfo);
    await modalApi.close();
  },
});

function mediaAccountClick() {
  modalApi.open();

  // 首先同步临时变量，确保弹窗操作的基础数据是最新的
  tempSelectedRows.value = [...selectedRowsData.value];

  // 延迟操作 Grid，因为 modal 打开可能需要一点点渲染时间
  setTimeout(() => {
    const grid = gridApi.grid;
    if (grid) {
      grid.clearCheckboxRow();
      grid.clearCheckboxReserve();

      // 如果之前已经有选中的 ID，强制回显
      if (selectedAccountIds.value.length > 0) {
        grid.setCheckboxRowKey(selectedAccountIds.value, true);
      }
    }
  }, 50);
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入账户ID',
      },
      fieldName: 'id',
      label: '账户ID',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入账户名称',
      },
      fieldName: 'advertiserName',
      label: '账户名称',
    },
  ],
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<AdvertiserItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    // labelField: 'id',
    reserve: true,
    checkRowKeys: selectedAccountIds.value,
    trigger: 'row',
  },
  rowConfig: {
    keyField: 'id',
  },
  height: 'auto',
  columns: [
    { type: 'checkbox', width: 50 },
    { title: '序号', type: 'seq', width: 50 },
    { field: 'id', title: '账户ID' },
    { field: 'advertiserName', title: '账户名称' },
    { field: 'companyName', title: '主体名称' },
  ],
  exportConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        const res = await advertiserApi.fetchAdvertiserList({
          page: page.currentPage,
          pageSize: page.pageSize,
          platform: 'vivo',
          putStatue: 1,
          ...params,
        });
        setTimeout(() => {
          const grid = gridApi.grid;
          if (grid) {
            // 【重要】这里应该用 tempSelectedRows 的 ID，因为它是弹窗内操作的最实时状态
            const idsToCheck = tempSelectedRows.value.map((item) => item.id);
            if (idsToCheck.length > 0) {
              grid.setCheckboxRowKey(idsToCheck, true);
            }
          }
        }, 50);
        return res;
      },
    },
  },
};

const gridEvents = {
  checkboxChange: () => updateTempRecords(),
  checkboxAll: () => updateTempRecords(),
};

// 抽取公共方法：获取当前 Grid 所有的勾选数据（含跨页和搜索结果）
function updateTempRecords() {
  const grid = gridApi.grid;
  if (!grid) return;

  const reserveRows = grid.getCheckboxReserveRecords();
  const currentRows = grid.getCheckboxRecords();

  // 合并
  const allSelected = [...reserveRows, ...currentRows];

  // 去重
  const uniqueMap = new Map();
  allSelected.forEach((item) => {
    if (item && item.id) {
      uniqueMap.set(item.id, item);
    }
  });

  tempSelectedRows.value = Array.from(uniqueMap.values());
}

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

/**复用组策略回显 */
function reuseDisplay(projectObj: Project, mediaAccountArr: MediaAccount[]) {
  handleProjectChange(projectObj.projectId);
  selectedAccountIds.value = mediaAccountArr.map((item) => item.localAdvertiserId);
  mediaAccountLabel.value = mediaAccountArr.map((row: any) => row.advertiserName).join('，');
  console.log(projectObj, 'projectObj');
  console.log(mediaAccountArr, 'mediaAccountArr');
}

defineExpose({ reuseDisplay });
</script>

<template>
  <div>
    <div class="selectArea">
      <div class="selectSection">
        <div class="selectSection" style="margin: 0 10px 0 0">
          <div>项目：</div>
          <Select
            ref="select"
            v-model:value="project.projectId"
            style="width: 120px"
            @change="handleProjectChange"
          >
            <Select.Option
              v-for="item in productList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              >{{ item.name }}
            </Select.Option>
          </Select>
        </div>
        <div class="selectSection">
          <div>媒体账户：</div>
          <Tooltip placement="top">
            <template #title v-if="mediaAccountLabel">
              {{ mediaAccountLabel }}
            </template>
            <Input
              class="inp"
              :value="mediaAccountLabel"
              readonly
              placeholder="请选择"
              style="width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
              @click="mediaAccountClick()"
            />
          </Tooltip>
        </div>
      </div>
    </div>
    <Modal class="w-[80%] h-[80vh]" title="选择媒体账户">
      <Grid />
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.selectArea {
  margin: 10px 0 0;

  .selectSection {
    display: flex;
    align-items: center;

    .inp {
      cursor: pointer;
    }
  }
}
</style>
