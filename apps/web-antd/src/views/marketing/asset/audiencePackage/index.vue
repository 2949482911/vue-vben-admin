<script setup lang="ts">
import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
// import { projectApi, titlePackApi } from '#/api';
import { trimObject } from '#/utils/trim';
import { ACTIVE_PLATFORM, TABLE_COMMON_COLUMNS } from '#/constants/locales';
import { Button, message, Tag } from 'ant-design-vue';
import { advertiserApi, targetedPackageApi } from '#/api';
import type { AdConfig } from './audiencePackageType';
import CreatedAudiencePackage from './createdAudiencePackage.vue';
import { ref } from 'vue';

const [CreatedAudiencePackageModule, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: CreatedAudiencePackage,
    centered: true,
    modal: true,
});

function openModal() {
  displayValue.value = undefined;
  modalApi.open();
}

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options:ACTIVE_PLATFORM,
        placeholder: '请选择',
      },
      fieldName: 'platform',
      label: '平台',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '定向包名称',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: '请选择',
        api: async (params:any) => {
          return await advertiserApi.fetchAdvertiserList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 10000,
        },
        valueField: 'advertiserId',
        labelField: 'advertiserName',
        resultField: 'items',
      },
      fieldName: 'platformAdvertiserId',
      label: '平台开发者',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
}

const gridOptions: VxeGridProps = {
  border: true,
  checkboxConfig: {
    highlight: true,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    {
      field: 'name',
      title: '定向包名称',
      width: 'auto',
    },
    {
      field: 'platformAdvertiserName',
      title: '广告主名称',
      width: 'auto',
    },
    {
      field: 'platform',
      title: '平台',
      width: 'auto',
    },
    {
      field: 'remark',
      title: '备注',
      width: 'auto',
    },
    ...TABLE_COMMON_COLUMNS as any,
  ],
  height: 'auto',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        return await targetedPackageApi.fetchGetTitleTargetedPackage({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};

const displayValue = ref<AdConfig>()
async function handlerEdit(row:AdConfig){
  openModal();
  displayValue.value = { ...row }
}

async function handlerDelete(row:AdConfig) {
  try {
    await targetedPackageApi.fetchDelTargetedPackage({
      targetIds: [row.id],
      type: 'delete',
    });
    message.success('删除成功');
    await pageReload();
  } catch (err) {
    console.error('删除失败:', err);
  }
  
}

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}

</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #status="{row}">
          <Tag color="green" v-if="row.status === 1">
            启用
          </Tag>
          <Tag v-else color="red">不启用</Tag>
        </template>
        <template #action="{ row }">
          <Button type="link" @click="handlerEdit(row)">编辑</Button>
          <Button type="link" danger @click="handlerDelete(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openModal">新建定向包</Button>
        </template>
      </Grid>
    </Page>
    <CreatedAudiencePackageModule @page-reload="pageReload" :displayValue="displayValue"/>
  </div>
</template>

<style scoped lang="scss">

</style>
