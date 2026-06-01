<script setup lang="ts" name="AdReportDataManager">
import { ref, reactive, computed, onMounted } from 'vue';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { Button } from 'ant-design-vue';
import SelectMetricModal from './selectmetric.vue';
import type { AdReportRequest, ReportFilter, searchDataFilter, TemplateDto } from '#/api/models';
import { reportApi, projectApi } from '#/api';
import type { ProjectItem } from '../../account/advertiser/advertiser';
import SaveTemplateModal from './saveTemplate.vue';
import TemplateListDrawer from './templateList.vue';
import AdReportFilterForm from '../components/AdReportFilterForm.vue';
import { usePreferences } from '@vben/preferences';
const { isDark } = usePreferences();
const isLight = computed(() => {
  return !isDark.value;
});
const tmplateData = ref();
// 表单 ref
const filterFormRef = ref();

/* ---------------- 模板抽屉 ---------------- */
const [TemplateDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: TemplateListDrawer,
});

function openTemplateListModalModal() {
  drawerApi.open();
}

const currentQueryMetric = ref<string[]>([]);
const currentDecimalPoint = ref<number>(4);
const activeColumnOrder = ref<string[] | undefined>(undefined);

// 防抖标记，避免重复请求
let pendingRequest: any = null;

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
  decimalPoint: 4,
  dateTimeRange: ['', ''],
  campaign_id: [],
  adgroup_id: [],
  promotion_id: [],
  creative_id: [],
});

const [SaveTemplateModalModal, sveTemplateModalApi] = useVbenModal({
  connectedComponent: SaveTemplateModal,
});

async function handleTemplateSaved() {
  await gridApi.formApi.resetForm();
}

/* 优化1：使用浅响应式数据，减少深度监听 */
const allData = ref<any>([]); // 全部数据
const allDataOrigin = ref<any>([]); // 原始数据备份（用于取消排序时恢复）
const currentPageData = ref([]); // 当前页数据，独立存储避免全量更新
const tableColumns = ref([]); // 表头单独存储
const tableFooter = ref({}); // 表尾单独存储

const pager = reactive({
  currentPage: 1,
  pageSize: 500,
  total: 0,
});

// 优化2：缓存列配置，避免重复构建
let cachedColumns: any = null;

/* 优化3：请求时使用请求取消机制  */
let abortController: any = null;

async function init(args?: any, columnOrder?: string[]) {
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
    const res = (await Promise.race([requestPromise, timeoutPromise])) as any;

    // 使用 requestIdleCallback 处理大数据，避免阻塞UI
    await new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            const items = res.items.map((item: any, index: number) => ({
              ...item,
              seq: index + 1,
            }));
            allData.value = items;
            allDataOrigin.value = [...items]; // 备份原始数据
            pager.total = items.length;
            resolve(true);
          },
          { timeout: 100 },
        );
      } else {
        setTimeout(() => {
          const items = res.items.map((item: any, index: number) => ({ ...item, seq: index + 1 }));
          allData.value = items;
          allDataOrigin.value = [...items];
          pager.total = items.length;
          resolve(true);
        }, 0);
      }
    });

    // 更新表头和当前页数据（如有保存的列顺序则按顺序渲染）
    updateTableStructure(res.columns, res.summary[0], columnOrder);
    updateCurrentPageData();
    // 更新导出数据源
    updateExportData();
    // 重置排序状态
    await resetSortState();
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('请求失败:', error);
    }
  } finally {
    gridApi.setLoading(false);
    abortController = null;
  }
}

// 重置排序状态
async function resetSortState() {
  gridApi.grid?.clearSort();
  // 仅通过 setGridOptions 清除 sortConfig 状态
  await gridApi.setGridOptions({
    sortConfig: {
      remote: true,
    },
  });
}

/*  优化4：分离表头更新和数据更新  */
function updateTableStructure(columns: string[], footData: any, columnOrder?: string[]) {
  // 使用缓存避免重复构建（有自定义顺序时跳过缓存）
  const cacheKey = columns.join(',');
  if (!columnOrder && cachedColumns && cachedColumns.key === cacheKey) {
    tableColumns.value = cachedColumns.columns;
  } else {
    // 先按接口返回的 columns 建立基础列定义 Map
    const columnDefMap = new Map<string, any>();
    columns.forEach((key) => {
      columnDefMap.set(key, {
        field: key,
        title: key,
        width: 'auto',
        sortable: true,
        showOverflow: true,
      });
    });

    // 如果有保存的列顺序，按顺序重排，剩余列追加到末尾
    let orderedKeys: string[];
    if (columnOrder && columnOrder.length > 0) {
      const orderSet = new Set(columnOrder);
      const remaining = columns.filter((k) => !orderSet.has(k));
      orderedKeys = [...columnOrder.filter((k) => columnDefMap.has(k)), ...remaining];
    } else {
      orderedKeys = columns;
    }

    const newColumns: any[] = [
      { title: '序号', field: 'seq', width: 80, fixed: 'left', sortable: true },
      ...orderedKeys.map((key) => columnDefMap.get(key)!),
    ];

    if (!columnOrder) {
      cachedColumns = { key: cacheKey, columns: newColumns };
    }
    tableColumns.value = newColumns as any;
  }

  tableFooter.value = { seq: '合计：', ...footData };

  // 批量更新grid配置，减少重绘次数
  gridApi.setGridOptions({
    columns: tableColumns.value,
    footerData: [tableFooter.value],
  });
}

