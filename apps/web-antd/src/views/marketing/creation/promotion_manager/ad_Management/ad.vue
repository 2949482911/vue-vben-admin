<script setup lang="ts">
import { aManagementApi } from '#/api';
import type { PromotionItem } from '#/api/models';
import { trimObject } from '#/utils/trim';
import { Page, useVbenDrawer, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { Button, message } from 'ant-design-vue';
import { buildApiFilters } from '../ad_management_filtering';
import ad_drawer from './ad_drawer.vue';

const [AdDrawer, adDrawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: ad_drawer,
});

async function viewDetails(row: PromotionItem) {
  adDrawerApi.setData(row);
  adDrawerApi.open();
}

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          {
            label: 'vivo',
            value: 'vivo',
          },
          {
            label: 'oppo',
            value: 'oppo',
          },
        ],
      },
      fieldName: 'platform',
      label: '平台',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'campaignId',
      label: '计划ID',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'adgroupId',
      label: '广告组ID',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'promotionName',
      label: '广告名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'promotionId',
      label: '广告ID',
    },
  ],
  showCollapseButton: true,
  submitOnEnter: false,
};

const gridOptions: VxeGridProps = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'platform',
      title: '平台',
    },
    {
      field: 'advertiserId',
      title: '账户ID',
    },
    {
      field: 'campaignId',
      title: '计划ID',
    },
    {
      field: 'adgroupId',
      title: '广告组ID',
    },
    {
      field: 'promotionName',
      title: '广告名称',
    },
    {
      field: 'promotionId',
      title: '广告ID',
    },
    {
      field: 'state',
      title: 'state',
    },
    {
      field: 'deleted',
      title: 'deleted',
    },
    {
      field: 'promotionCreateTime',
      title: '广告创建时间',
    },
    {
      field: 'options',
      title: '操作',
      fixed: 'right',
      slots: { default: 'action' },
      width: 'auto',
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        const filterMap = {
          platform: 1,
          campaignId: 1,
          adgroupId: 1,
          promotionId: 1,
          promotionName: 3,
        };

        const filters = buildApiFilters(params, filterMap);
        const requestPayload: any = {
          page: page.currentPage,
          pageSize: page.pageSize,
          level: 'promotion',
        };

        if (filters.length > 0) requestPayload.filters = filters;

        return await aManagementApi.fetchAdManagementList(requestPayload);
      },
    },
  },
};

async function handleCustomExport() {
  const formValues = await gridApi.formApi.getValues();

  if (!formValues?.platform) {
    message.warning('请先在搜索条件中选择“平台”筛选再进行下载！');
    return;
  }
  const filterMap = {
    platform: 1,
    campaignId: 1,
    adgroupId: 1,
    promotionId: 1,
    promotionName: 3,
  };

  const filters = buildApiFilters(formValues, filterMap);
  const requestPayload: any = {
    level: 'promotion',
  };
  if (filters.length > 0) requestPayload.filters = filters;
  try {
    await aManagementApi.fetchAdExport(requestPayload);
    message.success('导出任务已提交！请前往「下载中心」查看并下载文件。');
  } catch (err) {
    console.log(err, 'err');
  }
}

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function ad_pageReload() {
  gridApi.reload();
}

defineExpose({ ad_pageReload });
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools>
          <Button type="primary" @click="handleCustomExport"> 导出 </Button>
        </template>
        <template #action="{ row }">
          <Button type="link" @click="viewDetails(row)"> 详情 </Button>
        </template>
      </Grid>
    </Page>
    <AdDrawer class="w-[40%]" />
  </div>
</template>

<style scoped lang="scss"></style>
