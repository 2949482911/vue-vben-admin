<script setup lang="ts">
/**
 * 广告管理-批量操作入口（Dropdown 菜单组）
 *
 * 通用组件：根据页面层级（level）生成可用的批量操作菜单项，
 * 点击某个操作后通过 open 事件通知父页面，父页面负责校验选中行并打开抽屉。
 *
 * 支持的操作矩阵（level -> operationType）：
 * - campaign:   update_project_status / update_project_budget / update_project_roi / delete_campaign
 * - adgroup:    delete_adgroup / update_adgroup_status / update_adgroup_price / update_adgroup_daily_budget /
 *               update_adgroup_datetime / update_adgroup_ocpc_price /
 *               update_adgroup_deep_ocpc_price / open_adgroup_default_second_stage /
 *               update_adgroup_deeplink / update_adgroup_roi
 * - promotion:  delete_promotion / add_promotion / update_promotion_status /
 *               update_promotion_monitor_url
 */
import { DownOutlined } from '@ant-design/icons-vue';

import { $t } from '#/locales';
import { Button, Dropdown, Menu, MenuItem } from 'ant-design-vue';
import { computed } from 'vue';

import {
  BATCH_OPERATION_LABEL_KEYS,
  BatchOperationType,
} from '../platformOptions';

const props = withDefaults(
  defineProps<{
    /** 页面层级: campaign/adgroup/promotion */
    level: string;
    /**
     * 仅展示指定操作(按 operationType)。默认不传则按 level 展示全量可用操作；
     * 传了则仅展示列表中的操作(顺序按传入顺序)。
     */
    operationKeys?: BatchOperationType[];
  }>(),
  {
    operationKeys: undefined,
  },
);

const emit = defineEmits<{
  /** 选择某个批量操作 */
  open: [operationType: BatchOperationType];
}>();

const labelOf = (key: BatchOperationType) => $t(BATCH_OPERATION_LABEL_KEYS[key]);

/** 每个层级默认展示的操作菜单（未显式传入 operationKeys 时的兜底） */
const LEVEL_OPERATIONS: Record<string, BatchOperationType[]> = {
  campaign: [
    BatchOperationType.UPDATE_PROJECT_STATUS,
    BatchOperationType.UPDATE_PROJECT_BUDGET,
    BatchOperationType.UPDATE_PROJECT_ROI,
    BatchOperationType.DELETE_CAMPAIGN,
  ],
  adgroup: [
    BatchOperationType.UPDATE_ADGROUP_STATUS,
    BatchOperationType.UPDATE_ADGROUP_PRICE,
    BatchOperationType.UPDATE_ADGROUP_OCPC_PRICE,
    BatchOperationType.UPDATE_ADGROUP_DEEP_OCPC_PRICE,
    BatchOperationType.OPEN_ADGROUP_DEFAULT_SECOND_STAGE,
    BatchOperationType.UPDATE_ADGROUP_DEEPLINK,
    BatchOperationType.UPDATE_ADGROUP_ROI,
    BatchOperationType.DELETE_ADGROUP,
  ],
  promotion: [
    BatchOperationType.UPDATE_PROMOTION_STATUS,
    BatchOperationType.UPDATE_PROMOTION_MONITOR_URL,
    BatchOperationType.ADD_PROMOTION,
    BatchOperationType.DELETE_PROMOTION,
  ],
};

const menuItems = computed(() => {
  const keys =
    props.operationKeys && props.operationKeys.length > 0
      ? props.operationKeys
      : (LEVEL_OPERATIONS[props.level] ?? []);
  return keys.map((key) => ({ key, label: labelOf(key) }));
});

function handleMenuClick(key: BatchOperationType) {
  emit('open', key);
}
</script>

<template>
  <Dropdown trigger="click">
    <Button type="primary">
      <span class="mr-1">{{ $t('marketing.promotionManager.batchOperation') }}</span>
      <DownOutlined />
    </Button>
    <template #overlay>
      <Menu>
        <MenuItem
          v-for="item in menuItems"
          :key="item.key"
          @click="handleMenuClick(item.key)"
        >
          {{ item.label }}
        </MenuItem>
      </Menu>
    </template>
  </Dropdown>
</template>

<style scoped lang="scss"></style>
