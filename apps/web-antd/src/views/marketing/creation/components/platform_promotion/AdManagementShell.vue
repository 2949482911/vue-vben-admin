<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

/**
 * 媒体广告管理页壳层
 *
 * - 页头：媒体标识 + 标题 + 说明 + 「批量创建」跳批创
 * - 层级页签：下划线式，默认插槽按 tabs[].key 分发（key 即层级，如 campaign/adgroup/promotion）
 * - 页签切换通过 change 事件通知父级，父级负责刷新当前层级的列表
 */
import { Page } from '@vben/common-ui';

import { Button, Card, TabPane, Tabs, Tag, Typography } from 'ant-design-vue';

interface Props {
  /** 媒体展示名，如「巨量引擎」 */
  platformLabel: string;
  /** 层级页签：key 同时作为插槽名 */
  tabs: Array<{ key: string; label: string }>;
  /** 批创页路由，传入才展示「批量创建」按钮 */
  createPath?: string;
  /** 页头说明文案 */
  description?: string;
}

const props = withDefaults(defineProps<Props>(), {
  createPath: '',
  description: '',
});

const emit = defineEmits<{
  /** 层级页签切换 */
  change: [key: string];
}>();

const router = useRouter();
const activeKey = ref<string>(props.tabs[0]?.key ?? '');

const currentLevelLabel = computed(
  () => props.tabs.find((tab) => tab.key === activeKey.value)?.label ?? '',
);

const subtitle = computed(() =>
  [props.description, currentLevelLabel.value ? `当前层级 ${currentLevelLabel.value}` : '']
    .filter(Boolean)
    .join(' · '),
);

function handleTabChange(key: number | string) {
  activeKey.value = String(key);
  emit('change', String(key));
}

function openBatchCreate() {
  if (!props.createPath) return;
  router.push(props.createPath);
}
</script>

<template>
  <Page auto-content-height>
    <Card class="h-full" :body-style="{ height: '100%' }">
      <div class="flex h-full flex-col">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <Tag class="m-0" color="processing">{{ platformLabel }}</Tag>
            <div class="min-w-0">
              <div class="text-base font-medium leading-6">广告管理</div>
              <Typography.Text type="secondary" class="text-xs">
                {{ subtitle }}
              </Typography.Text>
            </div>
          </div>
          <Button v-if="createPath" type="primary" @click="openBatchCreate">
            批量创建
          </Button>
        </div>

        <Tabs
          v-model:active-key="activeKey"
          class="mt-4 min-h-0 flex-1"
          @change="handleTabChange"
        >
          <TabPane v-for="tab in tabs" :key="tab.key" :tab="tab.label" force-render>
            <slot :name="tab.key"></slot>
          </TabPane>
        </Tabs>
      </div>
    </Card>
  </Page>
</template>

<style scoped>
/* 让 Tabs 内容区撑满高度，配合表格 height:auto 实现表内滚动、分页固定底部 */
:deep(.ant-tabs) {
  display: flex;
  flex-direction: column;
}

:deep(.ant-tabs-content-holder) {
  flex: 1;
  min-height: 0;
}

:deep(.ant-tabs-content),
:deep(.ant-tabs-tabpane) {
  height: 100%;
}
</style>