/*  优化5：使用 requestAnimationFrame 优化分页更新 */
let pendingUpdate: any = null;

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
  pageChange({ currentPage, pageSize }: { currentPage: number; pageSize: number }) {
    if (pager.currentPage === currentPage && pager.pageSize === pageSize) return;
    pager.currentPage = currentPage;
    pager.pageSize = pageSize;
    updateCurrentPageData();
  },

  async sortChange({ column, property, order }: any) {
    console.log(column, 'column');

    if (!property) return;

    gridApi.setLoading(true);

    try {
      if (!order) {
        allData.value = [...allDataOrigin.value];
        gridApi.grid?.clearSort();
      } else {
        const dataToSort = [...allDataOrigin.value];
        const sortedData = sortDataByField(dataToSort, property, order);
        allData.value = sortedData;
        gridApi.grid?.setSort({ field: property, order });
      }

      allData.value.forEach((item: any, idx: any) => {
        item.seq = idx + 1;
      });

      pager.currentPage = 1;
      updateCurrentPageData();

      await gridApi.setGridOptions({
        sortConfig: {
          remote: true,
        },
      });
      // 更新导出数据
      updateExportData();
    } catch (error) {
      console.error('排序失败:', error);
    } finally {
      gridApi.setLoading(false);
    }
  },
};
// 更新导出配置的数据源为当前全量数据（已排序）
function updateExportData() {
  gridApi.setGridOptions({
    exportConfig: {
      ...gridOptions.exportConfig,
      data: allData.value,
    },
  });
}
// 通用排序函数
function sortDataByField(data: any[], field: string, order: 'asc' | 'desc'): any[] {
  return [...data].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // 处理 null/undefined 值
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';

    // 判断是否为数字（包括字符串形式的数字）
    const isNumber = !isNaN(Number(aVal)) && !isNaN(Number(bVal));

    let result = 0;
    if (isNumber) {
      // 数字比较
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      result = aNum - bNum;
    } else {
      // 字符串比较
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      result = aStr.localeCompare(bStr, 'zh-CN');
    }

    return order === 'asc' ? result : -result;
  });
}

// 项目选项
const projectOptions = ref<ProjectItem[]>([]);

onMounted(async () => {
  const res = await projectApi.fetchProjectList({
    page: 1,
    pageSize: 1000,
  });
  projectOptions.value = res.items;
});

/* 优化7：表单提交防抖 */
const decimalPoint = ref<number>();
// 辅助函数
const makeFilter = (field: string, values?: string[], operator = 1): ReportFilter[] | undefined =>
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
    creative_id,
    advertiserTagId,
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
    ...(makeFilter('advertiserTagId', normalizeArray(advertiserTagId)) ?? []),
  ];

  return {
    dateTimeRange,
    dims,
    queryMetric,
    decimalPoint: decimalPoint.value,
    filters: filters.length ? filters : undefined,
  };
}

// 表单提交处理
async function handleFormSubmit(values: any) {
  pager.currentPage = 1;
  currentQueryMetric.value = values.queryMetric || [];
  const params = buildReportParams(values);

  // 复用模板后继续搜索：检测用户是否手动拖拽过列顺序
  let orderToUse: string[] | undefined = undefined;
  const savedOrder = activeColumnOrder.value;
  if (savedOrder && savedOrder.length > 0) {
    const gridCols = gridApi.grid?.getColumns() ?? [];
    const currentOrder = gridCols
      .filter((col: any) => col.field && col.field !== 'seq')
      .map((col: any) => col.field);
    const same =
      currentOrder.length === savedOrder.length &&
      currentOrder.every((k, i) => k === savedOrder[i]);
    if (same) {
      orderToUse = savedOrder;
    }
    // 不同说明用户拖动了列 → 不传 orderToUse → 走默认顺序
  }
  await init(params, orderToUse);
}

