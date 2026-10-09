<script setup lang="ts" name="HostingCockpit">
/**
 * AI 智能托管 — 实时托管概览（KPI 驾驶舱）
 *
 * 结构用 ant-design-vue 组件（Card / Row / Col / Statistic / Tag / Badge / Space / Skeleton），
 * 品牌数据带的视觉按原型图用 scoped CSS 微调；颜色全部取 vben 设计 token，深浅色主题自适应。
 */
import type { HostingStats } from "#/api/models/ai_hosting";
import { computed, onBeforeUnmount, ref } from "vue";
import {
  AppstoreOutlined,
  ClusterOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  WalletOutlined
} from "@ant-design/icons-vue";
import {
  Card,
  Col,
  Flex,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography
} from "ant-design-vue";

const props = defineProps<{
  /** 统计概览 */
  stats?: HostingStats | null;
  /** 待审核决策数（由决策单列表实时计算） */
  pendingCount?: number;
  /** 加载状态 */
  loading?: boolean;
}>();

const emit = defineEmits<{
  /** 点击「待审核决策」 */
  openPending: [];
}>();

/** 分 → 元（保留 2 位，万字自动缩写） */
function formatMoney(cents?: number): string {
  if (!cents) {
    return "0";
  }
  const yuan = cents / 100;
  if (yuan >= 10000) {
    return `${(yuan / 10000).toFixed(2)}万`;
  }
  return yuan.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

function formatNumber(num?: number): string {
  return (num ?? 0).toLocaleString("zh-CN");
}

const stats = computed(() => props.stats ?? {});
const pending = computed(() => props.pendingCount ?? stats.value.pendingCount ?? 0);

type Kpi = {
  key: string;
  icon: any;
  label: string;
  unit?: string;
  value: string;
  delta?: string;
  deltaColor?: string;
  alarm?: boolean;
  clickable?: boolean;
};

const kpis = computed<Kpi[]>(() => [
  {
    key: "accounts",
    icon: ClusterOutlined,
    label: "托管账户",
    unit: "个",
    value: formatNumber(stats.value.managedAccountCount)
  },
  {
    key: "managed",
    icon: AppstoreOutlined,
    label: "管理计划 / 广告",
    unit: "条",
    value: formatNumber(stats.value.managedAdCount)
  },
  {
    key: "actions",
    icon: ThunderboltOutlined,
    label: "今日 AI 动作",
    unit: "次",
    value: formatNumber(stats.value.todayExecCount),
    delta: stats.value.todayAutoExecCount
      ? `自动 ${formatNumber(stats.value.todayAutoExecCount)} 次`
      : undefined
  },
  {
    key: "pending",
    icon: SafetyCertificateOutlined,
    label: "待审核决策",
    unit: "条",
    value: formatNumber(pending.value),
    delta: pending.value > 0 ? "需人工确认" : "暂无待审",
    deltaColor: pending.value > 0 ? "error" : "default",
    alarm: pending.value > 0,
    clickable: true
  },
  {
    key: "saved",
    icon: WalletOutlined,
    label: "今日拦截损失",
    unit: "元",
    value: formatMoney(stats.value.todaySavedSpend)
  },
  {
    key: "latency",
    icon: DashboardOutlined,
    label: "AI 平均响应",
    unit: "s",
    value: formatNumber(stats.value.avgLatency)
  }
]);

/** 数值字号；告警态用 destructive token 着色，其余用前景色 */
const BASE_VALUE_STYLE = { fontSize: "26px", fontWeight: 700, letterSpacing: "0.5px" };
function valueStyleOf(kpi: Kpi) {
  return kpi.alarm
    ? { ...BASE_VALUE_STYLE, color: "hsl(var(--destructive))" }
    : { ...BASE_VALUE_STYLE, color: "hsl(var(--foreground))" };
}

/** 实时时钟 */
const clock = ref(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
const timer = setInterval(() => {
  clock.value = new Date().toLocaleTimeString("zh-CN", { hour12: false });
}, 1000);
onBeforeUnmount(() => clearInterval(timer));

function handleClick(kpi: Kpi) {
  if (kpi.clickable) {
    emit("openPending");
  }
}
</script>

<template>
  <Card :bordered="false" class="cockpit">
    <Flex align="center" justify="space-between" class="cockpit-head">
      <Space :size="8">
        <ThunderboltOutlined />
        <Typography.Text strong>实时托管概览</Typography.Text>
      </Space>
      <Space :size="8">
        <span class="live-dot"></span>
        <Typography.Text>实时同步中</Typography.Text>
        <Typography.Text class="cockpit-clock">{{ clock }}</Typography.Text>
      </Space>
    </Flex>

    <Skeleton v-if="loading" active :paragraph="{ rows: 2 }" />

    <Row v-else :gutter="[12, 12]">
      <Col
        v-for="kpi in kpis"
        :key="kpi.key"
        :lg="4"
        :md="8"
        :sm="12"
        :xs="12"
      >
        <div
          class="kpi"
          :class="{ 'kpi--alert': kpi.alarm, 'kpi--clickable': kpi.clickable }"
          :role="kpi.clickable ? 'button' : undefined"
          :tabindex="kpi.clickable ? 0 : undefined"
          @click="handleClick(kpi)"
          @keydown.enter="handleClick(kpi)"
        >
          <Statistic :value="kpi.value" :value-style="valueStyleOf(kpi)">
            <template #title>
              <Space :size="4">
                <component :is="kpi.icon" />
                <span>{{ kpi.label }}</span>
              </Space>
            </template>
            <template #suffix>
              <span v-if="kpi.unit">{{ kpi.unit }}</span>
            </template>
          </Statistic>
          <Tag v-if="kpi.delta" :bordered="false" :color="kpi.deltaColor">
            {{ kpi.delta }}
          </Tag>
        </div>
      </Col>
    </Row>
  </Card>
</template>

<style scoped lang="scss">
/*
 * 柔和数据带：以「卡片底色 + 低透明度主题色」呈现，不改变前景色，
 * 因此浅色/深色主题都能自然过渡，不再是饱和实心色块。
 */
.cockpit {
  position: relative;
  flex: none;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid hsl(var(--primary) / 18%);
  border-radius: var(--radius, 0.75rem);
  background:
    linear-gradient(
      135deg,
      hsl(var(--primary) / 10%) 0%,
      hsl(var(--primary) / 2%) 100%
    ),
    hsl(var(--card));

  /* 极浅网格，仅作纹理，不抢内容 */
  &::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: "";
    background-image:
      linear-gradient(hsl(var(--primary) / 6%) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--primary) / 6%) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: radial-gradient(120% 140% at 85% 0%, black 20%, transparent 75%);
  }

  :deep(.ant-card-body) {
    position: relative;
    z-index: 1;
    padding: 18px 20px 20px;
  }
}

