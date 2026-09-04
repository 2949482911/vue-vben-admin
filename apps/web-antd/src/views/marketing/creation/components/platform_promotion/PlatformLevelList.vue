<script lang="ts" setup>
// 通用「媒体广告列表」层级组件（按巨量试点模式）
// - 列由后端「媒体原生列表」返回 columns + cname 动态生成
// - 批量操作复用 promotion_manager/components 的 BatchOperationDropdown / BatchOperationDrawer
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { Page, useVbenDrawer } from "@vben/common-ui";
import { advertiserApi, aManagementApi } from "#/api";
import { Button, Descriptions, Drawer as ADrawer, message, Space } from "ant-design-vue";
import { ref } from "vue";
import type { ReportFilter } from "#/api/models";
import BatchOperationDropdown from "../../promotion_manager/components/BatchOperationDropdown.vue";
import BatchOperationDrawer from "../../promotion_manager/components/BatchOperationDrawer.vue";

const props = withDefaults(
  defineProps<{
    /** 媒体标识(如 vivo/oppo/bytedance_std) */
    platform: string;
    /** 查询层级: campaign/adgroup/promotion */
    level: "campaign" | "adgroup" | "promotion";
    /** 该层级的 ID 列(媒体原生列名)，如 campaign_id/adgroup_id/promotion_id */
    idField: string;
    /** 该层级可用的批量操作；为空则不展示批量入口 */
    operationKeys?: string[];
  }>(),
  { operationKeys: () => [] }
);

const levelShownFields: Record<string, string[]> = {
  campaign: ["platform_account_id", "campaignId", "campaignName"],
  adgroup: ["platform_account_id", "campaignId", "campaignName", "adgroupId", "adgroupName"],
  promotion: [
    "platform_account_id",
    "campaignId",
    "campaignName",
    "adgroupId",
    "adgroupName",
    "promotionId",
    "promotionName"
  ]
};

// ============ 批量操作（复用广告管理组件） ============
const [BatchDrawer, batchDrawerApi] = useVbenDrawer({
  connectedComponent: BatchOperationDrawer
});

function openBatchOperation(operationType: string) {
  const rows = (gridApi.grid?.getCheckboxRecords() ?? []) as any[];
  if (rows.length === 0) {
    message.warning("请先勾选需要操作的数据");
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
  const targetId = row[props.idField];
  if (!targetId) return;
  detailOpen.value = true;
  detailLoading.value = true;
  try {
    const res = await aManagementApi.fetchAdManagementDetail({
      targetId: String(targetId),
      platform: props.platform,
      level: props.level
    });
    detailData.value = res ?? {};
  } finally {
    detailLoading.value = false;
  }
}

// ============ 筛选表单 ============
const levelFields = levelShownFields[props.level] ?? [];
const schema = levelFields.map((field) => {
  if (field === "platform_account_id") {
    return {
      component: "ApiSelect",
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: "请选择账户",
        mode: "multiple",
        api: async (params: any) => {
          return await advertiserApi.fetchAdvertiserList({
            page: 1,
            pageSize: 10000,
            putStatue: 1,
            platform: props.platform,
            advertiserRole: [],
            ...params
          });
        },
        valueField: "advertiserId",
        labelField: "advertiserName",
        resultField: "items"
      },
      fieldName: "platform_account_id",
      label: "账户名称"
    };
  }
  const LABEL_MAP: Record<string, string> = {
    campaignId: "项目/计划ID",
    campaignName: "项目/计划名称",
    adgroupId: "广告组ID",
    adgroupName: "广告组名称",
    promotionId: "广告ID",
    promotionName: "广告名称"
  };
  const label = LABEL_MAP[field] ?? field;
  return {
    component: "Input",
    componentProps: { placeholder: `请输入${label}` },
    fieldName: field,
    label
  };
});

const formOptions = {
  schema,
  showDefaultActions: true,
  showCollapseButton: true,
  submitOnEnter: true,
  compact: true,
  collapsed: true
};

const gridOptions: VxeGridProps = {
  border: true,
  checkboxConfig: { highlight: true },
  columns: [],
  data: [],
  keepSource: true,
  pagerConfig: { enabled: true, pageSizes: [20, 50, 100, 200] },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const { items, total, columns: cols, cname } = await doQuery(page, args);
        const enriched = (items ?? []).map((row: any) => ({
          ...row,
          platform: props.platform,
          advertiserId: row.advertiserId || row.platform_account_id,
          campaignId: row.campaignId || row.campaign_id,
          campaignName: row.campaignName || row.campaign_name,
          adgroupId: row.adgroupId || row.adgroup_id,
          adgroupName: row.adgroupName || row.adgroup_name,
          promotionId: row.promotionId || row.promotion_id,
          promotionName: row.promotionName || row.promotion_name
        }));
        buildColumns(cols, cname);
        return { items: enriched, total };
      }
    }
  }
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function buildColumns(cols: string[] | undefined, cname: Record<string, string> | undefined) {
  if (!cols || cols.length === 0) return;
  const dynamic = cols.map((key) => ({
    field: key,
    title: (cname && cname[key]) || key,
    width: "auto",
    showOverflow: true
  }));
  const newColumns: any[] = [
    { title: "", type: "checkbox", width: 50, fixed: "left" },
    { title: "序号", type: "seq", width: 60, fixed: "left" },
    ...dynamic,
    { title: "操作", field: "options", fixed: "right", width: 120, slots: { default: "action" } }
  ];
  gridApi.setGridOptions({ columns: newColumns });
}

// 与后端各层级白名单一致：c=等值(1) / l=模糊(3)
function buildFilters(values: Record<string, any>): ReportFilter[] {
  const filters: ReportFilter[] = [
    { field: "platform", operator: 1, values: [props.platform] }
  ];
  const eq = ["platform_account_id", "campaignId", "adgroupId", "promotionId"];
  const like = ["campaignName", "adgroupName", "promotionName"];
  eq.forEach((f) => {
    const v = values[f];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      filters.push({
        field: f,
        operator: 1,
        values: (Array.isArray(v) ? v : [v]).map((x) => String(x).trim())
      });
    }
  });
  like.forEach((f) => {
    const v = values[f];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
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
    filters: buildFilters(values)
  });
  return {
    items: res?.items ?? [],
    total: res?.total ?? 0,
    columns: res?.columns ?? [],
    cname: res?.cname ?? {}
  };
}

// 导出（单媒体导出）
async function handleExport() {
  const values = await gridApi.formApi?.getValues();
  await aManagementApi.fetchAdExport({
    level: props.level,
    filters: buildFilters(values ?? {})
  });
  await message.success("导出任务已提交！请前往「下载中心」查看并下载文件。");
}
</script>

<template>
 <Page>
   <Page>
     <Grid>
       <template #toolbar-tools>
         <Space>
           <BatchOperationDropdown
             v-if="operationKeys && operationKeys.length > 0"
             :level="level"
             :operation-keys="operationKeys"
             @open="openBatchOperation"
           />
           <Button type="primary" @click="handleExport">导出</Button>
         </Space>
       </template>
       <template #action="{ row }">
         <Button type="link" @click="openDetail(row)">详情</Button>
       </template>
     </Grid>
   </Page>

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
 </Page>
</template>

<style scoped lang="scss">
.platform-level-list {
  height: 100%;
}
</style>
