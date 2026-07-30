<script setup lang="ts" name="AccountTopTable">
/**
 * 账户排行表格
 *
 * 展示消耗 Top N 的账户数据
 */
import { Card, Table, Tag } from 'ant-design-vue';
import type { AccountTopItem } from '#/api/models';

defineProps<{
  /** 账户排行数据 */
  data: AccountTopItem[];
  /** 加载状态 */
  loading?: boolean;
}>();

// 格式化金额
function formatMoney(cents: number): string {
  return `¥${cents}`;
}

// 表格列配置
const columns = [
  {
    title: '排名',
    key: 'rank',
    width: 60,
    customRender: ({ index }: { index: number }) => index + 1,
  },
  {
    title: '账户名称',
    dataIndex: 'advertiserName',
    ellipsis: true,
  },
  {
    title: '平台',
    dataIndex: 'platform',
    width: 100,
    customRender: ({ value }: { value: string }) => {
      const colorMap: Record<string, string> = {
        bytedance: 'blue',
        tencent: 'green',
        oppo: 'orange',
        vivo: 'purple',
        huawei_store: 'red',
      };
      return value
        ? { children: value, props: { color: colorMap[value] || 'default' } }
        : '';
    },
  },
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
    sorter: (a: AccountTopItem, b: AccountTopItem) => a.adConvertAppCustom - b.adConvertAppCustom,
  },
  {
    title: 'ROI',
    dataIndex: 'adPayRoi',
    width: 80,
    sorter: (a: AccountTopItem, b: AccountTopItem) => a.adPayRoi - b.adPayRoi,
    customRender: ({ value }: { value: number }) => value,
  },
  {
    title: '曝光',
    dataIndex: 'adShow',
    width: 80,
    sorter: (a: AccountTopItem, b: AccountTopItem) => a.adShow - b.adShow,
    customRender: ({ value }: { value: number }) => value,
  },
];
</script>

<template>
  <Card title="账户排行 Top 10" class="data-card" :loading="loading">
    <Table
      :columns="columns"
      :data-source="data"
      :pagination="false"
      size="small"
      :scroll="{ y: 260 }"
      row-key="platform_account_id"
    >
      <template #bodyCell="{ column, index }">
        <template v-if="column.key === 'rank'">
          <Tag
            :color="index < 3 ? ['gold', 'silver', 'orange'][index] : 'default'"
            :bordered="false"
          >
            {{ index + 1 }}
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
</style>
