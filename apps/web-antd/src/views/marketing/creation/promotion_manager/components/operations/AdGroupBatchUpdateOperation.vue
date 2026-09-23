<script setup lang="ts">
/**
 * 批量操作-广告组级更新（启停/基础出价/日限额/投放起止时间/转化出价/深度转化出价/免一阶/Deeplink/ROI 共用组件）
 *
 * 支持「全部应用 / 单独设置」双模式：
 * - 全部应用：所有选中广告组共用一个配置，并在下方展示选中数据列表
 * - 单独设置：每个广告组独立配置（表单数组列表）
 * - 免一阶（open_adgroup_default_second_stage）无配置参数，仅展示提示并统一执行
 * - 投放起止时间（update_adgroup_datetime）只用一组值，仅保留「全部应用」
 *
 * 后端 target 约定（OPPO）：
 * - update_adgroup_status:             { adgroup_id, opt_status: 'ENABLE' | 'DISABLE' }
 * - update_adgroup_price:              { adgroup_id, price(分), groupPrice:1, billingType } 或 { adgroup_id, percent }
 * - update_adgroup_ocpc_price:         { adgroup_id, ocpcPrice(分), groupPrice:1, billingType } 或 { adgroup_id, ocpcPercent }
 * - update_adgroup_deep_ocpc_price:    { adgroup_id, deepOcpcPrice(分), groupPrice:1, billingType } 或 { adgroup_id, deepOcpcPercent }
 * - open_adgroup_default_second_stage: { adgroup_id }
 * - update_adgroup_deeplink:           { adgroup_id, deepUrl }
 * - update_adgroup_roi:                { adgroup_id, targetROI } 或 { adgroup_id, targetROIPercent }
 *
 * 后端 target 约定（腾讯，营销单元=我们的 campaign 层级/接口的 adgroup 层级）：
 * - update_adgroup_status:             { adgroup_id, opt_status: 'ENABLE' | 'DISABLE' }
 * - update_adgroup_daily_budget:       { adgroup_id, daily_budget(分) }
 * - update_adgroup_price:              { adgroup_id, bid_amount(分) }（仅绝对值出价，不支持按比例）
 * - update_adgroup_datetime:           { adgroup_id, begin_date?, end_date?, time_series? }（至少一项）
 * 其中 adgroup_id 取腾讯行的 campaignId（营销单元ID）
 */
import { Page } from '@vben/common-ui';

