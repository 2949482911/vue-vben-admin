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

const props = defineProps<{
  /** 页面层级: campaign/adgroup/promotion */
  level: string;
}>();

const emit = defineEmits<{
  /** 选择某个批量操作 */
  open: [operationType: string];
}>();

/** 根据层级生成可用操作菜单（campaign 可删计划，promotion 可删广告） */
const menuItems = computed(() => {
  const items: { key: string; label: string }[] = [
    {
      key: 'update_project_status',
      label: $t('marketing.promotionManager.optionTypes.updateStatus'),
    },
    {
      key: 'update_project_budget',
      label: $t('marketing.promotionManager.optionTypes.updateBudget'),
    },
    {
      key: 'update_project_roi',
      label: $t('marketing.promotionManager.optionTypes.updateRoi'),
    },
  ];
  if (props.level === 'campaign') {
    items.push({
      key: 'delete_campaign',
      label: $t('marketing.promotionManager.optionTypes.deleteCampaign'),
    });
  }
  if (props.level === 'promotion') {
    items.push({
      key: 'delete_promotion',
      label: $t('marketing.promotionManager.optionTypes.deletePromotion'),
    });
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
