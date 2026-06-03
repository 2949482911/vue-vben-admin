<script setup lang="ts">
import { advertiserApi, aManagementApi } from '#/api';
import type { AdGroupItem } from '#/api/models';
import { trimObject } from '#/utils/trim';
import { Page, useVbenDrawer, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { Button, message } from 'ant-design-vue';
import { buildApiFilters } from '../ad_management_filtering';
import adGroup_drawer from './adGroup_drawer.vue';

const [AdGroupDrawer, adGroupDrawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: adGroup_drawer,
});

async function viewDetails(row: AdGroupItem) {
  adGroupDrawerApi.setData(row);
  adGroupDrawerApi.open();
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
      component: 'ApiSelect',
      dependencies: {
        triggerFields: ['platform'],
        trigger: (_values, { setFieldValue }) => {
          setFieldValue('platform_account_id', undefined);
        },
      },
      componentProps: (formValues: Record<string, any>) => {
        const platform = formValues.platform;
        return {
          allowClear: true,
          showSearch: true,
          placeholder: '请选择账户',
          api: async (params: any) => {
            return await advertiserApi.fetchAdvertiserList(params);
          },
          filterOption: (inputValue: string, option: { label: string }) => {
            return option.label.toLowerCase().includes(inputValue.toLowerCase());
          },
          // 动态把平台塞进请求参数
          params: {
            page: 1,
            pageSize: 10000,
            platform: platform,
          },
          valueField: 'advertiserId',
          labelField: 'advertiserName',
          resultField: 'items',
        };
      },
      fieldName: 'platform_account_id',
      label: '账户名称',
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
      fieldName: 'adgroupName',
      label: '广告组名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'adgroupId',
      label: '广告组ID',
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
      field: 'adgroupName',
      title: '广告组名称',
    },
    {
      field: 'adgroupId',
      title: '广告组ID',
    },
    {
      field: 'price',
      title: '一阶段出价',
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
      field: 'adgroupCreateTime',
      title: '广告组创建时间',
    },
    {
      field: 'startDate',
      title: '广告组开始时间',
    },
    {
      field: 'endDate',
      title: '广告组结束时间',
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
          adgroupName: 3,
          platform_account_id: 1,
        };

        const filters = buildApiFilters(params, filterMap);
        const requestPayload: any = {
          page: page.currentPage,
          pageSize: page.pageSize,
          level: 'adgroup',
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
    adgroupName: 3,
    platform_account_id: 1,
  };

  const filters = buildApiFilters(formValues, filterMap);
  const requestPayload: any = {
    level: 'adgroup',
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

function adGroup_pageReload() {
  gridApi.reload();
}

defineExpose({ adGroup_pageReload });
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
    <AdGroupDrawer class="w-[40%]" />
  </div>
</template>

<style scoped lang="scss"></style>
