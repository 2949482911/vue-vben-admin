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

import DeleteCampaignOperation from './operations/DeleteCampaignOperation.vue';

// ==================== 操作类型元信息 ====================
/** 操作类型 → i18n key（标题） */
const OPERATION_TITLE_KEYS: Record<string, string> = {
  delete_campaign: 'marketing.promotionManager.optionTypes.deleteCampaign',
  update_project_status: 'marketing.promotionManager.optionTypes.updateStatus',
  update_project_budget: 'marketing.promotionManager.optionTypes.updateBudget',
  update_project_roi: 'marketing.promotionManager.optionTypes.updateRoi',
  delete_promotion: 'marketing.promotionManager.optionTypes.deletePromotion',
};

// ==================== 抽屉状态 ====================
const operationType = ref<string>('');
const selectedRows = ref<any[]>([]);
const level = ref<string>('campaign');

/** 当前操作标题 */
const drawerTitle = computed(() => {
  const key = OPERATION_TITLE_KEYS[operationType.value];
  return key ? $t(key) : $t('marketing.promotionManager.batchOperation');
});

/** 操作完成后刷新父级列表 */
const emit = defineEmits<{
  pageReload: [];
}>();

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[640px]',
  closeOnClickModal: false,
  showConfirmButton: false,
  closeOnPressEscape: true,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData() as {
        operationType: string;
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
        v-if="operationType === 'delete_campaign'"
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