import { aManagementApi } from '#/api';
import { $t } from '#/locales';
import { Alert, Card, message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';

import {
  BATCH_OPERATION_ALL_TIP_KEYS,
  BATCH_OPERATION_LABEL_KEYS,
  BatchMode,
  BatchOperationType,
  MediaPlatform,
} from '../../platformOptions';
import TaskProgressPanel from '../TaskProgressPanel.vue';
import AdGroupConfigForm, {
  buildAdGroupConfigChildren,
  makeDefaultAdGroupConfig,
  type AdGroupConfig,
} from './AdGroupConfigForm.vue';
import BatchIndividualFormArray from './BatchIndividualFormArray.vue';
import BatchOperationModeShell from './BatchOperationModeShell.vue';
import BatchSelectedRowsTable from './BatchSelectedRowsTable.vue';

const props = defineProps<{
  /** 操作类型（广告组级） */
  operationType: string;
  /** 勾选的行数据（广告组行） */
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
/**
 * 腾讯的营销单元挂在 campaign 层级列表（媒体侧称 adgroup），
 * 因此腾讯行取 campaignId 作为批量接口的 adgroup_id，其余媒体取广告组ID。
 */
const pickId = (row: any) =>
  row.platform === MediaPlatform.TENCENT
    ? row.campaignId || row.campaign_id
    : row.adgroupId || row.adgroup_id;
const pickName = (row: any) =>
  row.platform === MediaPlatform.TENCENT
    ? row.campaignName || row.campaign_name || '-'
    : row.adgroupName || row.adgroup_name || '-';

/** 同一批目标来自同一媒体列表，用首行媒体标识区分媒体参数差异（腾讯出价为 bid_amount） */
const platform = computed(() => props.rows[0]?.platform || '');
const isTencent = computed(() => platform.value === MediaPlatform.TENCENT);

const mode = ref<BatchMode>(BatchMode.ALL);

// ==================== 双模式配置 ====================
const globalConfig = reactive<AdGroupConfig>(makeDefaultAdGroupConfig());
const rowConfigs = ref<AdGroupConfig[]>(props.rows.map(() => makeDefaultAdGroupConfig()));

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

/** 免一阶无配置参数，隐藏双模式切换 */
const hasConfig = computed(
  () => props.operationType !== BatchOperationType.OPEN_ADGROUP_DEFAULT_SECOND_STAGE,
);

/** 投放起止时间只用一组值，不提供「单独设置」 */
const showModeToggle = computed(
  () =>
    hasConfig.value &&
    props.operationType !== BatchOperationType.UPDATE_ADGROUP_DATETIME,
);

const allTip = computed(() => {
  const key = BATCH_OPERATION_ALL_TIP_KEYS[props.operationType as BatchOperationType];
  return key ? $t(key) : $t('marketing.promotionManager.mode.allTip');
});

/** 单条配置是否通过校验 */
function isConfigValid(config: AdGroupConfig): boolean {
  const t = props.operationType;
  if (t === BatchOperationType.UPDATE_ADGROUP_PRICE) {
    // 腾讯只支持绝对值出价，无需计费方式
    if (isTencent.value) {
      return config.price !== undefined && Number(config.price) > 0;
    }
    return config.priceMode === 'percent'
      ? config.percent !== undefined && Number(config.percent) > 0
      : config.price !== undefined &&
          Number(config.price) > 0 &&
          config.billingType !== undefined;
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_DAILY_BUDGET) {
    return config.dailyBudget !== undefined && Number(config.dailyBudget) > 0;
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_DATETIME) {
    // 开始投放日期、结束投放日期、投放时段至少填写一项
    return Boolean(config.beginDate || config.endDate || config.timeSeries);
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_OCPC_PRICE) {
    return config.ocpcMode === 'percent'
      ? config.ocpcPercent !== undefined && Number(config.ocpcPercent) > 0
      : config.ocpcPrice !== undefined &&
          Number(config.ocpcPrice) > 0 &&
          config.billingType !== undefined;
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_DEEP_OCPC_PRICE) {
    return config.deepMode === 'percent'
      ? config.deepOcpcPercent !== undefined && Number(config.deepOcpcPercent) > 0
      : config.deepOcpcPrice !== undefined &&
          Number(config.deepOcpcPrice) > 0 &&
          config.billingType !== undefined;
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_DEEPLINK) {
    return config.deepUrl.trim().length > 0;
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_ROI) {
    return config.roiMode === 'percent'
      ? config.targetROIPercent !== undefined && Number(config.targetROIPercent) > 0
      : config.targetROI !== undefined && Number(config.targetROI) > 0;
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

/** 每个广告组行需要追加的操作参数（价格单位：分，前端输入元 ×100 转换） */
function extraFields(config: AdGroupConfig): Record<string, any> {
  const t = props.operationType;
  if (t === BatchOperationType.UPDATE_ADGROUP_STATUS) {
    return { opt_status: config.optStatus };
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_PRICE) {
    // 腾讯只支持绝对值出价，字段为 bid_amount（分）
    if (isTencent.value) {
      return { bid_amount: Math.round(Number(config.price) * 100) };
    }
    return config.priceMode === 'percent'
      ? { percent: Number(config.percent) }
      : {
          price: Math.round(Number(config.price) * 100),
          groupPrice: 1,
          billingType: config.billingType,
        };
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_DAILY_BUDGET) {
    return { daily_budget: Math.round(Number(config.dailyBudget) * 100) };
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_DATETIME) {
    // 三个时间参数至少传一个，未填写的字段不下发
    const datetimeFields: Record<string, any> = {};
    if (config.beginDate) {
      datetimeFields.begin_date = config.beginDate;
    }
    if (config.endDate) {
      datetimeFields.end_date = config.endDate;
    }
    if (config.timeSeries) {
      datetimeFields.time_series = config.timeSeries;
    }
    return datetimeFields;
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_OCPC_PRICE) {
    return config.ocpcMode === 'percent'
      ? { ocpcPercent: Number(config.ocpcPercent) }
      : {
          ocpcPrice: Math.round(Number(config.ocpcPrice) * 100),
          groupPrice: 1,
          billingType: config.billingType,
        };
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_DEEP_OCPC_PRICE) {
    return config.deepMode === 'percent'
      ? { deepOcpcPercent: Number(config.deepOcpcPercent) }
      : {
          deepOcpcPrice: Math.round(Number(config.deepOcpcPrice) * 100),
          groupPrice: 1,
          billingType: config.billingType,
        };
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_DEEPLINK) {
    return { deepUrl: config.deepUrl.trim() };
  }
  if (t === BatchOperationType.UPDATE_ADGROUP_ROI) {
    return config.roiMode === 'percent'
      ? { targetROIPercent: Number(config.targetROIPercent) }
      : { targetROI: Number(config.targetROI) };
  }
  // open_adgroup_default_second_stage 无额外参数
  return {};
}

/** 取某一行当前生效的配置 */
function configOf(index: number): AdGroupConfig {
  return mode.value === BatchMode.INDIVIDUAL ? rowConfigs.value[index]! : globalConfig;
}

/** 表单数组行配置变化同步 */
function onConfigsChange(configs: Record<string, any>[]) {
  rowConfigs.value = configs as AdGroupConfig[];
}

/** 按账户分组组装 items（level=adgroup，target 携带 adgroup_id + 操作参数） */
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
      level: 'adgroup',
      target: group.entries.map(({ row, index }) => ({
        adgroup_id: pickId(row),
        ...extraFields(configOf(index)),
      })),
    });
  });
  return items;
}

/** 确认提交 */
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
    console.error('批量更新广告组提交失败:', err);
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
        :show-mode-toggle="showModeToggle"
        :all-tip="allTip"
        @confirm="handleConfirm"
      >
        <template #all>
          <AdGroupConfigForm
            v-if="hasConfig"
            v-model:config="globalConfig"
            :operation-type="operationType"
            :platform="platform"
          />
          <Alert
            v-else
            type="info"
            show-icon
            :message="$t('marketing.promotionManager.tips.openSecondStageInfo')"
          />
          <BatchSelectedRowsTable :rows="props.rows" :id-of="pickId" :name-of="pickName" />
        </template>

        <template #individual>
          <BatchIndividualFormArray
            :rows="props.rows"
            :name-of="pickName"
            :children="buildAdGroupConfigChildren(operationType, platform)"
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
