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
import AdReportFilterForm from '../components/AdReportFilterForm.vue';

// 表单 ref
const filterFormRef = ref();
const selectPlatform = ref<string>(null)


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
        width: 'auto',
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

// 表单提交处理
async function handleFormSubmit(values: any) {
  pager.currentPage = 1;
  currentQueryMetric.value = values.queryMetric || [];
  const params = buildReportParams(values);
  await init(params);
}

async function handleFormReset() {
  if (abortController) {
    abortController.abort();
  }
  
  currentQueryMetric.value = [];
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
}

async function handleUseTemplate(template: searchDataFilter) {
  if (pendingRequest) {
    pendingRequest = null;
  }
  
  // 使用表单实例设置值
  await filterFormRef.value?.setValues(template);
  
  currentQueryMetric.value = template.queryMetric ? [...template.queryMetric] : [];
  
  const values = await filterFormRef.value?.getValues();
  const params = buildReportParams(values);
  await init(params);
}

function reloadFromStart(metricIds: string[]) {
  filterFormRef.value?.setFieldValue('queryMetric', metricIds);
  currentQueryMetric.value = metricIds;
}

async function openSaveTemplateModalModal() {
  searchData.value = await filterFormRef.value?.getValues();
  sveTemplateModalApi.open();
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
        await filterFormRef.value?.submitForm();
      }
    },
    zoom: true,
  },
  exportConfig: {
    filename: '',
    types: ["csv", "xlsx"],
    modes: ['all'],
    original: true,
  },
  pagerConfig: {
    enabled: true,
    total: pager.total,
    pageSize: pager.pageSize,
    currentPage: pager.currentPage,
    pageSizes: [500, 800, 1000, 2000],
  },
  proxyConfig: {
    enabled: false, // 确保关闭代理配置，使用手动控制
  },
  footerData: [],
  // 优化8：开启虚拟滚动，提升大数据渲染性能
  scrollX: { enabled: true, gt: 0 },
  scrollY: { enabled: true, gt: 0 },
  // 优化渲染性能
  rowConfig: {
    isHover: false,
    useKey: true,
    keyField: 'seq',
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  gridEvents,
});
// 在 onMounted 中初始化数据
onMounted(async () => {
  const res = await projectApi.fetchProjectList({
    page: 1,
    pageSize: 1000,
  });
  projectOptions.value = res.items;
  
  // 初始化时自动提交一次表单
  // setTimeout(() => {
  //   filterFormRef.value?.submitForm();
  // }, 100);
  handleFormReset()
});
const wrapperClass = ref('grid-cols-1 md:grid-cols-2 lg:grid-cols-3')
const content = ref('搜索')
const isShowActions = ref(true)
</script>

<template>
  <div>
    <Page auto-content-height>
      <div class="search-content">
        <AdReportFilterForm 
          ref="filterFormRef"
          :wrapperClass="wrapperClass"
          :isShowActions="isShowActions"
          :content="content"
          @submit="handleFormSubmit"
          @reset="handleFormReset"
        />
      </div>

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

<style scoped lang="scss">
.search-content {
  background: #fff;
  border-radius: 8px 8px 0 0;
  margin-bottom: 10px;
  padding: 20px 10px 0 0;
}

</style>
