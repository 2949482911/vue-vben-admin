<script setup lang="ts">
import {trimObject} from '#/utils/trim';
import type {VbenFormProps} from '@vben/common-ui';
import {Page, useVbenDrawer} from '@vben/common-ui';
import type {DspItem} from '#/api/models';
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {Button, Switch} from 'ant-design-vue';
import {TABLE_COMMON_COLUMNS,PLATFORM} from '#/constants/locales';
import { pushCampaignApi } from '#/api/core/adx.ts';
import {$t} from '@vben/locales';
import CreateDSpDrawer from './create.vue';
import {Dropdown, Menu,MenuItem} from 'ant-design-vue';

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t('adx.dsp.columns.name')}`,
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.choice')}`,
        options: PLATFORM,
        allowClear: true,
      },
      fieldName: 'platform',
      label: `平台`,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<DspItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true,
  },
  columns: [
    ...TABLE_COMMON_COLUMNS as any,
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        return await pushCampaignApi.fetchPushCampaignList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

const [CreateDrawer, createDrawerApi] = useVbenDrawer({
 connectedComponent: CreateDSpDrawer,
})
function openCreateDrawer(row?: DspItem|string) {
  if (row?.id) {
    createDrawerApi.setData(row);
  } else {
    createDrawerApi.setData({type: row});
  }
  createDrawerApi.open();
}
function pageReload() {
  gridApi.reload();
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools>
          <Dropdown placement="bottom">
            <Button class="mr-2" type="primary">
              {{ $t('common.create') }}
            </Button>
            <template #overlay>
              <Menu>
                <MenuItem  @click="()=>openCreateDrawer('huawei')">
                  创建华为push计划
                </MenuItem>
                <MenuItem  @click="()=>openCreateDrawer('honor')">
                  创建荣耀push计划
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>
        </template>
        <template #status="{ row }">
          <Switch :checked="row.status === 1" @click="handlerState(row)"/>
        </template>
        <template #action="{ row }">
          <Button type="link" @click="openCreateDrawer(row)">
            {{ $t('common.edit') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <CreateDrawer @page-reload="pageReload"/>
  </div>
</template>

<style scoped lang="scss">

</style>
