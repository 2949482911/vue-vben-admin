<script setup lang="ts">
/**
 * 批量操作-已选数据列表（通用表格）
 *
 * 用于「全部应用」模式下方展示当前选中的数据（ID + 名称 + 平台），
 * 与删除类操作保持一致，让用户确认操作范围。
 */
import { $t } from '#/locales';
import { Card, Table } from 'ant-design-vue';
import { computed } from 'vue';

const props = defineProps<{
  /** 已选行数据 */
  rows: any[];
  /** 取行 ID */
  idOf: (row: any) => string | number;
  /** 取行名称 */
  nameOf: (row: any) => string;
}>();

const tableColumns = computed(() => [
  {
    dataIndex: 'id',
    key: 'id',
    title: $t('marketing.promotionManager.columns.campaignId'),
    width: 180,
  },
  {
    dataIndex: 'name',
    key: 'name',
    title: $t('marketing.promotionManager.columns.campaignName'),
    minWidth: 200,
  },
  {
    dataIndex: 'platform',
    key: 'platform',
    title: $t('marketing.promotionManager.columns.platform'),
    width: 120,
  },
]);

const tableData = computed(() =>
  props.rows.map((row) => ({
    id: props.idOf(row) || '-',
    name: props.nameOf(row),
    platform: row.platform || '-',
    key: props.idOf(row) || `${row.platform}-${Math.random()}`,
  })),
);
</script>

<template>
  <Card
    size="small"
    :title="$t('marketing.promotionManager.selectedRows')"
    class="batch-selected-rows-table"
  >
    <Table
      :columns="tableColumns"
      :data-source="tableData"
      :pagination="false"
      size="small"
      :scroll="{ y: 240 }"
    />
  </Card>
</template>

<style scoped lang="scss">
.batch-selected-rows-table {
  :deep(.ant-card-body) {
    padding: 0;
  }
}
</style>
