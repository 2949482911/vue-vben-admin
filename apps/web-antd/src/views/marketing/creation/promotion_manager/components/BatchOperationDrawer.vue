<script setup lang="ts">
/**
 * 广告管理-批量操作抽屉（通用容器）
 *
 * 通过 drawerApi.setData 传入 { operationType, rows, level }，
 * 内部根据 operationType 动态渲染对应的批量操作组件（v-if）。
 * 每个操作组件展示内容不同，但均接收选中的数据并以表格形式展示，
 * 提交后轮询进度接口展示处理进度。
 */
import { useVbenDrawer } from '@vben/common-ui';

import { $t } from '#/locales';
import { Empty } from 'ant-design-vue';
import { computed, ref } from 'vue';

import {
  BATCH_OPERATION_LABEL_KEYS,
  BatchOperationType,
} from '../platformOptions';
import AddPromotionOperation from './operations/AddPromotionOperation.vue';
import AdGroupBatchUpdateOperation from './operations/AdGroupBatchUpdateOperation.vue';
import DeleteAdGroupOperation from './operations/DeleteAdGroupOperation.vue';
import DeleteCampaignOperation from './operations/DeleteCampaignOperation.vue';
import DeletePromotionOperation from './operations/DeletePromotionOperation.vue';
import ProjectBatchUpdateOperation from './operations/ProjectBatchUpdateOperation.vue';
import PromotionBatchUpdateOperation from './operations/PromotionBatchUpdateOperation.vue';

// ==================== 操作类型分组 ====================
const PROJECT_UPDATE_TYPES: BatchOperationType[] = [
  BatchOperationType.UPDATE_PROJECT_STATUS,
  BatchOperationType.UPDATE_PROJECT_BUDGET,
  BatchOperationType.UPDATE_PROJECT_ROI,
];

const ADGROUP_UPDATE_TYPES: BatchOperationType[] = [
  BatchOperationType.UPDATE_ADGROUP_STATUS,
  BatchOperationType.UPDATE_ADGROUP_PRICE,
  BatchOperationType.UPDATE_ADGROUP_DAILY_BUDGET,
  BatchOperationType.UPDATE_ADGROUP_DATETIME,
  BatchOperationType.UPDATE_ADGROUP_OCPC_PRICE,
  BatchOperationType.UPDATE_ADGROUP_DEEP_OCPC_PRICE,
  BatchOperationType.OPEN_ADGROUP_DEFAULT_SECOND_STAGE,
  BatchOperationType.UPDATE_ADGROUP_DEEPLINK,
  BatchOperationType.UPDATE_ADGROUP_ROI,
];

const PROMOTION_UPDATE_TYPES: BatchOperationType[] = [
  BatchOperationType.UPDATE_PROMOTION_STATUS,
  BatchOperationType.UPDATE_PROMOTION_MONITOR_URL,
];

// ==================== 抽屉状态 ====================
const operationType = ref<BatchOperationType | ''>('');
const selectedRows = ref<any[]>([]);
const level = ref<string>('campaign');

/** 当前操作标题 */
const drawerTitle = computed(() => {
  const key = operationType.value
    ? BATCH_OPERATION_LABEL_KEYS[operationType.value]
    : undefined;
  return key ? $t(key) : $t('marketing.promotionManager.batchOperation');
});

/** 判断当前操作类型 */
function isType(type: BatchOperationType): boolean {
  return operationType.value === type;
}

/** 判断当前操作类型是否属于某分组 */
function isTypeIn(types: BatchOperationType[]): boolean {
  return types.includes(operationType.value as BatchOperationType);
}

/** 操作完成后刷新父级列表 */
const emit = defineEmits<{
  pageReload: [];
}>();

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[75%]',
  closeOnClickModal: false,
  showConfirmButton: false,
  closeOnPressEscape: true,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData() as {
        operationType: BatchOperationType;
        rows: any[];
        level: string;
      };
      operationType.value = data?.operationType || '';
      selectedRows.value = data?.rows || [];
      level.value = data?.level || 'campaign';
    } else {
      // 关闭抽屉时清空操作状态，v-if 销毁操作组件，
      // 触发其内部 TaskProgressPanel 卸载，停止进度轮询请求
      operationType.value = '';
      selectedRows.value = [];
      level.value = 'campaign';
    }
  },
  onCancel() {
    drawerApi.close();
  },
});

function handleTaskCompleted() {
  emit('pageReload');
}
</script>

<template>
  <Drawer :title="drawerTitle">
    <div class="batch-operation-drawer">
      <!-- 根据操作类型动态渲染对应操作组件 -->
      <DeleteCampaignOperation
        v-if="isType(BatchOperationType.DELETE_CAMPAIGN)"
        :rows="selectedRows"
        @task-completed="handleTaskCompleted"
      />

      <DeletePromotionOperation
        v-else-if="isType(BatchOperationType.DELETE_PROMOTION)"
        :rows="selectedRows"
        @task-completed="handleTaskCompleted"
      />

      <!-- 项目级更新（启停/预算/ROI） -->
      <ProjectBatchUpdateOperation
        v-else-if="isTypeIn(PROJECT_UPDATE_TYPES)"
        :operation-type="operationType"
        :rows="selectedRows"
        @task-completed="handleTaskCompleted"
      />

      <!-- 广告组删除 -->
      <DeleteAdGroupOperation
        v-else-if="isType(BatchOperationType.DELETE_ADGROUP)"
        :rows="selectedRows"
        @task-completed="handleTaskCompleted"
      />

      <!-- 广告组级更新（启停/基础出价/转化出价/深度转化出价/免一阶/Deeplink/ROI） -->
      <AdGroupBatchUpdateOperation
        v-else-if="isTypeIn(ADGROUP_UPDATE_TYPES)"
        :operation-type="operationType"
        :rows="selectedRows"
        @task-completed="handleTaskCompleted"
      />

      <!-- 广告创意级更新（启停/监测链接） -->
      <PromotionBatchUpdateOperation
        v-else-if="isTypeIn(PROMOTION_UPDATE_TYPES)"
        :operation-type="operationType"
        :rows="selectedRows"
        @task-completed="handleTaskCompleted"
      />

      <!-- 批量新增广告创意 -->
      <AddPromotionOperation
        v-else-if="isType(BatchOperationType.ADD_PROMOTION)"
        :rows="selectedRows"
        @task-completed="handleTaskCompleted"
      />

      <!-- 尚未实现的批量操作占位提示 -->
      <Empty
        v-else
        :description="$t('marketing.promotionManager.notImplemented')"
        class="py-20"
      />
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.batch-operation-drawer {
  :deep(.ant-card) {
    border-radius: 8px;
  }
}
</style>
