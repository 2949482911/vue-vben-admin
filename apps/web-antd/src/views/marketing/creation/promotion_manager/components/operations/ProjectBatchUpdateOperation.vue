<script setup lang="ts">
/**
 * 批量操作-项目级更新（启停/预算/ROI 共用操作组件）
 *
 * 后端 target 约定（智擎与巨量同接口）：
 * - update_project_status: { project_id, opt_status: 'ENABLE' | 'DISABLE' }
 * - update_project_budget: { project_id, budget_mode: 'BUDGET_MODE_DAY'|'BUDGET_MODE_TOTAL'|'BUDGET_MODE_INFINITE', budget }
 * - update_project_roi:     { project_id, roi_goal }
 */
import { aManagementApi } from '#/api';
import { $t } from '#/locales';
import { Button, Card, Form, FormItem, InputNumber, message, RadioGroup, RadioButton, Table, Tag, Space, Alert } from 'ant-design-vue';
import { computed, ref } from 'vue';
import { Page } from '@vben/common-ui';
import TaskProgressPanel from '../TaskProgressPanel.vue';

const props = defineProps<{
  /** 操作类型: update_project_status / update_project_budget / update_project_roi */
  operationType: string;
  /** 勾选的行数据（项目行） */
  rows: any[];
}>();

const emit = defineEmits<{
  /** 任务执行完毕，通知父级刷新列表 */
  taskCompleted: [];
}>();

// ==================== 提交状态 ====================
const submitting = ref(false);
const taskId = ref<string | number | null>(null);

// ==================== 操作参数 ====================
const optStatus = ref<'ENABLE' | 'DISABLE'>('ENABLE');
const budgetMode = ref('BUDGET_MODE_DAY');
const budget = ref<number | null>(null);
const roiGoal = ref<number | null>(null);

// ==================== 选中数据表格 ====================
const pickProjectId = (row: any) => row.campaignId || row.campaign_id || row.project_id;
const pickProjectName = (row: any) =>
  row.campaignName || row.campaign_name || row.projectName || row.project_name || '-';

const tableColumns = computed(() => [
  {
    dataIndex: 'campaignId',
    key: 'campaignId',
    title: $t('marketing.promotionManager.columns.campaignId'),
    width: 160,
  },
  {
    dataIndex: 'campaignName',
    key: 'campaignName',
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
    campaignId: pickProjectId(row) || '-',
    campaignName: pickProjectName(row),
    platform: row.platform || '-',
    key: pickProjectId(row) || `${row.platform}-${Math.random()}`,
  })),
);

// ==================== 操作参数表单 ====================
const showStatusForm = computed(() => props.operationType === 'update_project_status');
const showBudgetForm = computed(() => props.operationType === 'update_project_budget');
const showRoiForm = computed(() => props.operationType === 'update_project_roi');

const budgetModeOptions = [
  { label: '日预算', value: 'BUDGET_MODE_DAY' },
  { label: '总预算', value: 'BUDGET_MODE_TOTAL' },
  { label: '不限', value: 'BUDGET_MODE_INFINITE' },
];

// 是否可提交（参数校验）
const canSubmit = computed(() => {
  if (props.rows.length === 0) return false;
  if (showBudgetForm.value && budgetMode.value !== 'BUDGET_MODE_INFINITE') {
    return budget.value !== null && Number(budget.value) > 0;
  }
  if (showRoiForm.value) {
    return roiGoal.value !== null && Number(roiGoal.value) > 0;
  }
  return true;
});

// 每个项目行需要追加的操作参数
function extraFields(): Record<string, any> {
  if (props.operationType === 'update_project_status') {
    return { opt_status: optStatus.value };
  }
  if (props.operationType === 'update_project_budget') {
    return { budget_mode: budgetMode.value, budget: budget.value ?? 0 };
  }
  if (props.operationType === 'update_project_roi') {
    return { roi_goal: roiGoal.value ?? 0 };
  }
  return {};
}

/** 按账户分组组装 items（level=campaign，target 携带 project_id + 操作参数） */
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
      level: 'campaign',
      target: rows.map((row) => ({
        project_id: pickProjectId(row),
        ...extraFields(),
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
      name: `${$t('marketing.promotionManager.optionTypes.updateStatus')}_${props.rows.length}`,
      optionType: props.operationType,
      items: buildItems(),
    });
    taskId.value = res;
    message.success(
      `${$t('marketing.promotionManager.tips.submitSuccess')}，${$t('marketing.promotionManager.tips.taskId')}: ${res}`,
    );
  } catch (err) {
    console.error('批量更新项目提交失败:', err);
  } finally {
    submitting.value = false;
  }
}

function handleTaskCompleted() {
  emit('taskCompleted');
}
</script>

<template>
  <Page auto-content-height>
    <Space direction="vertical" class="w-full">
      <Card size="small" :title="$t('marketing.promotionManager.selectedRows')" class="mb-3">
        <Table
          :columns="tableColumns"
          :data-source="tableData"
          :pagination="false"
          size="small"
          :scroll="{ y: 240 }"
        />
      </Card>

      <!-- 操作参数 -->
      <Card v-if="!taskId" size="small" class="mb-3">
        <Form layout="vertical">
          <!-- 启停 -->
          <FormItem v-if="showStatusForm" :label="$t('marketing.promotionManager.optionTypes.updateStatus')">
            <RadioGroup v-model:value="optStatus" button-style="solid">
              <RadioButton value="ENABLE">启用</RadioButton>
              <RadioButton value="DISABLE">暂停</RadioButton>
            </RadioGroup>
          </FormItem>

          <!-- 预算 -->
          <template v-if="showBudgetForm">
            <FormItem label="预算类型">
              <RadioGroup v-model:value="budgetMode">
                <RadioButton v-for="opt in budgetModeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </RadioButton>
              </RadioGroup>
            </FormItem>
            <FormItem
              v-if="budgetMode !== 'BUDGET_MODE_INFINITE'"
              label="预算金额（元）"
              required
            >
              <InputNumber
                v-model:value="budget"
                :min="0"
                :precision="2"
                placeholder="请输入预算金额"
                class="w-64"
              />
            </FormItem>
            <Alert
              v-else
              type="info"
              show-icon
              message="不限预算模式下将关闭日/总预算限制"
            />
          </template>

          <!-- ROI -->
          <FormItem v-if="showRoiForm" label="ROI 目标" required>
            <InputNumber
              v-model:value="roiGoal"
              :min="0"
              :precision="2"
              :step="0.1"
              placeholder="请输入 ROI 目标（如 1.5）"
              class="w-64"
            />
          </FormItem>

          <Space>
            <Button type="primary" :loading="submitting" :disabled="!canSubmit" @click="handleConfirm">
              确认提交
            </Button>
            <Tag class="ml-2 text-xs">
              {{ $t('marketing.promotionManager.tips.selectedCount', { count: props.rows.length }) }}
            </Tag>
          </Space>
        </Form>
      </Card>

      <!-- 任务进度（提交后展示） -->
      <Card v-if="taskId">
        <TaskProgressPanel :task-id="taskId" @task-completed="handleTaskCompleted" />
      </Card>
    </Space>
  </Page>
</template>

<style scoped lang="scss"></style>
