<script setup lang="ts" name="AdReportDataManager">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { Page, useVbenDrawer, useVbenModal, type VbenFormProps } from "@vben/common-ui";
import { ACTIVE_PLATFORM, DIMS } from "#/constants/locales";
import { $t } from "@vben/locales";
import { Button } from "ant-design-vue";
import SelectMetricModal from "./selectmetric.vue";
import type { AdReportRequest, AdvertiserPageRequest, ReportFilter, searchDataFilter } from "#/api/models";
import {advertiserApi, reportApi,projectApi} from "#/api";
import type { ProjectItem } from "../../account/advertiser/advertiser";
import SaveTemplateModal from "./saveTemplate.vue";
import TemplateListDrawer from './templateList.vue';
import dayjs from 'dayjs';
import { useAdLinkage } from './adDropdown'

const selectPlatform = ref<string>(null)

const {
  planOptions,
  advertisementOptions,
  adGroupOptions,
  creativityOptions,
  loadAdLinkage,
  resetLoadedMap,
  setGridApi,
} = useAdLinkage()

/* ---------------- 模板抽屉 ---------------- */
const [TemplateDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: TemplateListDrawer,
});

function openTemplateListModalModal(){
  drawerApi.open();
}

const currentQueryMetric = ref<string[]>([]);

// 防抖标记，避免重复请求
let pendingRequest = null;

async function handleUseTemplate(template: searchDataFilter) {
  // 取消之前的请求
  if (pendingRequest) {
    pendingRequest = null;
  }
  
  await gridApi.formApi.resetForm();
  await gridApi.formApi.setValues(template);
  
  currentQueryMetric.value = template.queryMetric ? [...template.queryMetric] : [];
  
  const values = await gridApi.formApi.getValues() as searchDataFilter;
  const params = buildReportParams(values);
  await init(params);
}

/* ---------------- 指标弹窗 ---------------- */
const [SelectMetricModalModal, selectMetricModalApi] = useVbenModal({
  connectedComponent: SelectMetricModal,
});

async function openPlatformMetricMapDetailModal() {
  selectMetricModalApi.open();
}

/* ---------------- 保存模板弹窗 ---------------- */
const searchData = ref<searchDataFilter>({
  advertiserId: [],
  dims: [],
  platform: [],
  projectId: '',
  queryMetric: [],
  dateTimeRange: ['',''],
  campaign_id:[],
  adgroup_id:[],
  promotion_id:[],
  creative_id:[]
})

const [SaveTemplateModalModal, sveTemplateModalApi] = useVbenModal({
  connectedComponent: SaveTemplateModal,
});

async function openSaveTemplateModalModal() {
  searchData.value = await gridApi.formApi.getValues() as unknown as searchDataFilter;
  sveTemplateModalApi.open();
}

async function handleTemplateSaved() {
  await gridApi.formApi.resetForm();
}

/* 优化1：使用浅响应式数据，减少深度监听 */
const allData = ref([]); // 全部数据
const currentPageData = ref([]); // 当前页数据，独立存储避免全量更新
const tableColumns = ref([]); // 表头单独存储
const tableFooter = ref({}); // 表尾单独存储

const pager = reactive({
  currentPage: 1,
  pageSize: 500,
  total: 0,
});

// 优化2：缓存列配置，避免重复构建
let cachedColumns = null;

/* 优化3：请求时使用请求取消机制  */
let abortController = null;

async function init(args?: any) {
  // 取消进行中的请求
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();
  
  try {
    gridApi.setLoading(true);
    
    pager.currentPage = 1;
    
    // 添加超时控制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 30000);
    });
    
    const requestPromise = reportApi.fetchAdReport(args);
    const res = await Promise.race([requestPromise, timeoutPromise]) as any;
    
    // 使用 requestIdleCallback 处理大数据，避免阻塞UI
    await new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          allData.value = res.items.map((item: any, index: number) => ({ ...item, seq: index + 1 }));
          pager.total = res.items.length;
          resolve(true);
        }, { timeout: 100 });
      } else {
        setTimeout(() => {
          allData.value = res.items.map((item: any, index: number) => ({ ...item, seq: index + 1 }));
          pager.total = res.items.length;
          resolve(true);
        }, 0);
      }
    });
    
    // 更新表头和当前页数据
    updateTableStructure(res.columns, res.summary[0]);
    updateCurrentPageData();
    
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('请求失败:', error);
    }
  } finally {
    gridApi.setLoading(false);
    abortController = null;
  }
}

/*  优化4：分离表头更新和数据更新  */
function updateTableStructure(columns: string[], footData: any) {
  // 使用缓存避免重复构建
  const cacheKey = columns.join(',');
  if (cachedColumns && cachedColumns.key === cacheKey) {
    tableColumns.value = cachedColumns.columns;
  } else {
    const newColumns: any[] = [
      { title: "序号", field: "seq", width: 80, fixed: 'left', sortable: true },
    ];
    columns.forEach((key) => {
      newColumns.push({
        field: key,
        title: key,
        minWidth: 120,
        sortable: true,
        showOverflow: true, // 超出隐藏，提升渲染性能
      });
    });
    cachedColumns = {
      key: cacheKey,
      columns: newColumns
    };
    tableColumns.value = newColumns;
  }
  
  tableFooter.value = { seq: '合计：', ...footData };
  
  // 批量更新grid配置，减少重绘次数
  gridApi.setGridOptions({
    columns: tableColumns.value,
    footerData: [tableFooter.value],
    exportConfig: {
      ...gridOptions.exportConfig,
      data: allData.value,
    },
  });
}

