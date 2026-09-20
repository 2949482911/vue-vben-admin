<script lang="ts" setup>
// 通用「媒体广告列表」层级组件（按巨量试点模式）
// - 列由后端「媒体原生列表」返回 columns + cname 动态生成
// - 批量操作复用 promotion_manager/components 的 BatchOperationDropdown / BatchOperationDrawer
import type { ReportFilter } from '#/api/models';
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Drawer as ADrawer, Button, Descriptions, message, Space, Typography } from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { advertiserApi, aManagementApi } from '#/api';

import BatchOperationDrawer from '../../promotion_manager/components/BatchOperationDrawer.vue';
import BatchOperationDropdown from '../../promotion_manager/components/BatchOperationDropdown.vue';
import type { BatchOperationType } from '../../promotion_manager/platformOptions';

const props = withDefaults(
  defineProps<{
    /** 媒体标识(如 vivo/oppo/bytedance_std) */
    platform: string;
    /** 查询层级: campaign/adgroup/promotion */
    level: 'adgroup' | 'campaign' | 'promotion';
    /** 该层级的 ID 列(媒体原生列名)，如 campaign_id/adgroup_id/promotion_id */
    idField: string;
    /** 该层级可用的批量操作；为空则不展示批量入口 */
    operationKeys?: BatchOperationType[];
    /** 账户下拉使用的媒体标识；默认同 platform（部分新版媒体复用旧媒体账户） */
    advertiserPlatform?: string;
    /** 枚举字典（字段 -> { 码值: 文案 }），命中时单元格展示文案 */
    enums?: Record<string, Record<string, string>>;
  }>(),
  { operationKeys: () => [], advertiserPlatform: '', enums: () => ({}) },
);

/** 各层级名称列候选字段：各媒体命名不统一（蛇形 campaign_name / 驼峰 campaignName） */
const NAME_FIELD_CANDIDATES: Record<string, string[]> = {
  campaign: ['campaignName', 'campaign_name'],
  adgroup: ['adgroupName', 'adgroup_name'],
  promotion: ['promotionName', 'promotion_name'],
};

const levelShownFields: Record<string, string[]> = {
  campaign: ['platform_account_id', 'campaignId', 'campaignName'],
  adgroup: ['platform_account_id', 'campaignId', 'campaignName', 'adgroupId', 'adgroupName'],
  promotion: [
    'platform_account_id',
    'campaignId',
    'campaignName',
    'adgroupId',
    'adgroupName',
    'promotionId',
    'promotionName',
  ],
};

const levelLabel = computed(() => {
  return { adgroup: '广告组', campaign: '计划', promotion: '广告' }[props.level] ?? props.level;
});

/** 蛇形转驼峰：兼容媒体原生列名的两种命名 */
function toCamelCase(field: string) {
  return field.replaceAll(/_(\w)/g, (_match, char: string) => char.toUpperCase());
}

/** ID 字段候选（传入的 idField + 其驼峰形式），各媒体列名不统一时按序兜底 */
const idFieldCandidates = computed(() => [props.idField, toCamelCase(props.idField)]);

function resolveId(row: Record<string, any>) {
  return idFieldCandidates.value.map((field) => row[field]).find((value) => !!value);
}

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

/** 枚举值格式化：命中字典展示中文文案，未命中回退原始码值 */
function formatEnumValue(map: Record<string, string>, value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  return map[String(value)] ?? String(value);
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

async function openDetail(row: Record<string, any>) {
  const targetId = resolveId(row);
  if (!targetId) return;
  detailOpen.value = true;
  detailLoading.value = true;
  try {
    const res = await aManagementApi.fetchAdManagementDetail({
      targetId: String(targetId),
      platform: props.platform,
      level: props.level,
    });
    detailData.value = res ?? {};
  } finally {
    detailLoading.value = false;
  }
}

// ============ 筛选表单 ============
const levelFields = levelShownFields[props.level] ?? [];
const schema = levelFields.map((field) => {
  if (field === 'platform_account_id') {
    return {
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
            platform: props.advertiserPlatform || props.platform,
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
    };
  }
  const LABEL_MAP: Record<string, string> = {
    campaignId: '项目/计划ID',
    campaignName: '项目/计划名称',
    adgroupId: '广告组ID',
    adgroupName: '广告组名称',
    promotionId: '广告ID',
    promotionName: '广告名称',
  };
  const label = LABEL_MAP[field] ?? field;
  return {
    component: 'Input',
    componentProps: { placeholder: `请输入${label}` },
    fieldName: field,
    label,
  };
});

const formOptions = {
  schema,
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
        const enriched = (items ?? []).map((row: any) => ({
          ...row,
          platform: props.platform,
          advertiserId: row.advertiserId || row.platform_account_id,
          campaignId: row.campaignId || row.campaign_id,
          campaignName: row.campaignName || row.campaign_name,
          adgroupId: row.adgroupId || row.adgroup_id,
          adgroupName: row.adgroupName || row.adgroup_name,
          promotionId: row.promotionId || row.promotion_id,
          promotionName: row.promotionName || row.promotion_name,
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
  const nameKey = NAME_FIELD_CANDIDATES[props.level]?.find((key) => cols.includes(key));
  const ordered =
    nameKey && cols.includes(nameKey)
      ? [nameKey, ...cols.filter((key) => key !== nameKey)]
      : cols;
  const dynamic = ordered.map((key) => {
    const isMetric = METRIC_FIELDS.includes(key);
    const isName = key === nameKey;
    const enumMap = props.enums[key];
    // 后端 cname 可能带多行枚举说明（如「推广模式\n0:常规投放\n1:商品智投」），表头只取第一行，完整说明放 tooltip
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
    if (enumMap) {
      column.formatter = ({ cellValue }: any) => formatEnumValue(enumMap, cellValue);
    } else if (isMetric) {
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

// 与后端各层级白名单一致：c=等值(1) / l=模糊(3)
function buildFilters(values: Record<string, any>): ReportFilter[] {
  const filters: ReportFilter[] = [
    { field: 'platform', operator: 1, values: [props.platform] },
  ];
  const eq = ['platform_account_id', 'campaignId', 'adgroupId', 'promotionId'];
  const like = ['campaignName', 'adgroupName', 'promotionName'];
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

// 导出（单媒体导出，按当前筛选条件全量导出）
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
    <Grid >
     <!-- 左侧：勾选后切换为批量操作条，未勾选时展示轻量统计 -->
     <template #toolbar-actions>
       <div v-if="selectedRows.length > 0" class="flex items-center gap-2">
         <Typography.Text>
           已选 <span class="font-medium tabular-nums">{{ selectedRows.length }}</span> 项
         </Typography.Text>
         <BatchOperationDropdown
           v-if="operationKeys && operationKeys.length > 0"
           :level="level"
           :operation-keys="operationKeys"
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

   <ADrawer
     v-model:open="detailOpen"
     :loading="detailLoading"
     width="560"
     title="详情"
   >
     <Descriptions :column="1" size="small" bordered>
       <Descriptions.Item v-for="(val, key) in detailData" :key="key" :label="String(key)">
         {{ val }}
       </Descriptions.Item>
     </Descriptions>
   </ADrawer>
 </div>
</template>
