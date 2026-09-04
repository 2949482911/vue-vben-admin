<script lang="ts" setup>
// bytedance 试点：单层级(项目/广告)广告列表
// 列由后端「媒体原生列表」返回的 columns + cname 动态生成，支持筛选/分页/导出/详情/批量操作
// 批量操作复用 promotion_manager/components 的 BatchOperationDropdown / BatchOperationDrawer
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { advertiserApi, aManagementApi } from '#/api';
import { Button, Descriptions, message, Space, Drawer as ADrawer } from 'ant-design-vue';
import { computed, ref } from 'vue';
import type { ReportFilter } from '#/api/models';
import BatchOperationDropdown from '../../../promotion_manager/components/BatchOperationDropdown.vue';
import BatchOperationDrawer from '../../../promotion_manager/components/BatchOperationDrawer.vue';
const props = defineProps<{
  /** campaign=项目, adgroup=广告 */
  level: 'campaign' | 'adgroup';
}>();

// 该层级默认的 ID 字段名（媒体原生列名）
const idField = computed(() => (props.level === 'campaign' ? 'campaign_id' : 'adgroup_id'));

// ============ 批量操作（复用广告管理组件） ============
const [BatchDrawer, batchDrawerApi] = useVbenDrawer({
  connectedComponent: BatchOperationDrawer,
});

/** 该层级可用的批量操作 */
const levelOperationKeys = computed(() =>
  props.level === 'campaign' ? ['delete_campaign'] : ['delete_promotion'],
);

function openBatchOperation(operationType: string) {
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
  showDefaultActions: false,
  showCollapseButton: true,
  submitOnEnter: true,
  compact: true,
  collapsed: true,
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

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function buildColumns(cols: string[] | undefined, cname: Record<string, string> | undefined) {
  if (!cols || cols.length === 0) return;
  const dynamic = cols.map((key) => ({
    field: key,
    title: (cname && cname[key]) || key,
    width: 'auto',
    showOverflow: true,
  }));
  const newColumns: any[] = [
    { title: '', type: 'checkbox', width: 50, fixed: 'left' },
    { title: '序号', type: 'seq', width: 60, fixed: 'left' },
    ...dynamic,
    { title: '操作', field: 'options', fixed: 'right', width: 120, slots: { default: 'action' } },
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

// 导出（媒体固定单平台）
async function handleExport() {
  const values = await gridApi.formApi?.getValues();
  await aManagementApi.fetchAdExport({
    level: props.level,
    filters: buildFilters(values ?? {}),
  });
  await message.success('导出任务已提交！请前往「下载中心」查看并下载文件。');
}
</script>

<template>
  <div class="level-list">
    <Page>
      <Grid>
        <template #toolbar-tools>
          <Space>
            <BatchOperationDropdown
              :level="level"
              :operation-keys="levelOperationKeys"
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

    <!-- 详情抽屉 -->
    <ADrawer
      v-model:open="detailOpen"
      :title="detailTitle"
      :loading="detailLoading"
      width="560"
    >
      <Descriptions :column="1" size="small" bordered>
        <Descriptions.Item v-for="(val, key) in detailData" :key="key" :label="String(key)">
          {{ val }}
        </Descriptions.Item>
      </Descriptions>
    </ADrawer>
  </div>
</template>

<style scoped lang="scss">
.level-list {
  height: 100%;
}
</style>
