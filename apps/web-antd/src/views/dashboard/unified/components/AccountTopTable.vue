<script setup lang="ts" name="AccountTopTable">
/**
 * 账户排行表格
 *
 * 展示消耗 Top N 的账户数据。排行榜前三用主题色徽章，平台标签复用全站平台色，
 * 其余沿用 antd 表格与 vben token，不覆盖全局样式。
 */
import { Card, Table, Tag } from 'ant-design-vue';
import { TrophyOutlined } from '@ant-design/icons-vue';
import type { AccountTopItem } from '#/api/models';
import { getPlatformColor, getPlatformLabel } from '#/constants/platform';

defineProps<{
  /** 账户排行数据 */
  data: AccountTopItem[];
  /** 加载状态 */
  loading?: boolean;
}>();

function formatMoney(cents: number): string {
  return `¥${cents}`;
}

/** 前三名的徽章主题色 class，其余走中性 */
function rankClass(index: number): string {
  return [`rank-badge--gold`, `rank-badge--violet`, `rank-badge--cyan`][index] ?? 'rank-badge--plain';
}

const columns = [
  { title: '排名', key: 'rank', width: 72 },
  { title: '账户名称', dataIndex: 'advertiserName', ellipsis: true },
  { title: '平台', dataIndex: 'platform', key: 'platform', width: 110 },
  {
    title: '消耗',
    dataIndex: 'adCost',
    width: 120,
    sorter: (a: AccountTopItem, b: AccountTopItem) => a.adCost - b.adCost,
    customRender: ({ value }: { value: number }) => formatMoney(value),
  },
  {
    title: '转化',
    dataIndex: 'adConvertAppCustom',
    width: 100,
    sorter: (a: AccountTopItem, b: AccountTopItem) =>
      a.adConvertAppCustom - b.adConvertAppCustom,
  },
  {
    title: 'ROI',
    dataIndex: 'adPayRoi',
    width: 80,
    sorter: (a: AccountTopItem, b: AccountTopItem) => a.adPayRoi - b.adPayRoi,
  },
  {
    title: '曝光',
    dataIndex: 'adShow',
    width: 80,
    sorter: (a: AccountTopItem, b: AccountTopItem) => a.adShow - b.adShow,
  },
];
</script>

<template>
  <Card class="data-card" :loading="loading">
    <template #title>
      <span class="pt-ic pt-ic--blue"><TrophyOutlined /></span>
      账户排行 Top 10
    </template>

    <Table
      :columns="columns"
      :data-source="data"
      :pagination="false"
      :scroll="{ y: 260 }"
      row-key="platform_account_id"
      size="small"
    >
      <template #bodyCell="{ column, index, text }">
        <template v-if="column.key === 'rank'">
          <span class="rank-badge" :class="rankClass(index)">{{ index + 1 }}</span>
        </template>
        <template v-else-if="column.key === 'platform'">
          <Tag :bordered="false" :color="getPlatformColor(text)">
            {{ getPlatformLabel(text) }}
          </Tag>
        </template>
      </template>
    </Table>
  </Card>
</template>

<style scoped lang="scss">
.data-card {
  height: 360px;

  :deep(.ant-card-body) {
    height: calc(100% - 57px);
    padding: 12px 16px;
    overflow: hidden;
  }
}

/* 卡片标题前的主题色图标块（与 KPI 卡同一套视觉语言） */
.pt-ic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  color: #fff;
  background: hsl(var(--primary));
  border-radius: 8px;
  box-shadow: 0 3px 10px hsl(var(--primary) / 32%);
}

.pt-ic--blue {
  background: hsl(var(--primary));
}

/* 排名徽章：前三用强调色，其余中性 */
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
}

.rank-badge--gold {
  color: #fff;
  background: linear-gradient(135deg, hsl(var(--warning)), hsl(35 92% 58%));
}

.rank-badge--violet {
  color: #fff;
  background: linear-gradient(135deg, hsl(258 84% 62%), hsl(262 84% 70%));
}

.rank-badge--cyan {
  color: #fff;
  background: linear-gradient(135deg, hsl(187 78% 38%), hsl(187 72% 50%));
}

.rank-badge--plain {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
}
</style>
