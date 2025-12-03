<script setup lang="ts" name="AdReportDataManager">


import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import {Page, useVbenModal, type VbenFormProps} from "@vben/common-ui";
import {ACTIVE_PLATFORM, DIMS} from "#/constants/locales";
import {$t} from "@vben/locales";
import {advertiserApi, reportApi} from "#/api";
import {Button} from "ant-design-vue";
import SelectMetricModal from './selectmetric.vue';
import type {AdvertiserPageRequest} from "#/api/models";


const [SelectMetricModalModal, selectMetricModalApi] = useVbenModal({
  connectedComponent: SelectMetricModal,
});


// reloadGrid 重载数据
function reloadGrid(columns: string[], items: any[]) {
  const newColumns: any[] = [
    {title: '序号', type: 'seq', width: 'auto',},
  ];
  columns.forEach(x => {
    newColumns.push({
      field: x,
      title: x,
      width: 'auto',
    })
  })
  gridApi.setGridOptions({
    columns: newColumns,
    data: items
  })
}

// 获取确认的指标
function confirmMetric(metricIds: string[]) {
  gridApi.formApi.setFieldValue('queryMetric', metricIds)
}


function openPlatformMetricMapDetailModal() {
  selectMetricModalApi.open();
}


const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'RangePicker',
      defaultValue: [],
      componentProps: {
        placeholder: [`${$t('common.select')}`, `${$t('common.select')}`],
        format: ['YYYY-MM-DD', 'YYYY-MM-DD'],
        valueFormat: 'YYYY-MM-DD'
      },
      fieldName: 'dateTimeRange',
      label: 'Time',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ACTIVE_PLATFORM,
        mode: 'multiple',
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'platform',
      label: `${$t('ocpx.platform.title')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: DIMS,
        mode: 'multiple',
        placeholder: `${$t('common.choice')}`,
      },
      defaultValue: ['day'],
      fieldName: 'dims',
      label: `${$t('marketing.report.dims.title')}`,
    },
    {
      // 媒体配置表单
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.select')}`,
        mode: 'multiple',
        api: async (params: AdvertiserPageRequest) => {
          return await advertiserApi.fetchAdvertiserList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 1000,
          putStatue: 1,
        },
        valueField: 'id',
        labelField: 'advertiserName',
        resultField: 'items',
      },
      // 字段名
      fieldName: 'advertiserId',
      // 界面显示的label
      label: `${$t('marketing.advertiser.columns.advertiserName')}`,
    },
    {
      defaultValue: [],
      fieldName: 'queryMetric',
      label: '指标',
      rules: 'required',
      component: 'ApiSelect',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<Array<Map<string, string>>> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'ename',
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    search: true,
    zoom: true,
  },
  columns: [],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    autoLoad: false,
    ajax: {
      query: async ({}, args) => {
        return reportApi.fetchAdReport(args)
      },
    },
    response: {
      list: 'items',
      result: (res: any) => {
        reloadGrid(res.data.columns, res.data.items)
        return res.data
      }
    }
  },
};


const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openPlatformMetricMapDetailModal" danger>
            {{ $t('core.metric') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <SelectMetricModalModal @confirmMetric="confirmMetric"/>
  </div>
</template>

<style scoped>

</style>
