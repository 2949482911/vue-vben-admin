<script lang="ts" setup>
import type { ReportFilter } from '#/api/models';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Drawer as ADrawer, Button, Descriptions, message, Space, Typography } from 'ant-design-vue';

// bytedance 试点：单层级(项目/广告)广告列表
// 列由后端「媒体原生列表」返回的 columns + cname 动态生成，支持筛选/分页/导出/详情/批量操作
// 批量操作复用 promotion_manager/components 的 BatchOperationDropdown / BatchOperationDrawer
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { advertiserApi, aManagementApi } from '#/api';

import BatchOperationDrawer from '../../../promotion_manager/components/BatchOperationDrawer.vue';
import BatchOperationDropdown from '../../../promotion_manager/components/BatchOperationDropdown.vue';
import { getBatchOperations, type BatchOperationType } from '../../../promotion_manager/platformOptions';
const props = defineProps<{
  /** campaign=项目, adgroup=广告 */
  level: 'adgroup' | 'campaign';
}>();

// 该层级默认的 ID / 名称字段名（媒体原生列名）
const idField = computed(() => (props.level === 'campaign' ? 'campaign_id' : 'adgroup_id'));
const nameField = computed(() => (props.level === 'campaign' ? 'campaign_name' : 'adgroup_name'));
const levelLabel = computed(() => (props.level === 'campaign' ? '项目' : '广告'));

/** 统一报表指标列（与后端 PromotionReportMetric 对齐）：右对齐 + 等宽数字 */
const METRIC_FIELDS = ['AdCost', 'AdShow', 'AdClick', 'AdEcpM', 'AdCtr'];

/** 指标值格式化：保留原始小数位并加千分位，空值显示占位符 */
function formatMetricValue(value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const decimals = String(value).split('.')[1]?.length ?? 0;
  return num.toLocaleString('zh-CN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

// ============ 选区 ============
/** 当前选中行（用于工具栏选区态展示） */
const selectedRows = ref<any[]>([]);
/** 当前筛选命中总条数 */
const totalCount = ref(0);

function clearSelection() {
  gridApi.grid?.clearCheckboxRow();
  selectedRows.value = [];
}

// ============ 批量操作（复用广告管理组件） ============
const [BatchDrawer, batchDrawerApi] = useVbenDrawer({
  connectedComponent: BatchOperationDrawer,
});

/** 该层级可用的批量操作（按支持矩阵区分媒体） */
const levelOperationKeys = computed(() => getBatchOperations('bytedance', props.level));

function openBatchOperation(operationType: BatchOperationType) {
  const rows = (gridApi.grid?.getCheckboxRecords() ?? []) as any[];
  if (rows.length === 0) {
    message.warning('请先勾选需要操作的数据');
    return;
  }
  batchDrawerApi.setData({ operationType, rows, level: props.level });
  batchDrawerApi.open();
}

function onBatchPageReload() {
  gridApi.reload();
}

// ============ 详情抽屉 ============
const detailOpen = ref(false);
const detailLoading = ref(false);
const detailData = ref<Record<string, any>>({});
const detailTitle = computed(() => (props.level === 'campaign' ? '项目详情' : '广告详情'));

async function openDetail(row: Record<string, any>) {
  const targetId = row[idField.value];
  if (!targetId) return;
  detailOpen.value = true;
  detailLoading.value = true;
  try {
    const res = await aManagementApi.fetchAdManagementDetail({
      targetId: String(targetId),
      platform: 'bytedance',
      level: props.level,
    });
    detailData.value = res ?? {};
  } finally {
    detailLoading.value = false;
  }
}

// ============ 筛选表单 ============
const isCampaign = computed(() => props.level === 'campaign');

const formOptions = {
  schema: [
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: '请选择账户',
        mode: 'multiple',
        api: async (params: any) => {
          return await advertiserApi.fetchAdvertiserList({
            page: 1,
            pageSize: 10000,
            putStatue: 1,
            platform: 'bytedance',
            advertiserRole: [],
            ...params,
          });
        },
        valueField: 'advertiserId',
        labelField: 'advertiserName',
        resultField: 'items',
      },
      fieldName: 'platform_account_id',
      label: '账户名称',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '请输入项目ID' },
      fieldName: 'campaignId',
      label: '项目ID',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '请输入项目名称' },
      fieldName: 'campaignName',
      label: '项目名称',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '请输入广告ID' },
      fieldName: 'adgroupId',
      label: '广告ID',
      dependencies: {
        if: () => !isCampaign.value,
        triggerFields: ['*'],
      },
    },
    {
      component: 'Input',
      componentProps: { placeholder: '请输入广告名称' },
      fieldName: 'adgroupName',
      label: '广告名称',
      dependencies: {
        if: () => !isCampaign.value,
        triggerFields: ['*'],
      },
    },
  ],
  showDefaultActions: true,
  showCollapseButton: true,
  submitOnEnter: true,
  compact: true,
  collapsed: true,
};

const gridOptions: VxeGridProps = {
  border: true,
  height: 'auto',
  checkboxConfig: { highlight: true },
  columns: [],
  data: [],
  keepSource: true,
  pagerConfig: { enabled: true, pageSizes: [20, 50, 100, 200] },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const { items, total, columns: cols, cname } = await doQuery(page, args);
        totalCount.value = total ?? 0;
        // 媒体原生行无统一字段，此处补 platform/advertiserId 等冗余字段，供批量/详情复用
        const enriched = (items ?? []).map((row: any) => ({
          ...row,
          platform: 'bytedance',
          advertiserId: row.advertiserId || row.platform_account_id,
          campaignId: row.campaign_id,
          campaignName: row.campaign_name,
          promotionId: row.adgroup_id,
          promotionName: row.adgroup_name,
        }));
        buildColumns(cols, cname);
        return { items: enriched, total };
      },
    },
  },
};