async function handleFormReset() {
  btnText.value = '新增模板';
  tmplateData.value = {
    id: '',
    name: '',
    remark: '',
  };
  if (abortController) {
    abortController.abort();
  }

  currentQueryMetric.value = [];
  currentDecimalPoint.value = 4;
  activeColumnOrder.value = undefined;
  allData.value = [];
  allDataOrigin.value = [];
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
  updateExportData();
}
const btnText = ref('新增模板');
async function handleUseTemplate(row: TemplateDto) {
  if (pendingRequest) {
    pendingRequest = null;
  }
  btnText.value = '编辑模板';
  if (row.id) {
    tmplateData.value = {
      id: row.id,
      name: row.name,
      remark: row.remark,
    };
  }
  currentDecimalPoint.value = row.template.decimalPoint;
  decimalPoint.value = row.template.decimalPoint;
  // 使用表单实例设置值
  await filterFormRef.value?.setValues(row.template);

  currentQueryMetric.value = row.template.queryMetric ? [...row.template.queryMetric] : [];

  const values = await filterFormRef.value?.getValues();
  const params = buildReportParams(values);
  // 如果模板保存了列顺序，透传给 init 以便渲染时恢复
  const savedColumnOrder: string[] | undefined = row.template.columnOrder;
  activeColumnOrder.value = savedColumnOrder;
  await init(params, savedColumnOrder);
}

function reloadFromStart(metricIds: string[], newDecimalPoint: number) {
  decimalPoint.value = newDecimalPoint;
  currentDecimalPoint.value = newDecimalPoint;
  filterFormRef.value?.setFieldValue('queryMetric', metricIds);
  console.log('reloadFromStart', decimalPoint.value);
  currentQueryMetric.value = metricIds;
}

async function openSaveTemplateModalModal() {
  searchData.value = await filterFormRef.value?.getValues();
  searchData.value.decimalPoint = decimalPoint.value as number;

  // 读取当前列顺序（排除固定的"序号"列）
  const currentColumns = gridApi.grid?.getColumns() ?? [];
  searchData.value.columnOrder = currentColumns
    .filter((col: any) => col.field && col.field !== 'seq')
    .map((col: any) => col.field);

  console.log('searchData', searchData.value);
  if (tmplateData.value.id) {
    sveTemplateModalApi.setData(tmplateData.value);
  } else {
    sveTemplateModalApi.setData({});
  }
  sveTemplateModalApi.open();
}

/* Grid 配置 - 添加远程排序支持 */
const gridOptions: VxeGridProps = {
  showFooter: true,
  border: true,
  height: '100%',
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
      },
    },
    zoom: true,
  },
  exportConfig: {
    filename: '',
    types: ['csv', 'xlsx'],
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
  // 开启虚拟滚动，提升大数据渲染性能
  scrollX: { enabled: true, gt: 10 },
  scrollY: { enabled: true, gt: 10 },
  // 优化渲染性能
  rowConfig: {
    isHover: false,
    useKey: true,
    keyField: 'seq',
  },
  // 启用远程排序模式（手动控制排序）
  sortConfig: {
    remote: true,
    multiple: false, // 单列排序
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

  handleFormReset();
});

const wrapperClass = ref('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
const content = ref('搜索');
const isShowActions = ref(true);
</script>

<template>
  <div>
    <Page auto-content-height>
      <div class="search-content" :class="{ isLight: isLight }">
        <AdReportFilterForm
          ref="filterFormRef"
          :wrapperClass="wrapperClass"
          :isShowActions="isShowActions"
          :content="content"
          @submit="handleFormSubmit"
          @reset="handleFormReset"
        />
      </div>
      <div style="height: calc(100% - 202px)">
        <Grid>
          <template #toolbar-tools>
            <Button class="mr-2" type="primary" @click="openSaveTemplateModalModal">
              {{ btnText }}
            </Button>
            <Button class="mr-2" type="primary" @click="openTemplateListModalModal">
              报表模板
            </Button>
            <Button type="primary" @click="openPlatformMetricMapDetailModal" danger>
              {{ $t('core.metric') }}
            </Button>
          </template>
        </Grid>
      </div>
    </Page>
    <SelectMetricModalModal
      @confirmMetric="reloadFromStart"
      :selectedMetrics="currentQueryMetric"
      :decimalPoint="currentDecimalPoint"
    />
    <SaveTemplateModalModal @success="handleTemplateSaved" :searchData="searchData" />
    <TemplateDrawer @useTemplate="handleUseTemplate" />
  </div>
</template>

<style scoped lang="scss">
.search-content {
  padding: 20px 10px 0 0;
  margin-bottom: 10px;
  border-radius: 8px 8px 0 0;
}

.isLight {
  background: #fff;
}
</style>
