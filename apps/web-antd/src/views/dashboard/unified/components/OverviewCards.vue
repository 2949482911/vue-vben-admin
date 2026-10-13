<script setup lang="ts" name="OverviewCards">
/**
 * 核心指标卡片
 *
 * 四张卡片各带主题色（--tint），底色/描边/图标块由它派生；文字颜色与字号沿用
 * vben token 与标准字号档，不改全局样式。
 */
import { computed } from 'vue';
import { Card, Col, Row, Statistic, Tag } from 'ant-design-vue';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  EyeOutlined,
  FundOutlined,
  RiseOutlined,
  WalletOutlined,
} from '@ant-design/icons-vue';
import type { OverviewMetrics } from '#/api/models';

const props = defineProps<{
  /** 指标数据 */
  data: OverviewMetrics | null;
  /** 加载状态 */
  loading?: boolean;
}>();

/** 数值字号走标准档（20/24），不用自定字号 */
const VALUE_STYLE = { fontSize: '24px', fontWeight: 600 };

function formatMoney(cents: number): string {
  if (!cents) {
    return '0';
  }
  return cents.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatNumber(num: number): string {
  if (!num) {
    return '0';
  }
  return num.toLocaleString('zh-CN');
}

function formatPercent(val: number): string {
  if (!val) {
    return '0%';
  }
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}

const cards = computed(() => {
  const d = props.data;
  return [
    {
      key: 'cost',
      color: 'blue',
      icon: WalletOutlined,
      title: '总消耗',
      prefix: '¥',
      value: d ? formatMoney(d.adCost) : '--',
      change: d?.adCostChange ?? 0,
    },
    {
      key: 'convert',
      color: 'cyan',
      icon: RiseOutlined,
      title: '总转化',
      prefix: '',
      value: d ? formatNumber(d.adConvertAppCustom) : '--',
      change: d?.adConvertChange ?? 0,
    },
    {
      key: 'roi',
      color: 'green',
      icon: FundOutlined,
      title: '综合ROI',
      prefix: '',
      value: d ? String(d.adPayRoi) : '--',
      change: d?.adPayRoiChange ?? 0,
    },
    {
      key: 'show',
      color: 'violet',
      icon: EyeOutlined,
      title: '总曝光',
      prefix: '',
      value: d ? formatNumber(d.adShow) : '--',
      change: d?.adShowChange ?? 0,
    },
  ];
});
</script>

<template>
  <Row :gutter="16" class="overview-cards">
    <Col v-for="card in cards" :key="card.key" :span="6">
      <Card
        :bordered="false"
        class="metric-card"
        :class="`metric-card--${card.color}`"
        :loading="loading"
      >
        <div class="metric-head">
          <span class="metric-ic">
            <component :is="card.icon" />
          </span>
          <span class="metric-title">{{ card.title }}</span>
        </div>

        <Statistic
          :prefix="card.prefix"
          :value="card.value"
          :value-style="VALUE_STYLE"
        />

        <div class="metric-change">
          <span class="check-label">环比</span>
          <Tag :color="card.change >= 0 ? 'green' : 'red'" :bordered="false">
            <component
              :is="card.change >= 0 ? ArrowUpOutlined : ArrowDownOutlined"
            />
            {{ formatPercent(card.change) }}
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

/*
 * 一张卡只需声明 --tint：
 * 底色 = tint 与卡片底色混合（浅→深），描边/图标块由 tint 派生。
 * 颜色沿用 vben token；cyan / violet 为本站补充强调色（vben 无内置），仅作填充。
 */
.metric-card {
  --tint: hsl(var(--primary));
  height: 100%;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--tint) 22%, transparent);
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--tint) 10%, hsl(var(--card))) 0%,
    color-mix(in srgb, var(--tint) 3%, hsl(var(--card))) 100%
  );
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 26px color-mix(in srgb, var(--tint) 18%, transparent);
  }

  :deep(.ant-card-body) {
    padding: 16px 18px;
  }

  :deep(.ant-statistic-title) {
    margin-bottom: 0;
    font-size: 14px;
    color: hsl(var(--muted-foreground));
  }
}

.metric-card--cyan {
  --tint: hsl(187 78% 38%);
}

.metric-card--green {
  --tint: hsl(var(--success));
}

.metric-card--violet {
  --tint: hsl(258 84% 62%);
}

.metric-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.metric-ic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: #fff;
  background: var(--tint);
  border-radius: 8px;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--tint) 34%, transparent);
}

.metric-title {
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.metric-change {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;

  .check-label {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}
</style>
