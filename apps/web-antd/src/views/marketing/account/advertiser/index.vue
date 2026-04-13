<script lang="ts" setup name="AdvertiserManager">
import type {VbenFormProps} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import type {AdvertiserItem, DeveloperItem} from '#/api/models';

import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Switch, Tag, Dropdown, Menu, MenuItem, message} from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';

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
import BatchImportCom from './BatchImportCom.vue';
import HistoryList from './historyList.vue';
import { computed, onMounted, ref } from 'vue';
import type { ProjectItem } from "./advertiser";
import { trimObject } from '#/utils/trim';

const agentData = ref<AdvertiserItem[]>([])
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

function openBatchOptions(modalType: string) {
  BatchOperationApi.setData({
    selectedRows: selectedRows.value, // 原有选中行数据
    modalType: modalType, // 新增的弹窗类型
  });
  BatchOperationApi.open();
}


const [ImportChildAdvertiserModal, improtChildApi] = useVbenModal({
  connectedComponent: ImportChildAdvertiser,
  centered: true,
  modal: true,
});

const roleType = ref<string>('')

function openImportChildModal(row: AdvertiserItem) {
  improtChildApi.setData({id: row.id});
  improtChildApi.open();
  roleType.value = row.roleType
}

// 导入
const [ImportModal, importModalApi] = useVbenModal({
  connectedComponent: BatchImportCom,
  centered: true,
  modal: true,
});
function openHistoryModal(row: AdvertiserItem) {
  historyModalApi.setData(row)
  historyModalApi.open()
}

// 导入
const [HistoryModal, historyModalApi] = useVbenModal({
  connectedComponent: HistoryList,
  centered: true,
  modal: true,
});

function openImportModal() {
  importModalApi.open();
}
// 复制token
async function copyToken(text: string) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制');
  });
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
async function handlerHourlyState(row: AdvertiserItem) {
  const hourlyState = row.hourlyState === 1 ? 9 : 1
  await advertiserApi.fetchBatchOptions({
    targetIds: [row.id],
    type: 'update_advertiser_hourly',
    values: {
      hourly_state: hourlyState
    }
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
    label: `${item.name}-${item.id}`,
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
      component: 'Input',
      fieldName: 'id',
      label: `id`,
    },
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
          {
            label: `${$t('marketing.advertiser.advertiserRole.bm')}`,
            value: 'bm',
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
        options: STATUS_SELECT,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'hourlyState',
      label: `${$t('marketing.advertiser.columns.hourlyState')}`,
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
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: `${$t('common.choice')}`,
        options: agentData,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
      },
      // 字段名
      fieldName: 'parentId',
      label: '代理商',
      dependencies: {
        show: true,
        triggerFields: ['platform'],
        if: (value) => {
          if(value.platform) {
            loadAgentData(value.platform)
          } else {
            agentData.value = []
          }
          return true;
        }
      },
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
      field: 'accessToken',
      title: `${$t('marketing.advertiser.columns.accessToken')}`,
      width: 'auto',
      slots: {default:'accessToken'}
    },

    {
      field: 'projectName',
      title: `${$t('marketing.advertiser.columns.projectId')}`,
      width: 'auto',
    },
    {
      field: 'orgName',
      title: `${$t('marketing.advertiser.columns.orgName')}`,
      width: 'auto',
    },
    {
      field: 'saleName',
      title: '销售',
      width: 'auto',
    },
    {
      field: 'advertiserRole',
      title: `${$t('marketing.advertiser.columns.advertiserRole')}`,
      width: 'auto',
      slots: {default: 'advertiserRole'},
    },
    {
      field: 'customer',
      title: '客户系',
      width: 'auto',
    },
    {
      field: 'hourlyState',
      title: `${$t('marketing.advertiser.columns.hourlyState')}`,
      width: 'auto',
      slots: {default: 'hourlyState'}
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
    {
      field: 'tagName',
      title: `${$t('marketing.advertiser.columns.tagName')}`,
      width: 'auto',
      slots: {default: 'tagName'}
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
        const params = trimObject(args);
        return await advertiserApi.fetchAdvertiserList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
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
async function loadAgentData(platform: string) {
  if (!platform) {
    agentData.value = [];
    return;
  }
  const res = await advertiserApi.fetchAdvertiserList({
            page:1,
            pageSize:1000,
            platform: platform,
            advertiserRole: 'proxy'
          })
  agentData.value = res.items.map((item: AdvertiserItem) => ({
    label: `${item.advertiserName}-${item.advertiserId}`,
    value: item.id,
  }));
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #putStatue="{row}">
          <Switch :checked="row.putStatue === 1" @click="handlerPutState(row)"></Switch>
        </template>
        <template #hourlyState="{row}">
          <Switch :checked="row.hourlyState === 1" @click="handlerHourlyState(row)"></Switch>
        </template>
        <template #advertiserRole="{ row }">
          <Tag color="red">{{ row.advertiserRoleName }}</Tag>
        </template>
        <template #accessToken="{ row }">
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <Button
          type="link"
          @click="copyToken(row.accessToken)"
          >
            一键复制
          </Button>
        </div>
        </template>

        <template #platformStatus="{row}">
          <Tag color="green">{{ row.platformStatus }}</Tag>
        </template>

        <template #platformAuditState="{row}">
          <Tag color="orange">{{ row.platformAuditState }}</Tag>
        </template>
        <template #tagName="{row}">
          <span v-if="!row.tagName">-</span>
          <Tag v-else color="blue">{{ row.tagName}}</Tag>
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
                <MenuItem v-if="row.advertiserRole === 'proxy' || row.advertiserRole === 'bm'" @click="openImportChildModal(row)">
                  {{ $t('core.import')}}
                </MenuItem>
                <MenuItem @click="openHistoryModal(row)">
                  同步历史
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
                <MenuItem  @click="openBatchOptions('edit')">
                  修改项目
                </MenuItem>
                <MenuItem  @click="openBatchOptions('bind')">
                  绑定标签
                </MenuItem>
                <MenuItem  @click="openBatchOptions('org')">
                  修改部门
                </MenuItem>
                <MenuItem  @click="openBatchOptions('sale')">
                  修改销售
                </MenuItem>
                <MenuItem  @click="openBatchOptions('creator')">
                  修改创建人
                </MenuItem>
                <MenuItem  @click="openBatchOptions('status')">
                  修改投放状态
                </MenuItem>
                <MenuItem  @click="openBatchOptions('hourlyState')">
                  修改分时状态
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
          <Button
            @click="openImportModal"
            class="importBtn"
          >
          <template #icon><UploadOutlined /></template>
          </Button>

        </template>
      </Grid>
    </Page>
    <CreateObjectModal @page-reload="pageReload"/>
    <AuthAccountModal/>
    <BatchOperationModal @page-reload="pageReload"/>
    <ImportModal @page-reload="pageReload"/>
    <ImportChildAdvertiserModal @page-reload="pageReload" :projectOptions="projectOptions" :roleType="roleType"/>
    <HistoryModal/>
  </div>
</template>

<style scoped lang="scss">
 :deep(.importBtn) {
  border-radius: 50% !important;
}
</style>
