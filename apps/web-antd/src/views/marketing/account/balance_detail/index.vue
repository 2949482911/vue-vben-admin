<script setup lang="ts">
import {Page} from '@vben/common-ui';
import type {VbenFormProps} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import { $t } from '@vben/locales';
import { ADVERTISET_ADDED, CONSUMPTION_DETAIL_DIMENSION } from '#/constants/locales';
import dayjs from 'dayjs';
import { ref, onMounted } from 'vue';
import {advertiserApi, developerApi } from '#/api';
import type { AdvertiserItem } from '#/api/models';
import { useClientPagination } from '#/utils/pagination';

const {
  pager,
  setData,
  getPageData,
  onPageChange,
} = useClientPagination<any>((loading) => {
  gridApi.setLoading(loading);
});

const defaultQueryParams = {
  platform: 'huawei_store',
  dateTime: [
    dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD'),
  ],
  developerId: [],
  advertiserId: [],
  dims: ['day'],
  huwaweiAppIdList: [],
};

onMounted(() => {
  // 默认平台
  loadAdCompanyOptions('huawei_store');
  loadAdvertiserOptions('huawei_store');
  aGenerationOptions('huawei_store')
  appNameOptions('huawei_store')
  init(defaultQueryParams)
});

interface DeveloperOption {
  label: string;
  value: string;
}

interface AdvertiserApp {
  name: string;
  appId: string;
}

const developerOption = ref<DeveloperOption[]>([])
const adCompanyOption = ref<string[]>([])
const aGenerationOption = ref<DeveloperOption[]>([])
const appNameOption = ref<DeveloperOption[]>([])

/**默认平台为华为商店，然后拿到账户名字的下拉事件 */
async function loadAdvertiserOptions(platform: string) {
  developerOption.value = [];

  if (!platform) return;

  const res = await advertiserApi.fetchAdvertiserList({
    platform,
    putStatue: 1,
    page: 1,
    pageSize: 100000,
  });

  developerOption.value = res.items.map((item) => ({
    label: item.advertiserName,
    value: item.advertiserId,
  }));
}

/**默认平台为华为商店，然后拿到公司名字的下拉事件 */
async function loadAdCompanyOptions(platform: string) {
  adCompanyOption.value = [];

  if (!platform) return;

  const res = await advertiserApi.fetchAdCompanyOptions({
    platform,
  });
  adCompanyOption.value = res.companyList.map((item:string) => ({
    label: item,
    value: item,
  }));
}

/**默认平台为华为商店，然后拿到Apps的下拉事件 */
async function appNameOptions(platform: string) {
  appNameOption.value = [];

  if (!platform) return;

  const res: AdvertiserApp[] = await advertiserApi.fetchAdvertiserAppOptions({
    platform,
  });
  appNameOption.value = res.map((item) => ({
    label: item.name,
    value: item.appId,
  }));
}

/**默认平台为华为商店，然后拿到一代主体的下拉事件 */
async function aGenerationOptions(platform: string) {
  aGenerationOption.value = [];

  if (!platform) return;

  const res = await developerApi.fetchDeveloperList({
    platform,
    page: 1,
    pageSize: 200,
  });

  aGenerationOption.value = res.items.map((item) => ({
    label: item.name,
    value: item.id,
  }));
}

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
          await loadAdCompanyOptions(val);
          await loadAdvertiserOptions(val);
          await appNameOptions(val);
          await aGenerationOptions(val);
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
        options: aGenerationOption,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'developerId',
      label:'一代主体',
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
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        placeholder: `${$t('common.choice')}`,
        options: adCompanyOption,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
      },
      fieldName: 'companyNames',
      label: '公司名字'
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
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        options: appNameOption,
        placeholder: `${$t('common.choice')}`,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
      },
      fieldName: 'huwaweiAppIdList',
      label:'appName',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  handleSubmit: async (values) => {
    pager.currentPage = 1;
    await init(values);
  },
  handleReset: async () => {
    await gridApi.formApi.resetForm();
    gridApi.setGridOptions({
      pagerConfig: {
        total: 0,
        currentPage: 1,
        pageSize: pager.pageSize,
      },
    });
    await init(defaultQueryParams);
  },
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
  columns: [],
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
  proxyConfig: undefined,
};

const fixedLeftKeys = ['APPID', 'day', '开发者ID', '账户ID'];

async function init(args?: any) {
  try {
    gridApi.setLoading(true);
    const res = await advertiserApi.fetchAdvertiserCostDetail(args);
    // ① 设置全量数据（内部会自动 reset 到第一页 + loading）
    await setData(
      res.items.map((item: any, i: number) => ({
        ...item,
        seq: i + 1,
      })),
    );
    // ② 生成列
    const newColumns = [
      { title: '序号', field: 'seq', width: 'auto', fixed: 'left' },
      ...res.columns.map((key: string) => {
        const isFixedLeft = fixedLeftKeys.includes(key);
        return {
          field: key,
          title: key,
          width: 'auto',
          sortable: true,
          ...(isFixedLeft ? { fixed: 'left' } : {}),
        };
      }),
    ];
    // ③ 更新 Grid（只用当前页数据）
    gridApi.setGridOptions({
      columns: newColumns,
      data: getPageData(),
      pagerConfig: {
        total: pager.total,
        currentPage: pager.currentPage,
        pageSize: pager.pageSize,
      },
    });
  } finally {
    gridApi.setLoading(false);
  }
}

const gridEvents = {
  pageChange({ currentPage, pageSize }: { currentPage: number; pageSize: number }) {
    onPageChange(currentPage, pageSize);
    gridApi.setGridOptions({
      data: getPageData(),
      pagerConfig: {
        total: pager.total,
        currentPage: pager.currentPage,
        pageSize: pager.pageSize,
      },
    });
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

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
