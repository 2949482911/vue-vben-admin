<script setup lang="ts">
/**
 * 批量操作-删除广告组（操作组件）
 *
 * 展示选中广告组数据（ID + 名字），确认后提交批量删除任务。
 * target 字段：{ adgroup_id }
 * 腾讯的营销单元挂在 campaign 层级列表（媒体侧称 adgroup），腾讯行取 campaignId 作为 adgroup_id。
 */
import { aManagementApi } from '#/api';
import { $t } from '#/locales';
import { Button, Card, message, Table, Tag, Space } from 'ant-design-vue';
import { computed, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { BatchOperationType, MediaPlatform } from '../../platformOptions';
import TaskProgressPanel from '../TaskProgressPanel.vue';

const props = defineProps<{
  /** 勾选的行数据 */
  rows: any[];
}>();

const emit = defineEmits<{
  /** 任务执行完毕，通知父级刷新列表 */
  taskCompleted: [];
}>();

// ==================== 提交状态 ====================
const submitting = ref(false);
const taskId = ref<string | number | null>(null);

/** 兼容取广告组ID/名称（腾讯取营销单元字段） */
const pickId = (row: any) =>
  row.platform === MediaPlatform.TENCENT
    ? row.campaignId || row.campaign_id
    : row.adgroupId || row.adgroup_id;
const pickName = (row: any) =>
  row.platform === MediaPlatform.TENCENT
    ? row.campaignName || row.campaign_name || '-'
    : row.adgroupName || row.adgroup_name || '-';

// ==================== 选中数据表格 ====================
const tableColumns = computed(() => [
  {
    dataIndex: 'adgroupId',
    key: 'adgroupId',
    title: $t('marketing.promotionManager.columns.campaignId'),
    width: 160,
  },
  {
    dataIndex: 'adgroupName',
    key: 'adgroupName',
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
    adgroupId: pickId(row) || '-',
    adgroupName: pickName(row),
    platform: row.platform || '-',
    key: pickId(row) || `${row.platform}-${Math.random()}`,
  })),
);

/** 按账户分组组装 items（level=adgroup，target 携带 adgroup_id） */
function buildItems() {
  const groupMap = new Map<string, any[]>();
  props.rows.forEach((row) => {
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
      level: 'adgroup',
      target: rows.map((row) => ({
        adgroup_id: pickId(row),
      })),
    });
  });
  return items;
}

/** 确认提交 */
async function handleConfirm() {
  if (props.rows.length === 0) return;
  submitting.value = true;
  try {
    const res = await aManagementApi.fetchCreateBatch({
      name: `${$t('marketing.promotionManager.optionTypes.deleteAdgroup')}_${props.rows.length}`,
      optionType: BatchOperationType.DELETE_ADGROUP,
      items: buildItems(),
    });
    taskId.value = res;
    message.success(
      `${$t('marketing.promotionManager.tips.submitSuccess')}，${$t('marketing.promotionManager.tips.taskId')}: ${res}`,
    );
  } catch (err) {
    console.error('批量删除广告组提交失败:', err);
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
    <Space direction="vertical" class="w-full">
      <Card size="small" :title="$t('marketing.promotionManager.selectedRows')" class="mb-3">
        <Table
          :columns="tableColumns"
          :data-source="tableData"
          :pagination="false"
          size="small"
          :scroll="{ y: 280 }"
        />
      </Card>

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

      <Card v-if="taskId">
        <TaskProgressPanel :task-id="taskId" @task-completed="handleTaskCompleted" />
      </Card>
    </Space>
  </Page>
</template>

<style scoped lang="scss"></style>