const gridEvents = {
  checkboxChange: ({ records }: { records: any[] }) => {
    selectedRows.value = records;
  },
  // 全选事件
  checkboxAll: ({ records }: { records: any[] }) => {
    selectedRows.value = records;
  },
  // 翻页/重新查询后清空选中，避免跨页残留
  proxyQuery: () => {
    selectedRows.value = [];
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

/**
 * 名称列前置并冻结，其余维度/指标列保持后端顺序横向滚动
 * vxe 要求冻结列从最左侧连续排列，因此把名称列提到动态列首位
 */
function buildColumns(cols: string[] | undefined, cname: Record<string, string> | undefined) {
  if (!cols || cols.length === 0) return;
  const nameKey = nameField.value;
  const ordered = cols.includes(nameKey)
    ? [nameKey, ...cols.filter((key) => key !== nameKey)]
    : cols;
  const dynamic = ordered.map((key) => {
    const isMetric = METRIC_FIELDS.includes(key);
    const isName = key === nameKey;
    // 后端 cname 可能带多行枚举说明，表头只取第一行，完整说明放 tooltip
    const rawTitle = (cname && cname[key]) || key;
    const titleLines = String(rawTitle).split('\n');
    const column: Record<string, any> = {
      field: key,
      title: titleLines[0],
      minWidth: isName ? 220 : isMetric ? 120 : 160,
      align: isMetric ? 'right' : 'left',
      headerAlign: isMetric ? 'right' : 'left',
      showOverflow: true,
    };
    if (titleLines.length > 1) {
      column.titlePrefix = { content: rawTitle };
    }
    if (isMetric) {
      column.formatter = ({ cellValue }: any) => formatMetricValue(cellValue);
    }
    if (isName) {
      column.fixed = 'left';
    }
    return column;
  });
  const newColumns: any[] = [
    { title: '', type: 'checkbox', width: 50, fixed: 'left' },
    { title: '序号', type: 'seq', width: 60, fixed: 'left' },
    ...dynamic,
    { title: '操作', field: 'options', fixed: 'right', width: 90, slots: { default: 'action' } },
  ];
  gridApi.setGridOptions({ columns: newColumns });
}

// 与后端白名单一致：c=等值(1) / l=模糊(3)
function buildFilters(values: Record<string, any>): ReportFilter[] {
  const filters: ReportFilter[] = [{ field: 'platform', operator: 1, values: ['bytedance'] }];
  const eq = ['platform_account_id', 'campaignId', 'adgroupId'];
  const like = ['campaignName', 'adgroupName'];
  eq.forEach((f) => {
    const v = values[f];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      filters.push({
        field: f,
        operator: 1,
        values: (Array.isArray(v) ? v : [v]).map((x) => String(x).trim()),
      });
    }
  });
  like.forEach((f) => {
    const v = values[f];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      filters.push({ field: f, operator: 3, values: [String(v).trim()] });
    }
  });
  return filters;
}

async function doQuery(page: { currentPage: number; pageSize: number }, args: any) {
  const values = args ?? {};
  const res: any = await aManagementApi.fetchAdManagementList({
    page: page.currentPage,
    pageSize: page.pageSize,
    level: props.level,
    filters: buildFilters(values),
  });
  return {
    items: res?.items ?? [],
    total: res?.total ?? 0,
    columns: res?.columns ?? [],
    cname: res?.cname ?? {},
  };
}

// 导出（媒体固定单平台，按当前筛选条件全量导出）
async function handleExport() {
  const values = await gridApi.formApi?.getValues();
  await aManagementApi.fetchAdExport({
    level: props.level,
    filters: buildFilters(values ?? {}),
  });
  await message.success('导出任务已提交！请前往「下载中心」查看并下载文件。');
}

function pageReload() {
  gridApi.reload();
}

defineExpose({ pageReload });
</script>

<template>
  <div class="h-full">
    <Grid>
      <!-- 左侧：勾选后切换为批量操作条，未勾选时展示轻量统计 -->
      <template #toolbar-actions>
        <div v-if="selectedRows.length > 0" class="flex items-center gap-2">
          <Typography.Text>
            已选 <span class="font-medium tabular-nums">{{ selectedRows.length }}</span> 项
          </Typography.Text>
          <BatchOperationDropdown
            :level="level"
            :operation-keys="levelOperationKeys"
            @open="openBatchOperation"
          />
          <Button type="link" size="small" @click="clearSelection">取消选择</Button>
        </div>
        <div v-else class="flex items-center gap-1">
          <Typography.Text type="secondary">
            命中 <span class="tabular-nums">{{ totalCount }}</span> 条
          </Typography.Text>
          <Typography.Text type="secondary">·</Typography.Text>
          <Typography.Text type="secondary">{{ levelLabel }}层级</Typography.Text>
        </div>
      </template>

      <template #toolbar-tools>
        <Space>
          <Button @click="handleExport">导出</Button>
        </Space>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openDetail(row)">详情</Button>
      </template>
    </Grid>

    <BatchDrawer @page-reload="onBatchPageReload" />

    <!-- 详情抽屉 -->
    <ADrawer
      v-model:open="detailOpen"
      :title="detailTitle"
      :loading="detailLoading"
    >
      <Descriptions :column="1" size="small" bordered>
        <Descriptions.Item v-for="(val, key) in detailData" :key="key" :label="String(key)">
          {{ val }}
        </Descriptions.Item>
      </Descriptions>
    </ADrawer>
  </div>
</template>
