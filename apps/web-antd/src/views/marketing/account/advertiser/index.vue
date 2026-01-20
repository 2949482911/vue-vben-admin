<script lang="ts" setup name="AdvertiserManager">
import type {VbenFormProps} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import type {AdvertiserItem, DeveloperItem} from '#/api/models';

import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Switch, Tag, Dropdown, Menu, MenuItem} from 'ant-design-vue';

import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {advertiserApi} from '#/api/core';
import {projectApi, developerApi} from "#/api";
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import AuthAccount from './authaccount.vue';//授权弹窗
import CreateObjectRequestComp from './create.vue';//新增|修改弹窗
import BatchOperationComp from './batchOperation.vue';//批量修改弹窗
import ImportChildAdvertiser from './importchildadvertiser.vue';
import { computed, onMounted, ref } from 'vue';
import type { ProjectItem } from "./advertiser";

/**
 * 授权弹窗
 */
const [AuthAccountModal, authAccountModalApi] = useVbenModal({
  connectedComponent: AuthAccount,
  centered: true,
  modal: true,
});

function openAuthAccountModal() {
  authAccountModalApi.open();
}

/**
 * 创建弹窗
 */
const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateObjectRequestComp,
  centered: true,
  modal: true,
});

function openCreateModal(row?: AdvertiserItem) {
  if (row?.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({});
  }
  createObjectApi.open();
}

/**
 * 批量修改弹窗
 */
const [BatchOperationModal, BatchOperationApi] = useVbenModal({
  connectedComponent: BatchOperationComp,
  centered: true,
  modal: true,
});

function openBatchOptions() {
  BatchOperationApi.setData(selectedRows.value);
  BatchOperationApi.open();
}


const [ImportChildAdvertiserModal, improtChildApi] = useVbenModal({
  connectedComponent: ImportChildAdvertiser,
  centered: true,
  modal: true,
});



function openImportChildModal(row: AdvertiserItem) {
  improtChildApi.setData({id: row.id});
  improtChildApi.open();
}


async function handlerState(row: AdvertiserItem) {
  await (row.status === 1
    ? advertiserApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE,
      values: new Map<string, any>(),
    })
    : advertiserApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable,
      values: new Map<string, any>(),
    }));
  pageReload();
}

async function handlerDelete(row: AdvertiserItem) {
  await advertiserApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
    values: new Map<string, any>(),
  });
  pageReload();
}


async function handlerPutState(row: AdvertiserItem) {
  const putStatue: string = row.putStatue == 1 ? 'stop_put_status' : 'start_put_status';
  await advertiserApi.fetchBatchOptions({
    targetIds: [row.id],
    type: putStatue,
    values: new Map<string, any>(),
  });
  pageReload();
}

// 定义接受项目名称数组
const projectOptions = ref<ProjectItem[]>([]);

interface DeveloperOption {
  label: string;
  value: string;
}
const developerOption = ref<DeveloperOption[]>([])
// 页面加载时请求数据
onMounted(async () => {
  const res = await projectApi.fetchProjectList({
    page: 1,
    pageSize: 1000,
  });
  projectOptions.value = res.items;  
  const resOption = await developerApi.fetchDeveloperList({ page:1, pageSize:200 })
  developerOption.value = resOption.items.map((item:DeveloperItem) => ({
    label: item.name,
    value: item.id,
  }));
});

//computed是响应式的，如果直接赋值projectOptions已经晚了，schema已经初始化完成了异步数据没有触发表单更新
const projectSelectOptions = computed(() =>
  projectOptions.value.map((item:ProjectItem) => ({
    label: item.name,
    value: item.id,
  }))
);


