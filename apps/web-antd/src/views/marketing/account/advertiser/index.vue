<script lang="ts" setup name="AdvertiserManager">
import type {VbenFormProps} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import type {AdvertiserItem} from '#/api/models';

import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Button, Switch, Tag, Dropdown, Menu, MenuItem} from 'ant-design-vue';

import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {advertiserApi} from '#/api/core';
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';

import AuthAccount from './authaccount.vue';
import CreateObjectRequestComp from './create.vue';

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

function openCreateModal(row: AdvertiserItem) {
  if (row.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({});
  }
  createObjectApi.open();
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
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    search: true,
    zoom: true,
  },
  columns: [
    {
      field: 'platform',
      title: `${$t('ocpx.platform.title')}`,
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

    ...TABLE_COMMON_COLUMNS,
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
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
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

function pageReload() {
  gridApi.reload();
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
          <Tag color="red">{{ row.advertiserRole }}</Tag>
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
              </Menu>
            </template>
          </Dropdown>

        </template>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>

        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openCreateModal">
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
  </div>
</template>
