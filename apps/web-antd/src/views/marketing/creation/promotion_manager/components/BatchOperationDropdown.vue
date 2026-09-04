<script setup lang="ts">
/**
 * 广告管理-批量操作入口（Dropdown 菜单组）
 *
 * 通用组件：根据页面层级（level）生成可用的批量操作菜单项，
 * 点击某个操作后通过 open 事件通知父页面，父页面负责校验选中行并打开抽屉。
 */
import { DownOutlined } from '@ant-design/icons-vue';

import { $t } from '#/locales';
import { Button, Dropdown, Menu, MenuItem } from 'ant-design-vue';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 页面层级: campaign/adgroup/promotion */
    level: string;
    /**
     * 仅展示指定操作(按 operationType)。默认不传则按 level 展示全量可用操作；
     * 传了则仅展示列表中的操作(顺序按传入顺序)。
     */
    operationKeys?: string[];
  }>(),
  {
    operationKeys: undefined,
  },
);

const emit = defineEmits<{
  /** 选择某个批量操作 */
  open: [operationType: string];
}>();

/** 操作类型 -> 名称（找不到时回退 key） */
const OPERATION_LABELS: Record<string, string> = {
  update_project_status: $t('marketing.promotionManager.optionTypes.updateStatus'),
  update_project_budget: $t('marketing.promotionManager.optionTypes.updateBudget'),
  update_project_roi: $t('marketing.promotionManager.optionTypes.updateRoi'),
  delete_campaign: $t('marketing.promotionManager.optionTypes.deleteCampaign'),
  delete_promotion: $t('marketing.promotionManager.optionTypes.deletePromotion'),
};
const labelOf = (key: string) => OPERATION_LABELS[key] ?? key;

/** 根据层级生成可用操作菜单（campaign 可删计划，promotion 可删广告） */
const menuItems = computed(() => {
  if (props.operationKeys && props.operationKeys.length > 0) {
    return props.operationKeys.map((key) => ({ key, label: labelOf(key) }));
  }
  const items: { key: string; label: string }[] = [
    { key: 'update_project_status', label: labelOf('update_project_status') },
    { key: 'update_project_budget', label: labelOf('update_project_budget') },
    { key: 'update_project_roi', label: labelOf('update_project_roi') },
  ];
  if (props.level === 'campaign') {
    items.push({ key: 'delete_campaign', label: labelOf('delete_campaign') });
  }
  if (props.level === 'promotion') {
    items.push({ key: 'delete_promotion', label: labelOf('delete_promotion') });
  }
  return items;
});

function handleMenuClick(key: string) {
  emit('open', key);
}
</script>

<template>
  <Dropdown trigger="click" placement="bottom">
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