.cockpit-head {
  margin-bottom: 16px;
}

.cockpit-clock {
  color: hsl(var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: hsl(var(--success));
  border-radius: 50%;
  animation: cockpit-pulse 1.8s infinite;
}

@keyframes cockpit-pulse {
  0% {
    box-shadow: 0 0 0 0 hsl(var(--success) / 45%);
  }

  70% {
    box-shadow: 0 0 0 8px hsl(var(--success) / 0%);
  }

  100% {
    box-shadow: 0 0 0 0 hsl(var(--success) / 0%);
  }
}

/* ==================== KPI 卡片（浅色 tint，不压前景） ==================== */
.kpi {
  height: 100%;
  padding: 14px 14px 12px;
  background: hsl(var(--primary) / 6%);
  border: 1px solid hsl(var(--primary) / 14%);
  border-radius: calc(var(--radius, 0.75rem) - 2px);
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-2px);
  }

  :deep(.ant-statistic-title) {
    color: hsl(var(--muted-foreground));
    font-size: 12px;
  }

  :deep(.ant-statistic-content-suffix) {
    color: hsl(var(--muted-foreground));
    font-size: 13px;
    font-weight: 500;
  }
}

/* 待审核：destructive 语义色的柔和 tint */
.kpi--alert {
  background: hsl(var(--destructive) / 10%);
  border-color: hsl(var(--destructive) / 28%);

  :deep(.ant-statistic-title),
  :deep(.ant-statistic-content-suffix) {
    color: hsl(var(--destructive));
  }
}

.kpi--clickable {
  cursor: pointer;

  &:hover {
    background: hsl(var(--primary) / 12%);
    border-color: hsl(var(--primary) / 30%);
  }

  &:focus-visible {
    outline: 2px solid hsl(var(--primary) / 55%);
    outline-offset: 2px;
  }
}
</style>
