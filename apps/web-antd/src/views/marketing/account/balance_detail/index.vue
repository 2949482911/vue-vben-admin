<script setup lang="ts">
import {Page} from '@vben/common-ui';
import type {VbenFormProps} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import { $t } from '@vben/locales';
import { ADVERTISET_ADDED, CONSUMPTION_DETAIL_DIMENSION } from '#/constants/locales';
import dayjs from 'dayjs';
import { ref, onMounted } from 'vue';
import {advertiserApi } from '#/api';
import type { AdvertiserItem } from '#/api/models';

onMounted(() => {
  // 默认平台
  loadAdvertiserOptions('huawei_store');
});


async function loadAdvertiserOptions(platform: string) {
  developerOption.value = [];

  if (!platform) return;

  const res = await advertiserApi.fetchAdvertiserList({
    platform,
    putStatue: 1,
    page: 1,
    pageSize: 200,
  });

  developerOption.value = res.items.map((item) => ({
    label: item.advertiserName,
    value: item.advertiserId,
  }));
}

interface DeveloperOption {
  label: string;
  value: string;
}
const developerOption = ref<DeveloperOption[]>([])

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'RangePicker',
      defaultValue: [
        dayjs().subtract(6, 'day').format('YYYY-MM-DD'), // 7天前（含今天）
        dayjs().format('YYYY-MM-DD'),                    // 今天
      ],
      componentProps: {
        placeholder: [`${$t('common.select')}`, `${$t('common.select')}`],
        format: ['YYYY-MM-DD', 'YYYY-MM-DD'],
        valueFormat: 'YYYY-MM-DD',
        disabledDate: (current: any) => {
          return current && current > dayjs().endOf('day');
        },
      },
      rules: 'required',
      fieldName: 'dateTime',
      label: '时间',
    },
    {
      component: 'Select',
      defaultValue:'huawei_store',
      componentProps: {
        allowClear: true,
        options: ADVERTISET_ADDED,
        placeholder: `${$t('common.choice')}`,
        onChange: async (val: string) => {
          await loadAdvertiserOptions(val);
        },
      },
      rules: 'required',
      fieldName: 'platform',
      label: `${$t('ocpx.platform.title')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        placeholder: `${$t('common.choice')}`,
        options: developerOption,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
      },
      fieldName: 'advertiserId',
      label: '账户名字'
    },
    {
      component: 'Select',
      defaultValue:['day'],
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        options: CONSUMPTION_DETAIL_DIMENSION,
        placeholder: `${$t('common.choice')}`,
      },
      rules: 'required',
      fieldName: 'dims',
      label:'维度',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
}

const gridOptions: VxeGridProps<AdvertiserItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    {
      field: 'day',
      title: '时间',
      width: '120',
    },
    {
      field: 'appId',
      title: 'appId',
      width: '150',
    },
    {
      field: 'appName',
      title: 'appName',
      width: '150',
    },
    {
      field: 'AdCost',
      title: '总消耗',
      width: '120',
    },
    {
      field: 'AdCashCostMoney',
      title: '现金消耗金额',
      width: '120',
    },
    {
      field: 'AdExchangeCostMoney',
      title: '置换金消耗金额',
      width: '120',
    },
    {
      field: 'AdStarCouponCostMoney',
      title: '耀星券消耗金额',
      width: '120',
    },
    {
      field: 'AdGiftCostMoney',
      title: '赠送金消耗金额',
      width: '120',
    }
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
        return await advertiserApi.fetchAdvertiserCostDetail({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

</script>

<template>
<div>
  <Page auto-content-height>
    <Grid></Grid>
  </Page>
</div>
</template>

<style scoped lang="scss">

</style>