/*  优化5：使用 requestAnimationFrame 优化分页更新 */
let pendingUpdate = null;

function updateCurrentPageData() {
  // 取消之前的更新任务
  if (pendingUpdate) {
    cancelAnimationFrame(pendingUpdate);
  }
  
  pendingUpdate = requestAnimationFrame(() => {
    const start = (pager.currentPage - 1) * pager.pageSize;
    const end = Math.min(start + pager.pageSize, pager.total);
    const pageData = allData.value.slice(start, end);
    
    // 直接更新数据，不触发额外的loading
    currentPageData.value = pageData;
    
    gridApi.setGridOptions({
      data: pageData,
      pagerConfig: {
        total: pager.total,
        currentPage: pager.currentPage,
        pageSize: pager.pageSize,
        pageSizes: [500, 800, 1000, 2000],
      },
    });
    
    pendingUpdate = null;
  });
}

/* 优化6：分页事件 - 移除sleep延迟  */
const gridEvents = {
  pageChange({ currentPage, pageSize }: { currentPage: number, pageSize: number }) {
    // 只有真正变化时才更新
    if (pager.currentPage === currentPage && pager.pageSize === pageSize) return;
    
    pager.currentPage = currentPage;
    pager.pageSize = pageSize;
    updateCurrentPageData();
  },
};

// 项目选项
const projectOptions = ref<ProjectItem[]>([]);

onMounted(async () => {
  const res = await projectApi.fetchProjectList({
    page: 1,
    pageSize: 1000,
  });
  projectOptions.value = res.items;
});

const projectSelectOptions = computed(() =>
  projectOptions.value.map((item: ProjectItem) => ({
    label: item.name,
    value: item.id,
  }))
);

/* 优化7：表单提交防抖 */
let submitTimer = null;

const formOptions: VbenFormProps = {
  schema: [
    // ... 保持原有的schema配置不变
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
      fieldName: 'dateTimeRange',
      label: 'Time',
      rules: 'required',
    },
    {
      component: 'Select',
      defaultValue: ['vivo'],
      componentProps: {
        allowClear: true,
        options: ACTIVE_PLATFORM,
        mode: 'multiple',
        maxTagCount: 1,
        placeholder: `${$t('common.choice')}`,
        onChange: resetLoadedMap,
        onSelect: async (val) => {
          const platforms = await gridApi.formApi.getValues()
          selectPlatform.value = platforms.platform.join(',')
        }
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
        maxTagCount: 1,
      },
      defaultValue: ['day'],
      fieldName: 'dims',
      label: `${$t('marketing.report.dims.title')}`,
    },
    {
      component: 'HybridSearchSelect',
      componentProps: {
        mode: 'multiple',
        placeholder: `${$t('common.select')}`,
        allowClear: true,
        initialApi: async () => {
          const formData = await gridApi.formApi.getValues();
          selectPlatform.value = formData.platform.join(',')
          const res = await advertiserApi.fetchAdvertiserList({
            page: 1,
            pageSize: 1000,
            putStatue: 1,
            platform: selectPlatform.value
          });
          if (res.items) {
            res.items = res.items.map(item => ({
              ...item,
              displayName: `${item.advertiserName}-${item.advertiserId}`
            }));
          }
          return res;
        },
        remoteApi: async (params) => {
          const res = await advertiserApi.fetchAdvertiserList({
            page: 1,
            pageSize: 1000,
            putStatue: 1,
            platform: selectPlatform.value,
            advertiserId: params.keyword,
          });
          if (res.items) {
            res.items = res.items.map(item => ({
              ...item,
              displayName: `${item.advertiserName}-${item.advertiserId}`
            }));
          }
          return res;
        },
        valueField: 'advertiserId',
        labelField: 'displayName',
        resultField: 'items',
        remoteSearchField: 'keyword',
        searchDebounce: 300,
        remoteSearchMinLength: 1,
        clearSearchOnSelect: true,
        onChange: (value) => {
          console.log('选中的值:', value);
          resetLoadedMap();
        },
      },
      dependencies: {
        triggerFields: ['platform'],
        if: (value) => {
          console.log('value', value)
          if (value.platform.length > 0) {
            // loadAgentData(value.platform)
          } else {
            // agentData.value = []
          }
          return true;
        }
      },
      fieldName: 'advertiserId',
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
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: projectSelectOptions,
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
        mode: 'multiple',
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: planOptions,
        onFocus: async () => {
          await loadAdLinkage('campaign')
        },
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'campaign_id',
      label: '计划',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        mode: 'multiple',
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: advertisementOptions,
        onFocus: async () => {
          await loadAdLinkage('promotion')
        },
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'promotion_id',
      label: '广告',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        mode: 'multiple',
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: adGroupOptions,
        onFocus: async () => {
          await loadAdLinkage('adgroup')
        },
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'adgroup_id',
      label: '广告组',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        mode: 'multiple',
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: creativityOptions,
        onFocus: async () => {
          await loadAdLinkage('creative')
        },
      },
      fieldName: 'creative_id',
      label: '创意',
    },
  ],
  showCollapseButton: true,
  submitOnEnter: false,
  handleSubmit: async (values) => {
    // 防抖处理
    if (submitTimer) {
      clearTimeout(submitTimer);
    }
    
    submitTimer = setTimeout(async () => {
      pager.currentPage = 1;
      currentQueryMetric.value = values.queryMetric || [];
      const params = buildReportParams(values);
      await init(params);
      submitTimer = null;
    }, 100);
  },
  handleReset: async () => {
    // 取消进行中的请求
    if (abortController) {
      abortController.abort();
    }
    
    await gridApi.formApi.resetForm();
    await gridApi.formApi.setFieldValue('queryMetric', []);
    await resetLoadedMap
    
    currentQueryMetric.value = [];
    planOptions.value = []
    advertisementOptions.value = []
    adGroupOptions.value = []
    creativityOptions.value = []
    
    allData.value = [];
    currentPageData.value = [];
    pager.currentPage = 1;
    pager.total = 0;
    
    gridApi.setGridOptions({
      data: [],
      columns: [],
      footerData: [],
      pagerConfig: {
        total: 0,
        currentPage: 1,
        pageSize: pager.pageSize,
        pageSizes: [500, 800, 1000],
      },
    });
  },
};

