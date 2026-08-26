<script setup lang="ts" name="OverviewCards">
/**
 * 核心指标卡片
 *
 * 展示总消耗、总转化、总ROI、总曝光四个核心指标
 * 每个卡片包含当前值和环比变化趋势
 */
import { computed } from "vue";
import { Card, Col, Row, Statistic, Tag } from "ant-design-vue";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons-vue";
import type { OverviewMetrics } from "#/api/models";

const props = defineProps<{
  /** 指标数据 */
  data: OverviewMetrics | null;
  /** 加载状态 */
  loading?: boolean;
}>();

// 格式化金额（分 → 元）
function formatMoney(cents: number): string {
  if (!cents) {
    return "0";
  }
  return (cents).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// 格式化数字
function formatNumber(num: number): string {
  if (!num) {
    return "0";
  }
  return num.toLocaleString("zh-CN");
}

// 格式化百分比
function formatPercent(val: number): string {
  if (!val) {
    return "0%";
  }
  return `${val >= 0 ? "+" : ""}${val.toFixed(1)}%`;
}

// 环比变化渲染
// @ts-ignore
const changes: Array<Number> = computed(() => {
  if (!props.data) return [
    0, 0, 0, 0
  ];
  return [
    props.data.adCostChange,
    props.data.adConvertChange,
    props.data.adPayRoiChange,
    props.data.adShowChange
  ];
});
</script>

<template>
  <Row :gutter="16" class="overview-cards">
    <!-- 总消耗 -->
    <Col :span="6">
      <Card class="metric-card" :loading="loading" title="总消耗">
        <Statistic

          :value="data ? formatMoney(data.adCost) : '--'"
          prefix="¥"
          :value-style="{ fontSize: '28px', fontWeight: 600 }"
        />
        <div v-if="changes" class="metric-change">
          <span class="change-label">环比</span>
          <Tag
            :color="changes[0] >= 0 ? 'green' : 'red'"
            :bordered="false"
          >
            <component
              :is="changes[0] >= 0 ? ArrowUpOutlined : ArrowDownOutlined"
            />
            {{ formatPercent(changes[0]) }}
          </Tag>
        </div>
      </Card>
    </Col>

    <!-- 总转化 -->
    <Col :span="6">
      <Card class="metric-card" :loading="loading" title="总转化">
        <Statistic

          :value="data ? formatNumber(data.adConvertAppCustom) : '--'"
          :value-style="{ fontSize: '28px', fontWeight: 600 }"
        />
        <div v-if="changes" class="metric-change">
          <span class="change-label">环比</span>
          <Tag
            :color="changes[1] >= 0 ? 'green' : 'red'"
            :bordered="false"
          >
            <component
              :is="changes[1] >= 0 ? ArrowUpOutlined : ArrowDownOutlined"
            />
            {{ formatPercent(changes[1]) }}
          </Tag>
        </div>
      </Card>
    </Col>

    <!-- 总ROI -->
    <Col :span="6">
      <Card class="metric-card" :loading="loading" title="综合ROI">
        <Statistic

          :value="data ? data.adPayRoi : '--'"
          :value-style="{ fontSize: '28px', fontWeight: 600 }"
        />
        <div v-if="changes" class="metric-change">
          <span class="change-label">环比</span>
          <Tag
            :color="changes[2] >= 0 ? 'green' : 'red'"
            :bordered="false"
          >
            <component
              :is="changes[2] >= 0 ? ArrowUpOutlined : ArrowDownOutlined"
            />
            {{ formatPercent(changes[2]) }}
          </Tag>
        </div>
      </Card>
    </Col>

    <!-- 总曝光 -->
    <Col :span="6">
      <Card class="metric-card" :loading="loading" title="总曝光">
        <Statistic
          :value="data ? formatNumber(data.adShow) : '--'"
          :value-style="{ fontSize: '28px', fontWeight: 600 }"
        />
        <div v-if="changes" class="metric-change">
          <span class="change-label">环比</span>
          <Tag
            :color="changes[3] >= 0 ? 'green' : 'red'"
            :bordered="false"
          >
            <component
              :is="changes[3] >= 0 ? ArrowUpOutlined : ArrowDownOutlined"
            />
            {{ formatPercent(changes[3]) }}
          </Tag>
        </div>
      </Card>
    </Col>
  </Row>
</template>

<style scoped lang="scss">
.overview-cards {
  margin-bottom: 16px;
}

.metric-card {
  :deep(.ant-card-body) {
    padding: 20px 24px;
  }

  :deep(.ant-statistic-title) {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 8px;
  }
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;

  .change-label {
    font-size: 13px;
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
