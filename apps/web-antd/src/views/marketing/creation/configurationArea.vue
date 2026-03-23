<script setup lang="ts">
import {Select, Input, Tooltip} from 'ant-design-vue';
import {onMounted, ref} from 'vue';
import {useVbenModal, type VbenFormProps} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import {advertiserApi, projectApi} from '#/api';
import {trimObject} from '#/utils/trim';
import type {SelectValue} from 'ant-design-vue/es/select';
import type {AccountInfo} from "#/views/marketing/creation/creation";
import type {AdvertiserItem} from "#/api/models";

const emit = defineEmits(['update:accountInfo', 'update:productInfo'])


const {accountInfo, project} = defineProps({
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => []
  },
  project: {
    type: Object,
    default: () => {
      return {
        projectId: '',
        projectName: '',
        icon: ''
      }
    }
  }
})


const productList = ref()
// 媒体账户显示文字 (String 格式方便绑定 Input)
const mediaAccountLabel = ref<string>('');
// 选中的ID数组方便回显
const selectedAccountIds = ref<string[]>([]);
// 定义一个变量存储完整的行对象，用于回显
const selectedRowsData = ref<any[]>([]);

onMounted(async () => {
  const res = await projectApi.fetchProjectList({page: 1, pageSize: 1000,})
  productList.value = res.items
})

// 2. 当项目 ID 改变时，查找完整对象并 emit
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
  // 添加确认按钮回调
  onConfirm: async () => {
    // 1. 获取全量选中的行数据（包括翻页保留的）
    const grid = gridApi.grid;
    if (!grid) return;

    const reserveRows = grid.getCheckboxReserveRecords(); // 之前页选中的
    const currentRows = grid.getCheckboxRecords();        // 当前页选中的
    const allSelected = [...reserveRows, ...currentRows];

    const finalRows: Array<AdvertiserItem> = Array.from(new Map(allSelected.map(item => [item.id, item])).values());

    selectedRowsData.value = finalRows; // 存对象数组
    // 选择ID
    selectedAccountIds.value = finalRows.map(r => r.id);
    // 标签展示
    mediaAccountLabel.value = finalRows.map((row: any) => row.advertiserName).join('，');

    //以下是跨页面勾选可以保留，但是如果先在前面页面勾选了，又去搜索勾选，前面页面的数据进不去
    const uniqueAccountInfo = finalRows.map((row: AdvertiserItem) => ({
      localAdvertiserId: row.id,
      advertiserName: row.advertiserName,
    }));
    //---------------------------------------------------------------

    //以下是跨页面勾选可以保留，如果取消需要在当前面页面取消勾选后先点确定才能取消
    // const newAccountInfo = finalRows.map((row: AdvertiserItem) => ({
    //   localAdvertiserId: row.id,
    //   advertiserName: row.advertiserName,
    // }));

    // const totalInfo = [...accountInfo, ...newAccountInfo];
    // const uniqueAccountInfo = Array.from(
    //     new Map(totalInfo.map(item => [item.localAdvertiserId, item])).values()
    // );
    //---------------------------------------------------------------

    emit('update:accountInfo', uniqueAccountInfo);
    await modalApi.close();
  },
});

function mediaAccountClick() {
  modalApi.open()
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
    }
  ],
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<AdvertiserItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
    reserve: true,
    checkRowKeys: selectedAccountIds.value,
    trigger: 'row',
  },
  rowConfig: {
    keyField: 'id'
  },
  height: "auto",
  columns: [
    {type: 'checkbox', width: 50},
    {title: '序号', type: 'seq', width: 50},
    {field: 'id', title: '账户ID'},
    {field: 'advertiserName', title: '账户名称'},
    {field: 'companyName', title: '主体名称'}
  ],
  exportConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        const res = await advertiserApi.fetchAdvertiserList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
        setTimeout(() => {
          const grid = gridApi.grid;
          if (grid && selectedAccountIds.value.length > 0) {
            grid.setCheckboxRowKey(selectedAccountIds.value, true);
          }
        }, 50);
        return res;
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

</script>

<template>
  <div>
    <div class="selectArea">
      <div class="selectSection">
        <div class="selectSection" style="margin: 0 10px 0 0;">
          <div>项目：</div>
          <Select
            ref="select"
            v-model:value="project.projectId"
            style="width: 120px"
            @change="handleProjectChange"
          >
            <Select.Option v-for="item in productList" :key="item.id" :label="item.name"
                           :value="item.id">{{ item.name }}
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
              style="width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
              @click="mediaAccountClick()"
            />
          </Tooltip>
        </div>
      </div>
    </div>
    <Modal class="w-[80%] h-[80vh]" title="选择媒体账户">
      <Grid/>
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
