<script setup lang="ts">
import type {VbenFormProps} from '@vben/common-ui';
import {Page} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import {$t} from '@vben/locales';
import {
  BALACE_DETAIL_PLATFORM,
  CONSUMPTION_DETAIL_DIMENSION,
  CONSUMPTION_DETAIL_DIMENSION_HUAWEI
} from '#/constants/locales';
import dayjs from 'dayjs';
import {onMounted, ref, nextTick} from 'vue';
import {advertiserApi, developerApi} from '#/api';
import type {AdvertiserItem} from '#/api/models';
import {useClientPagination} from '#/utils/pagination';
import {Platform} from "#/constants/enums";

const {
  pager,
  setData,
  getPageData,
  onPageChange,
} = useClientPagination<any>((loading) => {
  gridApi.setLoading(loading);
});

pager.pageSize = 500;
const fullData = ref<any[]>([]);
// 优化1：添加缓存列配置，避免重复生成
const cachedColumns = ref<any[]>([]);
// 优化2：添加 loading 状态防重复请求
const isLoading = ref(false);
// 优化3：防抖定时器
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let pageTimer: ReturnType<typeof setTimeout> | null = null;

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
    label: `${item.advertiserName}-${item.advertiserId}`,
    value: item.advertiserId,
  }));
}

async function loadAdCompanyOptions(platform: string) {
  adCompanyOption.value = [];
  if (!platform) return;

  const res = await advertiserApi.fetchAdCompanyOptions({
    platform,
  });
  adCompanyOption.value = res.companyList.map((item: string) => ({
    label: item,
    value: item,
  }));
}

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

async function aGenerationOptions(platform: string) {
  aGenerationOption.value = [];
  if (!platform) return;

  const res = await developerApi.fetchDeveloperList({
    platform,
    page: 1,
    pageSize: 200,
  });

  aGenerationOption.value = res.items.map((item) => ({
    label: `${item.name}-${item.id}`,
    value: item.id,
  }));
}

// 优化4：提取列生成逻辑，使用缓存
function generateColumns(columnsKeys: string[]) {
  // 检查缓存是否有效
  if (cachedColumns.value.length > 0 && 
      JSON.stringify(cachedColumns.value.map(c => c.field)) === JSON.stringify(['seq', ...columnsKeys])) {
    return cachedColumns.value;
  }

  const newColumns = [
    { title: '序号', field: 'seq', width: 100, fixed: 'left' },
    ...columnsKeys.map((key: string) => {
      const isFixedLeft = fixedLeftKeys.includes(key);
      const columnConfig: any = {
        field: key,
        title: key,
        width: 'auto',
        sortable: true,
        ...(isFixedLeft ? { fixed: 'left' } : {}),
      };

      if (key === '推广产品') {
        columnConfig.slots = { default: '推广产品' };
        columnConfig.exportMethod = ({ row }: any) => {
          if (!row || !row['推广产品']) return '';
          if (Array.isArray(row['推广产品'])) {
            return row['推广产品']
              .map((item: any) => item?.product_name?.trim())
              .filter(Boolean)
              .join('、');
          }
          return String(row['推广产品'] || '');
        };
      }
      return columnConfig;
    }),
  ];

  cachedColumns.value = newColumns;
  return newColumns;
}

