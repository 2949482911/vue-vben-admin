<script setup lang="ts" name="UnifiedDashboard">
/**
 * 统一数据看板
 *
 * 跨平台投放数据聚合展示，对标创量/引力引擎的数据看板能力
 * 包含：核心指标概览、消耗趋势、平台对比、账户排行、素材排行、智能告警
 *
 * 布局参考 analytics/index.vue 的 Card 堆叠模式
 * 数据流：DashboardFilter → index.vue(中央状态) → 各子组件(props)
 */
import { onMounted, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Card, Col, Row } from 'ant-design-vue';
import { dashboardApi } from '#/api/core/dashboard';
import type {
  DashboardQueryParams,
  OverviewMetrics,
  TrendDataPoint,
  PlatformCompareItem,
  AccountTopItem,
  MaterialRankItem,
  AlertItem,
} from '#/api/models';

// 子组件
import DashboardFilter from './components/DashboardFilter.vue';
import OverviewCards from './components/OverviewCards.vue';
import SpendTrendChart from './components/SpendTrendChart.vue';
import PlatformCompareChart from './components/PlatformCompareChart.vue';
import AccountTopTable from './components/AccountTopTable.vue';
import MaterialRankList from './components/MaterialRankList.vue';
import AlertList from './components/AlertList.vue';

// ==================== 状态管理 ====================

const filterRef = ref<InstanceType<typeof DashboardFilter>>();

// 各模块数据
const overviewData = ref<OverviewMetrics | null>(null);
const trendData = ref<TrendDataPoint[]>([]);
const platformCompareData = ref<PlatformCompareItem[]>([]);
const accountTopData = ref<AccountTopItem[]>([]);
const materialRankData = ref<MaterialRankItem[]>([]);
const alertData = ref<AlertItem[]>([]);

// 各模块加载状态
const loading = ref({
  overview: false,
  trend: false,
  platformCompare: false,
  accountTop: false,
  materialRank: false,
  alerts: false,
});

// ==================== 数据加载 ====================

/**
 * 获取筛选参数
 */
function getQueryParams(): DashboardQueryParams {
  return filterRef.value?.getValues() || {
    dateRange: ['', ''],
  };
}

/**
 * 加载核心指标概览
 */
async function loadOverview(params: DashboardQueryParams) {
  loading.value.overview = true;
  try {
    overviewData.value = await dashboardApi.fetchOverview(params);
  } catch (e) {
    console.error('[Dashboard] 加载概览失败:', e);
  } finally {
    loading.value.overview = false;
  }
}

/**
 * 加载消耗趋势
 */
async function loadTrend(params: DashboardQueryParams) {
  loading.value.trend = true;
  try {
    trendData.value = await dashboardApi.fetchTrend(params);
  } catch (e) {
    console.error('[Dashboard] 加载趋势失败:', e);
  } finally {
    loading.value.trend = false;
  }
}

/**
 * 加载平台对比
 */
async function loadPlatformCompare(params: DashboardQueryParams) {
  loading.value.platformCompare = true;
  try {
    platformCompareData.value = await dashboardApi.fetchPlatformCompare(params);
  } catch (e) {
    console.error('[Dashboard] 加载平台对比失败:', e);
  } finally {
    loading.value.platformCompare = false;
  }
}

/**
 * 加载账户排行
 */
async function loadAccountTop(params: DashboardQueryParams) {
  loading.value.accountTop = true;
  try {
    accountTopData.value = await dashboardApi.fetchAccountTop({
      ...params,
      topN: 10,
    });
  } catch (e) {
    console.error('[Dashboard] 加载账户排行失败:', e);
  } finally {
    loading.value.accountTop = false;
  }
}

/**
 * 加载素材排行
 */
async function loadMaterialRank(params: DashboardQueryParams) {
  loading.value.materialRank = true;
  try {
    materialRankData.value = await dashboardApi.fetchMaterialRank({
      ...params,
      topN: 10,
    });
  } catch (e) {
    console.error('[Dashboard] 加载素材排行失败:', e);
  } finally {
    loading.value.materialRank = false;
  }
}

/**
 * 加载告警列表
 */
async function loadAlerts(params: DashboardQueryParams) {
  loading.value.alerts = true;
  try {
    const res = await dashboardApi.fetchAlerts({
      ...params,
      page: 1,
      pageSize: 20,
    });
    alertData.value = res.items;
  } catch (e) {
    console.error('[Dashboard] 加载告警失败:', e);
  } finally {
    loading.value.alerts = false;
  }
}

/**
 * 加载全部看板数据
 */
async function loadAllData() {
  const params = getQueryParams();
  // 并行加载所有数据模块
  await Promise.allSettled([
    loadOverview(params),
    loadTrend(params),
    loadPlatformCompare(params),
    loadAccountTop(params),
    loadMaterialRank(params),
    loadAlerts(params),
  ]);
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadAllData();
});
</script>

<template>
  <Page auto-content-height>
    <!-- 顶部筛选栏 -->
    <DashboardFilter ref="filterRef" />

    <!-- 核心指标卡片 -->
    <OverviewCards
      :data="overviewData"
      :loading="loading.overview"
    />

    <!-- 趋势图 + 平台对比 -->
    <Row :gutter="16" class="chart-row">
      <Col :span="12">
        <SpendTrendChart
          :data="trendData"
          :loading="loading.trend"
        />
      </Col>
      <Col :span="12">
        <PlatformCompareChart
          :data="platformCompareData"
          :loading="loading.platformCompare"
        />
      </Col>
    </Row>

    <!-- 账户排行 + 素材排行 -->
    <Row :gutter="16" class="chart-row">
      <Col :span="12">
        <AccountTopTable
          :data="accountTopData"
          :loading="loading.accountTop"
        />
      </Col>
      <Col :span="12">
        <MaterialRankList
          :data="materialRankData"
          :loading="loading.materialRank"
        />
      </Col>
    </Row>

    <!-- 智能告警 -->
    <Card class="alert-section">
      <AlertList
        :data="alertData"
        :loading="loading.alerts"
      />
    </Card>
  </Page>
</template>

<style scoped lang="scss">
.chart-row {
  margin-bottom: 16px;
}

.alert-section {
  margin-bottom: 16px;

  :deep(.ant-card-body) {
    padding: 0;
  }
}
</style>
