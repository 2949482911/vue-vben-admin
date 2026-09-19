<script setup lang="ts">
/**
 * 批量操作「全部应用 / 单独设置」通用外壳
 *
 * 负责双模式的视觉与结构：顶部 Segmented 切换、全部应用模式的提示条、
 * 单独设置模式的表单数组区域，以及底部提交操作条。
 * 具体配置内容由调用方通过插槽注入（#all 与 #individual），避免外壳耦合业务字段。
 */
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons-vue';

import { $t } from '#/locales';
import { Alert, Button, Segmented, Space, Tag } from 'ant-design-vue';
import { h } from 'vue';

import { BatchMode } from '../../platformOptions';

const mode = defineModel<BatchMode>('mode', { required: true });

const props = withDefaults(
  defineProps<{
    /** 已选总数（用于底部计数展示） */
    totalCount: number;
    /** 提交 loading */
    loading?: boolean;
    /** 是否可提交 */
    canSubmit?: boolean;
    /** 是否展示模式切换（无配置参数的纯动作型操作可隐藏） */
    showModeToggle?: boolean;
    /** 全部应用模式的提示文案 */
    allTip?: string;
    /** 提交按钮文案 */
    submitText?: string;
  }>(),
  {
    loading: false,
    canSubmit: false,
    showModeToggle: true,
    allTip: () => $t('marketing.promotionManager.mode.allTip'),
    submitText: () => $t('marketing.promotionManager.mode.submit'),
  },
);

const emit = defineEmits<{
  confirm: [];
}>();

const modeOptions = [
  {
    value: BatchMode.ALL,
    label: () =>
      h('span', { class: 'inline-flex items-center gap-1.5' }, [
        h(AppstoreOutlined),
        h('span', $t('marketing.promotionManager.mode.all')),
      ]),
  },
  {
    value: BatchMode.INDIVIDUAL,
    label: () =>
      h('span', { class: 'inline-flex items-center gap-1.5' }, [
        h(BarsOutlined),
        h('span', $t('marketing.promotionManager.mode.individual')),
      ]),
  },
];
</script>

<template>
  <div class="batch-mode-shell">
    <!-- 模式切换 -->
    <Segmented
      v-if="showModeToggle"
      v-model:value="mode"
      :options="modeOptions"
      block
      class="batch-mode-switch"
    />

    <!-- 全部应用 -->
    <div v-if="mode === BatchMode.ALL" class="batch-mode-body">
      <Alert type="info" show-icon :message="allTip" />
      <slot name="all" />
    </div>

    <!-- 单独设置 -->
    <div v-else class="batch-mode-body">
      <slot name="individual" />
    </div>

    <!-- 底部操作条 -->
    <div class="batch-mode-footer">
      <Space :size="8">
        <Button
          type="primary"
          :loading="loading"
          :disabled="!canSubmit"
          @click="emit('confirm')"
        >
          {{ submitText }}
        </Button>
        <Tag class="batch-mode-count">
          {{ $t('marketing.promotionManager.mode.selectedCount', { count: totalCount }) }}
        </Tag>
      </Space>
    </div>
  </div>
</template>

<style scoped lang="scss">
.batch-mode-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.batch-mode-switch {
  width: 100%;
}

.batch-mode-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.batch-mode-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 4px;
  border-block-start: 1px solid hsl(var(--border));
}

.batch-mode-count {
  color: hsl(var(--muted-foreground));
}
</style>
