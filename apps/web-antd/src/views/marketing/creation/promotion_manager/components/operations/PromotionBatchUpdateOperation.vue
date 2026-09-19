<script setup lang="ts">
/**
 * 批量操作-广告创意级更新（启停/监测链接 共用组件）
 *
 * 支持「全部应用 / 单独设置」双模式：
 * - 全部应用：所有选中创意共用一个配置，并在下方展示选中数据列表
 * - 单独设置：每个创意独立配置（表单数组列表）
 *
 * 后端 target 约定（OPPO）：
 * - update_promotion_status:       { promotion_id, opt_status: 'ENABLE' | 'DISABLE' }
 * - update_promotion_monitor_url:  { promotion_id, clickUrl, exposeUrl }（两者不能都为空）
 */
import { Page } from '@vben/common-ui';

import { aManagementApi } from '#/api';
import { $t } from '#/locales';
import { Card, message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';

import {
  BATCH_OPERATION_ALL_TIP_KEYS,
  BATCH_OPERATION_LABEL_KEYS,
  BatchMode,
  BatchOperationType,
} from '../../platformOptions';
import TaskProgressPanel from '../TaskProgressPanel.vue';
import BatchIndividualFormArray from './BatchIndividualFormArray.vue';
import BatchOperationModeShell from './BatchOperationModeShell.vue';
import BatchSelectedRowsTable from './BatchSelectedRowsTable.vue';
import PromotionConfigForm, {
  buildPromotionConfigChildren,
  makeDefaultPromotionConfig,
  type PromotionConfig,
} from './PromotionConfigForm.vue';

const props = defineProps<{
  /** 操作类型（创意级） */
  operationType: string;
  /** 勾选的行数据（创意行） */
  rows: any[];
}>();

const emit = defineEmits<{
  /** 任务执行完毕，通知父级刷新列表 */
  taskCompleted: [];
}>();

// ==================== 提交状态 ====================
const submitting = ref(false);
const taskId = ref<string | number | null>(null);

// ==================== 选中数据 ====================
const pickId = (row: any) => row.promotionId || row.promotion_id || row.adId;
const pickName = (row: any) => row.promotionName || row.promotion_name || '-';

const mode = ref<BatchMode>(BatchMode.ALL);

// ==================== 双模式配置 ====================
const globalConfig = reactive<PromotionConfig>(makeDefaultPromotionConfig());
const rowConfigs = ref<PromotionConfig[]>(props.rows.map(() => makeDefaultPromotionConfig()));

// 模式切换时同步配置，避免「单独设置 ↔ 全部应用」切换丢失已编辑内容
watch(mode, (next) => {
  if (next === BatchMode.ALL) {
    if (rowConfigs.value[0]) {
      Object.assign(globalConfig, rowConfigs.value[0]);
    }
  } else {
    rowConfigs.value = props.rows.map(() => ({ ...globalConfig }));
  }
});

const showMonitorForm = computed(
  () => props.operationType === BatchOperationType.UPDATE_PROMOTION_MONITOR_URL,
);

const allTip = computed(() => {
  const key = BATCH_OPERATION_ALL_TIP_KEYS[props.operationType as BatchOperationType];
  return key ? $t(key) : $t('marketing.promotionManager.mode.allTip');
});

function isConfigValid(config: PromotionConfig): boolean {
  if (showMonitorForm.value) {
    return config.clickUrl.trim().length > 0 || config.exposeUrl.trim().length > 0;
  }
  return true;
}

const canSubmit = computed(() => {
  if (props.rows.length === 0) return false;
  if (mode.value === BatchMode.INDIVIDUAL) {
    return rowConfigs.value.every(isConfigValid);
  }
  return isConfigValid(globalConfig);
});

function extraFields(config: PromotionConfig): Record<string, any> {
  if (showMonitorForm.value) {
    const fields: Record<string, any> = {};
    if (config.clickUrl.trim()) fields.clickUrl = config.clickUrl.trim();
    if (config.exposeUrl.trim()) fields.exposeUrl = config.exposeUrl.trim();
    return fields;
  }
  return { opt_status: config.optStatus };
}

/** 取某一行当前生效的配置 */
function configOf(index: number): PromotionConfig {
  return mode.value === BatchMode.INDIVIDUAL ? rowConfigs.value[index]! : globalConfig;
}

/** 表单数组行配置变化同步 */
function onConfigsChange(configs: Record<string, any>[]) {
  rowConfigs.value = configs as PromotionConfig[];
}

/** 按账户分组组装 items（level=promotion，target 携带 promotion_id + 操作参数） */
function buildItems() {
  const groupMap = new Map<
    string,
    { advertiserId: string; platform: string; entries: { row: any; index: number }[] }
  >();
  props.rows.forEach((row, index) => {
    const key = row.advertiserId || row.platform_account_id;
    if (!groupMap.has(key)) {
      groupMap.set(key, { advertiserId: key, platform: row.platform, entries: [] });
    }
    groupMap.get(key)!.entries.push({ row, index });
  });

  const items: any[] = [];
  groupMap.forEach((group) => {
    items.push({
      advertiserId: group.advertiserId,
      platform: group.platform,
      level: 'promotion',
      target: group.entries.map(({ row, index }) => ({
        promotion_id: pickId(row),
        ...extraFields(configOf(index)),
      })),
    });
  });
  return items;
}

async function handleConfirm() {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    const res = await aManagementApi.fetchCreateBatch({
      name: `${$t(BATCH_OPERATION_LABEL_KEYS[props.operationType as BatchOperationType])}_${props.rows.length}`,
      optionType: props.operationType,
      items: buildItems(),
    });
    taskId.value = res;
    message.success(
      `${$t('marketing.promotionManager.tips.submitSuccess')}，${$t('marketing.promotionManager.tips.taskId')}: ${res}`,
    );
  } catch (err) {
    console.error('批量更新广告创意提交失败:', err);
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
    <div class="w-full">
      <BatchOperationModeShell
        v-if="!taskId"
        v-model:mode="mode"
        :total-count="props.rows.length"
        :loading="submitting"
        :can-submit="canSubmit"
        :all-tip="allTip"
        @confirm="handleConfirm"
      >
        <template #all>
          <PromotionConfigForm
            v-model:config="globalConfig"
            :operation-type="operationType"
          />
          <BatchSelectedRowsTable :rows="props.rows" :id-of="pickId" :name-of="pickName" />
        </template>

        <template #individual>
          <BatchIndividualFormArray
            :rows="props.rows"
            :name-of="pickName"
            :children="buildPromotionConfigChildren(operationType)"
            :initial-configs="rowConfigs"
            @update:configs="onConfigsChange"
          />
        </template>
      </BatchOperationModeShell>

      <!-- 任务进度（提交后展示） -->
      <Card v-if="taskId">
        <TaskProgressPanel :task-id="taskId" @task-completed="handleTaskCompleted" />
      </Card>
    </div>
  </Page>
</template>

<style scoped lang="scss"></style>
