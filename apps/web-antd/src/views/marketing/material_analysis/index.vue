<script setup lang="ts" name="MaterialAnalysis">
/**
 * 素材智能分析
 *
 * 跨平台素材效果分析，包含：
 * - 概览统计（总数/使用中/起量/衰退/平均CTR/平均ROI）
 * - 生命周期分布漏斗图
 * - 素材效果排行表格（支持排序、筛选、标签）
 *
 * 参考 metric/index.vue 的 useVbenVxeGrid + proxyConfig 模式
 */
import type { VbenFormProps } from '@vben/common-ui';
import { Page } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Col, Row, Card, Tag, Image } from 'ant-design-vue';
import { materialAnalysisApi } from '#/api/core';
import { PLATFORM } from '#/constants/locales';
import { trimObject } from '#/utils/trim';
import type { MaterialAnalysisItem, MaterialOverview, LifecycleDistribution } from '#/api/models';
import { ref, onMounted } from 'vue';

import { LIFECYCLE_MAP, MATERIAL_TYPE_OPTIONS, SORT_OPTIONS } from './constants';
import MaterialOverviewCard from './components/MaterialOverview.vue';
import MaterialLifecycleChart from './components/MaterialLifecycleChart.vue';

// ==================== 概览数据 ====================
const overviewData = ref<MaterialOverview | null>(null);
const lifecycleData = ref<LifecycleDistribution | null>(null);
const loadingOverview = ref(false);

async function loadOverview() {
  loadingOverview.value = true;
  try {
    const [overview, lifecycle] = await Promise.allSettled([
      materialAnalysisApi.fetchOverview({}),
      materialAnalysisApi.fetchLifecycle({}),
    ]);
    if (overview.status === 'fulfilled') overviewData.value = overview.value;
    if (lifecycle.status === 'fulfilled') lifecycleData.value = lifecycle.value;
  } finally {
    loadingOverview.value = false;
  }
}

// ==================== 表格配置 ====================

const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Select',
      componentProps: { options: PLATFORM },
      fieldName: 'platform',
      label: '平台',
    },
    {
      component: 'Select',
      componentProps: { options: MATERIAL_TYPE_OPTIONS },
      fieldName: 'materialType',
      label: '素材类型',
    },
    {
      component: 'Select',
      componentProps: { options: SORT_OPTIONS },
      fieldName: 'sortBy',
      label: '排序',
    },
  ],
  showCollapseButton: false,
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<MaterialAnalysisItem> = {
  border: true,
  checkboxConfig: { highlight: true, labelField: 'id' },
  toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  columns: [
    {
      field: 'thumbnailUrl',
      title: '素材',
      width: 120,
      slots: { default: 'thumbnail' },
    },
    { field: 'materialName', title: '名称', minWidth: 160 },
    {
      field: 'materialType',
      title: '类型',
      width: 70,
      slots: { default: 'materialType' },
    },
    { field: 'platform', title: '平台', width: 90 },
    {
      field: 'lifecycle',
      title: '生命周期',
      width: 90,
      slots: { default: 'lifecycle' },
    },
    {
      field: 'spend',
      title: '消耗',
      width: 100,
      sortable: true,
      formatter: ({ cellValue }) =>
        `¥${(cellValue / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
    },
    {
      field: 'impression',
      title: '曝光',
      width: 90,
      sortable: true,
      formatter: ({ cellValue }) =>
        cellValue?.toLocaleString('zh-CN') || '0',
    },
    {
      field: 'click',
      title: '点击',
      width: 80,
      sortable: true,
    },
    {
      field: 'ctr',
      title: 'CTR',
      width: 70,
      sortable: true,
      formatter: ({ cellValue }) => `${(cellValue || 0).toFixed(1)}%`,
    },
    {
      field: 'cvr',
      title: 'CVR',
      width: 70,
      sortable: true,
      formatter: ({ cellValue }) => `${(cellValue || 0).toFixed(1)}%`,
    },
    {
      field: 'roi',
      title: 'ROI',
      width: 70,
      sortable: true,
      formatter: ({ cellValue }) => (cellValue || 0).toFixed(2),
    },
    {
      field: 'tags',
      title: '标签',
      width: 150,
      slots: { default: 'tags' },
    },
    {
      field: 'lastDeliveryAt',
      title: '最近投放',
      width: 140,
      formatter: 'formatDateTime',
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: { pageSize: 20 },
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        // 解析排序参数
        let sortBy: string | undefined;
        let sortOrder: 'asc' | 'desc' | undefined;
        if (params.sortBy) {
          const [field, order] = params.sortBy.split(':');
          sortBy = field;
          sortOrder = order as 'asc' | 'desc';
          delete params.sortBy;
        }
        return await materialAnalysisApi.fetchList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
          sortBy: sortBy as any,
          sortOrder,
        });
      },
    },
  },
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });

onMounted(() => {
  loadOverview();
});
</script>

<template>
  <Page auto-content-height>
    <!-- 概览统计 -->
    <MaterialOverviewCard
      :data="overviewData"
      :loading="loadingOverview"
    />

    <!-- 生命周期 + 快速入口 -->
    <Row :gutter="16" class="section-row">
      <Col :span="8">
        <MaterialLifecycleChart
          :data="lifecycleData"
          :loading="loadingOverview"
        />
      </Col>
      <Col :span="16">
        <Card title="素材效果排行" class="rank-card">
          <Grid>
            <!-- 缩略图列 -->
            <template #thumbnail="{ row }">
              <Image
                v-if="row.thumbnailUrl"
                :src="row.thumbnailUrl"
                :width="60"
                :height="40"
                style="border-radius: 4px; object-fit: cover"
              />
              <div v-else class="thumb-empty">无图</div>
            </template>

            <!-- 素材类型 -->
            <template #materialType="{ row }">
              <Tag :color="row.materialType === 'video' ? 'blue' : 'green'" :bordered="false" size="small">
                {{ row.materialType === 'video' ? '视频' : '图片' }}
              </Tag>
            </template>

            <!-- 生命周期 -->
            <template #lifecycle="{ row }">
              <Tag
                :color="LIFECYCLE_MAP[row.lifecycle]?.color || 'default'"
                :bordered="false"
                size="small"
              >
                {{ LIFECYCLE_MAP[row.lifecycle]?.label || row.lifecycle }}
              </Tag>
            </template>

            <!-- 标签 -->
            <template #tags="{ row }">
              <div class="tag-list">
                <Tag
                  v-for="tag in (row.tags || []).slice(0, 3)"
                  :key="tag.id"
                  :bordered="false"
                  size="small"
                  :color="tag.type === 'auto' ? 'purple' : 'cyan'"
                >
                  {{ tag.name }}
                </Tag>
                <Tag v-if="(row.tags || []).length > 3" :bordered="false" size="small">
                  +{{ row.tags.length - 3 }}
                </Tag>
              </div>
            </template>
          </Grid>
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style scoped lang="scss">
.section-row {
  margin-bottom: 16px;
}

.rank-card {
  height: 320px;

  :deep(.ant-card-body) {
    height: calc(100% - 57px);
    padding: 0;
    overflow: hidden;
  }
}

.thumb-empty {
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