// 优化5：原生防抖函数
function debounce(fn: Function, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 优化6：使用 requestAnimationFrame 优化渲染时机
async function init(args?: any) {
  // 防止重复请求
  if (isLoading.value) return;
  
  isLoading.value = true;
  gridApi.setLoading(true);
  
  try {
    const res = await advertiserApi.fetchAdvertiserCostDetail(args);
    const items = res.items.map((item: any, i: number) => ({
      ...item,
      seq: i + 1,
    }));

    fullData.value = items;
    
    // 使用 nextTick 分批更新，避免阻塞 UI
    await nextTick();
    
    // 更新分页数据
    await setData(items);

    // 生成或获取缓存的列配置
    const newColumns = generateColumns(res.columns);
    
    // 批量更新表格配置，减少重绘次数
    gridApi.setGridOptions({
      columns: newColumns,
      data: getPageData(),
      pagerConfig: {
        total: pager.total,
        currentPage: pager.currentPage,
        pageSize: pager.pageSize,
        pageSizes: [500, 800, 1000],
      },
      exportConfig: {
        ...gridOptions.exportConfig, 
        data: fullData.value,        
      },
    });
  } finally {
    isLoading.value = false;
    gridApi.setLoading(false);
  }
}

// 优化7：防抖处理页面切换
const handlePageChange = (params: { currentPage: number; pageSize: number }) => {
  // 清除之前的定时器
  if (pageTimer) clearTimeout(pageTimer);
  
  pageTimer = setTimeout(() => {
    // 使用 requestAnimationFrame 优化滚动性能
    requestAnimationFrame(() => {
      onPageChange(params.currentPage, params.pageSize);
      gridApi.setGridOptions({
        data: getPageData(),
        pagerConfig: {
          total: pager.total,
          currentPage: pager.currentPage,
          pageSize: pager.pageSize,
          pageSizes: [500, 800, 1000],
        },
      });
    });
    pageTimer = null;
  }, 100);
};

// 优化8：表单提交防抖
const handleFormSubmit = async (values: any) => {
  // 清除之前的定时器
  if (searchTimer) clearTimeout(searchTimer);
  
  searchTimer = setTimeout(async () => {
    pager.currentPage = 1;
    await init(values);
    searchTimer = null;
  }, 300);
};

// 优化9：表单重置优化
const handleFormReset = async () => {
  // 清除定时器
  if (searchTimer) clearTimeout(searchTimer);
  if (pageTimer) clearTimeout(pageTimer);
  
  await gridApi.formApi.resetForm();
  gridApi.setGridOptions({
    pagerConfig: {
      total: 0,
      currentPage: 1,
      pageSize: 500,
    },
  });
  await init(defaultQueryParams);
};

const fixedLeftKeys = ['APPID', 'day', '开发者ID', '账户ID', '公司名称', '账户名字'];

const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'RangePicker',
      defaultValue: [
        dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
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
      defaultValue: Platform.HUAWEI_STORE,
      componentProps: {
        allowClear: true,
        options: BALACE_DETAIL_PLATFORM,
        placeholder: `${$t('common.choice')}`,
        onChange: async (val: string) => {
          if (val === Platform.HUAWEI_STORE) {
            await loadAdCompanyOptions(val);
            await appNameOptions(val);
            await aGenerationOptions(val);
          }
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
        maxTagCount: 1,
        options: aGenerationOption,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'developerId',
      label: '一代主体',
      dependencies: {
        show: (value) => {
          return value.platform === Platform.HUAWEI_STORE;
        },
        triggerFields: ['platform']
      }
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        maxTagCount: 1,
        placeholder: `${$t('common.choice')}`,
        options: developerOption,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
      },
      fieldName: 'advertiserId',
      label: '账户名字',
      dependencies: {
        show: (value) => {
          return value.platform === Platform.HUAWEI_STORE;
        },
        triggerFields: ['platform']
      }
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
      label: '公司名字',
      dependencies: {
        show: (value) => {
          return value.platform === Platform.HUAWEI_STORE;
        },
        triggerFields: ['platform']
      }
    },
    {
      component: 'Select',
      defaultValue: ['day'],
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        maxTagCount: 1,
        options: CONSUMPTION_DETAIL_DIMENSION,
        placeholder: `${$t('common.choice')}`,
      },
      rules: 'required',
      fieldName: 'dims',
      label: '维度',
      dependencies: {
        show: (value) => {
          return value.platform === Platform.HUAWEI_STORE;
        },
        triggerFields: ['platform']
      }
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
      label: 'appName',
      dependencies: {
        show: (value) => {
          return value.platform === Platform.HUAWEI_STORE;
        },
        triggerFields: ['platform']
      }
    },
    {
      component: 'Select',
      defaultValue: ['day'],
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        options: CONSUMPTION_DETAIL_DIMENSION_HUAWEI,
        placeholder: `${$t('common.choice')}`,
      },
      rules: 'required',
      fieldName: 'dims',
      label: '维度',
      dependencies: {
        show: (value) => {
          return value.platform === Platform.HUAWEI;
        },
        triggerFields: ['platform']
      }
    },
  ],
  showCollapseButton: false,
  submitOnEnter: false,
  handleSubmit: handleFormSubmit,
  handleReset: handleFormReset,
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
  pagerConfig: {
    pageSize: 500,
    pageSizes: [500, 800, 1000],
  },
  exportConfig: {
    filename: '',
    types: ["csv", "xlsx"],
    modes: ['all'],
    original: true,
  },
  proxyConfig: undefined,
  // 优化10：虚拟滚动配置优化
  virtualXConfig: { enabled: true, gt: 0 },
  virtualYConfig: { enabled: true, gt: 0 },
  // 优化11：渲染优化配置
  scrollY: { enabled: true, gt: 0 },
  showOverflow: true,
  showHeaderOverflow: true,
  // 优化12：禁用动画效果提升性能
  animate: false,
  // 优化13：优化渲染性能
  rowConfig: {
    useKey: true, // 使用 key 优化渲染
    isHover: false, // 禁用 hover 效果
  },
};

const gridEvents = {
  pageChange: handlePageChange,
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions, gridEvents});
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools></template>
        <template #推广产品="{row}">
          <div class="app-list">
            <div class="app-item" v-for="app in row['推广产品']" :key="app.appId">
              <div class="app-name">{{ app.product_name }}</div>
            </div>
          </div>
        </template>
      </Grid>
    </Page>
  </div>
</template>

<style scoped lang="scss">
// 优化14：使用 CSS 硬件加速
.app-list {
  will-change: transform;
}

.app-item {
  padding: 2px 0;
}

// 优化15：限制表格单元格内容溢出，提升渲染性能
:deep(.vxe-table) {
  .vxe-body--column {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  // 优化16：减少重绘
  .vxe-cell {
    line-height: 1.5;
  }
}
</style>