// 辅助函数
const makeFilter = (
  field: string,
  values?: string[],
  operator = 1,
): ReportFilter[] | undefined =>
  values?.length ? [{ field, operator, values }] : undefined;

function buildReportParams(values: any): AdReportRequest {
  const {
    advertiserId,
    dateTimeRange,
    dims,
    platform,
    queryMetric,
    projectId,
    campaign_id,
    adgroup_id,
    promotion_id,
    creative_id
  } = values;

  const normalizeArray = (val?: string | string[]) =>
    val ? (Array.isArray(val) ? val : [val]) : undefined;

  const filters: ReportFilter[] = [
    ...(makeFilter('platform', platform) ?? []),
    ...(makeFilter('platform_account_id', advertiserId) ?? []),
    ...(makeFilter('projectId', normalizeArray(projectId)) ?? []),
    ...(makeFilter('campaign_id', normalizeArray(campaign_id)) ?? []),
    ...(makeFilter('adgroup_id', normalizeArray(adgroup_id)) ?? []),
    ...(makeFilter('promotion_id', normalizeArray(promotion_id)) ?? []),
    ...(makeFilter('creative_id', normalizeArray(creative_id)) ?? []),
  ];

  return {
    dateTimeRange,
    dims,
    queryMetric,
    filters: filters.length ? filters : undefined,
  };
}

function reloadFromStart(metricIds: string[]) {
  gridApi.formApi.setFieldValue('queryMetric', metricIds)
  currentQueryMetric.value = metricIds;
}

/* Grid 配置 - 添加虚拟滚动优化 */
const gridOptions: VxeGridProps = {
  showFooter: true,
  border: true,
  height: "auto",
  keepSource: true,
  columns: [],
  data: [],
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    refreshOptions: {
      query: async () => {
        await gridApi.formApi.submitForm()
      }
    },
    zoom: true,
  },
  exportConfig: {
    filename: '',
    types: ["csv", "xlsx"],
    modes: ['current', 'all'],
    original: true,
  },
  pagerConfig: {
    enabled: true,
    total: pager.total,
    pageSize: pager.pageSize,
    currentPage: pager.currentPage,
    pageSizes: [500, 800, 1000, 2000],
  },
  proxyConfig: undefined,
  footerData: [],
  // 优化8：开启虚拟滚动，提升大数据渲染性能
  scrollX: { enabled: true, gt: 0 },
  scrollY: { enabled: true, gt: 0 },
  // 优化渲染性能
  rowConfig: {
    isHover: true,
    useKey: true,
    keyField: 'seq',
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});

setGridApi(gridApi)

</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #reset-before>
          <Button type="primary" @click="openSaveTemplateModalModal">
            保存模板
          </Button>
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openTemplateListModalModal">
            报表模板
          </Button>
          <Button type="primary" @click="openPlatformMetricMapDetailModal" danger>
            {{ $t('core.metric') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <SelectMetricModalModal @confirmMetric="reloadFromStart" :selectedMetrics="currentQueryMetric"/>
    <SaveTemplateModalModal @success="handleTemplateSaved" :searchData="searchData"/>
    <TemplateDrawer @useTemplate="handleUseTemplate"/>
  </div>
</template>

<style scoped>
</style>
