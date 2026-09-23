<script setup lang="ts">
/**
 * 批量操作-删除广告（操作组件）
 *
 * 展示选中广告数据（ID + 名字），确认后提交批量删除任务，
 * 拿到 taskId 后交给 TaskProgressPanel 轮询进度展示结果。
 * 兼容统一字段(promotionId/promotionName)与媒体原生字段(promotion_id/adgroup_id/promotion_name/adgroup_name)。
 * 腾讯无创意层级列表，创意ID 取营销单元列表的「源动态创意ID」列(source_dynamic_creative_id)。
 */
import { aManagementApi } from '#/api';
import { $t } from '#/locales';
import { Button, Card, message, Table, Tag, Space } from 'ant-design-vue';
import { computed, ref } from 'vue';
import { Page } from "@vben/common-ui";
import { BatchOperationType, MediaPlatform } from '../../platformOptions';
import TaskProgressPanel from '../TaskProgressPanel.vue';

const props = defineProps<{
  /** 勾选的行数据 */
  rows: any[];
}>();

const emit = defineEmits<{
  /** 任务提交完成（拿到 taskId 后） */
  taskSubmitted: [taskId: string | number];
  /** 任务执行完毕，通知父级刷新列表 */
  taskCompleted: [];
}>();

// ==================== 提交状态 ====================
const submitting = ref(false);
const taskId = ref<string | number | null>(null);

/** 兼容取广告ID/名称 */
const pickId = (row: any) =>
  row.platform === MediaPlatform.TENCENT
    ? row.source_dynamic_creative_id || row.sourceDynamicCreativeId
    : row.promotionId || row.promotion_id || row.adgroupId || row.adgroup_id;
const pickName = (row: any) =>
  row.promotionName || row.promotion_name || row.adgroupName || row.adgroup_name || '-';

// ==================== 选中数据表格 ====================
const tableColumns = computed(() => [
  {
    dataIndex: 'adId',
    key: 'adId',
    title: $t('marketing.promotionManager.columns.campaignId'),
    width: 160,
  },
  {
    dataIndex: 'adName',
    key: 'adName',
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

/** 表格数据源（仅保留需要的展示字段） */
const tableData = computed(() => {
  return props.rows.map((row) => ({
    adId: pickId(row) || '-',
    adName: pickName(row),
    platform: row.platform || '-',
    key: pickId(row) || `${row.platform}-${Math.random()}`,
  }));
});

/** 按账户分组组装 items（无可用创意ID的行会被跳过） */
function buildItems() {
  const groupMap = new Map<string, any[]>();
  props.rows.forEach((row) => {
    if (!pickId(row)) return;
    const key = row.advertiserId || row.platform_account_id;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(row);
  });

  const items: any[] = [];
  groupMap.forEach((rows, advertiserId) => {
    const first = rows[0];
    items.push({
      advertiserId,
      platform: first.platform,
      level: 'promotion',
      target: rows.map((row) => ({
        promotion_id: pickId(row),
      })),
    });
  });
  return items;
}

/** 确认提交 */
async function handleConfirm() {
  if (props.rows.length === 0) return;
  const items = buildItems();
  if (items.length === 0) {
    message.warning($t('marketing.promotionManager.tips.noValidTarget'));
    return;
  }
  submitting.value = true;
  try {
    const res = await aManagementApi.fetchCreateBatch({
      name: `${$t('marketing.promotionManager.optionTypes.deletePromotion')}_${props.rows.length}`,
      optionType: BatchOperationType.DELETE_PROMOTION,
      items,
    });
    taskId.value = res;
    emit('taskSubmitted', res);
    message.success(
      `${$t('marketing.promotionManager.tips.submitSuccess')}，${$t('marketing.promotionManager.tips.taskId')}: ${res}`,
    );
  } catch (err) {
    console.error('批量删除广告提交失败:', err);
  } finally {
    submitting.value = false;
  }
}

function handleTaskCompleted() {
  emit('taskCompleted');
}
</script>

<template>
  <Page>
    <Space direction="vertical">
      <Card size="small" :title="$t('marketing.promotionManager.selectedRows')" class="mb-3">
        <Table
          :columns="tableColumns"
          :data-source="tableData"
          :pagination="false"
          size="small"
          :scroll="{ y: 280 }"
        />
      </Card>

      <!-- 操作按钮 -->
      <Card v-if="!taskId" class="mb-3">
        <Space>
          <Button type="primary" :loading="submitting" @click="handleConfirm">
            {{ $t('marketing.promotionManager.confirmDelete') }}
          </Button>
          <Tag class="ml-2 text-xs">
            {{ $t('marketing.promotionManager.tips.selectedCount', { count: props.rows.length }) }}
          </Tag>
        </Space>
      </Card>

      <!-- 任务进度（提交后展示） -->
      <Card>
        <TaskProgressPanel
          v-if="taskId"
          :task-id="taskId"
          @task-completed="handleTaskCompleted"
        />
      </Card>
    </Space>
  </Page>
</template>

<style scoped lang="scss"></style>