const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: PLATFORM,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'platform',
      label: `${$t('ocpx.platform.title')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
        options: developerOption,
      },
      // 字段名
      fieldName: 'developerId',
      label: '开发者'
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: `${$t('marketing.advertiser.advertiserRole.proxy')}`,
            value: 'proxy',
          },
          {
            label: `${$t('marketing.advertiser.advertiserRole.advertiser')}`,
            value: 'advertiser',
          },
          {
            label: `${$t('marketing.advertiser.advertiserRole.personal')}`,
            value: 'personal',
          },
        ],
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'advertiserRole',
      label: `${$t('marketing.advertiser.columns.advertiserRole')}`,
    },

    {
      component: 'Input',
      fieldName: 'advertiserName',
      label: `${$t('marketing.developer.columns.name')}`,
    },

    {
      component: 'Input',
      fieldName: 'advertiserId',
      label: `${$t('marketing.advertiser.columns.advertiserId')}`,
    },

    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'putStatue',
      label: `${$t('marketing.advertiser.columns.putStatue')}`
    },

    {
      component: 'DatePicker',
      fieldName: 'createTime',
      label: 'Date',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'status',
      label: `${$t('core.columns.status')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: projectSelectOptions,//options不能直接传ref
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'projectId',
      label: '项目',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<AdvertiserItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
    range: true,
    // reserve: true,
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    {
      field: 'platform',
      title: `${$t('ocpx.platform.title')}`,
      width: 'auto',
    },
    {
      field: 'developerName',
      title: '开发者',
      width: 'auto',
    },
    {
      field: 'advertiserId',
      title: `${$t('marketing.advertiser.columns.advertiserId')}`,
      width: 'auto',
    },

    {
      field: 'advertiserName',
      title: `${$t('marketing.advertiser.columns.advertiserName')}`,
      width: 'auto',
    },

    {
      field: 'projectName',
      title: `${$t('marketing.advertiser.columns.projectId')}`,
      width: 'auto',
    },

    {
      field: 'advertiserRole',
      title: `${$t('marketing.advertiser.columns.advertiserRole')}`,
      width: 'auto',
      slots: {default: 'advertiserRole'},
    },

    {
      field: 'remark',
      title: `${$t('marketing.advertiser.columns.remark')}`,
      width: 'auto',
    },

    {
      field: 'platformRemark',
      title: `${$t('marketing.advertiser.columns.platformRemark')}`,
      width: 'auto',
    },

    {
      field: 'putStatue',
      title: `${$t('marketing.advertiser.columns.putStatue')}`,
      width: 'auto',
      slots: {default: 'putStatue'}
    },

    {
      field: 'platformStatus',
      title: `${$t('marketing.advertiser.columns.platformStatus')}`,
      width: 'auto',
      slots: {default: 'platformStatus'}
    },

    {
      field: 'balance',
      title: `${$t('marketing.advertiser.columns.balance')}`,
      width: 'auto',
    },

    {
      field: 'dailyBudget',
      title: `${$t('marketing.advertiser.columns.dailyBudget')}`,
      width: 'auto',
    },

    {
      field: 'companyName',
      title: `${$t('marketing.advertiser.columns.companyName')}`,
      width: 'auto',
    },

    {
      field: 'platformAuditState',
      title: `${$t('marketing.advertiser.columns.platformAuditState')}`,
      width: 'auto',
      slots: {default: 'platformAuditState'}
    },

    ...TABLE_COMMON_COLUMNS as any,
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  exportConfig: {
    filename: '',
    types: [
      "csv",
      "xlsx",
      "xls"
    ]
  },
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await advertiserApi.fetchAdvertiserList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args,
        });
      },
    },
  },
  // rowConfig: {
  //   keyField: 'id',
  // },
};
// 勾选的数组
const selectedRows = ref<AdvertiserItem[]>([])
const gridEvents = {
  checkboxChange:({records}:{records:AdvertiserItem[]})=>{
    selectedRows.value = records
  },
  //全选事件
  checkboxAll:({records}:{records:AdvertiserItem[]})=>{
    selectedRows.value = records
  },
  //当分页时也需要置灰批量操作按钮
  proxyQuery:({})=>{
    selectedRows.value = []
  }
}

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions,gridEvents});

function pageReload() {
  gridApi.reload();
  // 在批量操作修改项目后，把数组设置为空，控制按钮置灰
  selectedRows.value = []
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #putStatue="{row}">
          <Switch :checked="row.putStatue === 1" @click="handlerPutState(row)"></Switch>
        </template>
        <template #advertiserRole="{ row }">
          <Tag color="red">{{ row.advertiserRoleName }}</Tag>
        </template>

        <template #platformStatus="{row}">
          <Tag color="green">{{ row.platformStatus }}</Tag>
        </template>

        <template #platformAuditState="{row}">
          <Tag color="orange">{{ row.platformAuditState }}</Tag>
        </template>

        <template #action="{ row }">
          <Button type="link" @click="openCreateModal(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button type="link" @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>

          <Dropdown>
            <Button type="link">
              {{ $t('core.more') }}
            </Button>
            <template #overlay>
              <Menu>
                <MenuItem>
                  投放
                </MenuItem>
                <MenuItem v-if="row.advertiserRole === 'proxy'" @click="openImportChildModal(row)">
                  {{ $t('core.import')}}
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>

        </template>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>

        <template #toolbar-tools>
          <Dropdown trigger="click" placement="bottomCenter">
            <Button class="mr-2" type="primary" :disabled="selectedRows.length===0">
              {{ $t('common.batch_options') }}
            </Button>
            <template #overlay>
              <Menu>
                <MenuItem  @click="openBatchOptions">
                  批量修改项目
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>
          <Button class="mr-2" type="primary" @click="() => openCreateModal()">
            {{ $t('common.create') }}
          </Button>

          <Button
            class="mr-2"
            type="primary"
            danger
            @click="openAuthAccountModal"
          >
            {{ $t('marketing.advertiser.authAccount') }}
          </Button>

        </template>
      </Grid>
    </Page>
    <CreateObjectModal @page-reload="pageReload"/>
    <AuthAccountModal/>
    <BatchOperationModal @page-reload="pageReload"/>
    <ImportChildAdvertiserModal @page-reload="pageReload" :projectOptions="projectOptions"/>
  </div>
</template>

<style scoped lang="scss">

</style>
