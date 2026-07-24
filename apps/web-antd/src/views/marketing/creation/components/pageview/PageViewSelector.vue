<script setup lang="ts" name="PageViewSelector">
// 落地页选择组件 - 供后续全媒体批投公用
import type {AccountInfo, PageViewConfigData} from '#/views/marketing/creation/creation';
import {Alert, Button, Card} from 'ant-design-vue';
import {useVbenDrawer} from '@vben/common-ui';
import {ref, computed, watch} from 'vue';
import PageViewShow from '#/views/marketing/creation/components/pageview/PageViewShow.vue';
import PageViewDrawer from '#/views/marketing/creation/components/pageview/PageViewDrawer.vue';

const props = defineProps<{
  pageView: PageViewConfigData | null;
  accountInfo: AccountInfo[];
}>();

const emit = defineEmits(['update:pageView']);

const [PageViewDrawerComp, pageViewDrawerApi] = useVbenDrawer({
  connectedComponent: PageViewDrawer,
});

// 本地落地页数据
const localPageView = ref<PageViewConfigData>({
  config: {method: props.pageView?.config?.method || 'ALL'},
  data: new Map(),
});

// 计算总落地页数量
const totalCount = computed(() => {
  let total = 0;
  localPageView.value.data.forEach(items => {
    total += items.length;
  });
  return total;
});

// 打开抽屉
function openPageViewDrawerModal() {
  pageViewDrawerApi.setData({
    config: {method: localPageView.value.config.method},
    data: new Map(localPageView.value.data),
  });
  pageViewDrawerApi.open();
}

/**
 * 接收抽屉确认回调，更新本地数据并 emit 到最外层
 */
function updatePageView(data: PageViewConfigData) {
  localPageView.value = {
    config: {...data.config},
    data: new Map(data.data),
  };
  emit('update:pageView', {
    config: {...localPageView.value.config},
    data: new Map(localPageView.value.data),
  });
}

/**
 * 清空落地页
 */
function handleClear() {
  localPageView.value.data.clear();
  localPageView.value.config.method = 'ALL';
  emit('update:pageView', {
    config: {...localPageView.value.config},
    data: new Map(),
  });
}

// 监听父组件传入的 pageView 变化，实现回显
watch(
  () => props.pageView,
  (newPageView) => {
    if (newPageView && newPageView.data) {
      // 处理普通对象转换为 Map（复用策略组时 JSON 序列化后 Map 变成普通对象）
      const dataMap = newPageView.data instanceof Map
        ? newPageView.data
        : new Map(Object.entries(newPageView.data || {}));

      localPageView.value = {
        ...newPageView,
        config: {...newPageView.config},
        data: dataMap,
      };
    }
  },
  {immediate: true, deep: true},
);
</script>

<template>
  <div class="page-view-selector-container">
    <Card title="落地页" class="info-card">
      <div class="card-content">
        <template v-if="totalCount > 0">
          <PageViewShow :landing-page="localPageView" :account-info="accountInfo" />
        </template>
        <template v-else>
          <Alert type="error" message="请选择落地页" show-icon class="empty-alert" />
        </template>
      </div>
      <div class="card-footer">
        <Button v-if="totalCount > 0" type="link" danger @click="handleClear">清空</Button>
        <Button type="primary" @click="openPageViewDrawerModal">
          {{ totalCount > 0 ? '编辑' : '添加' }}
        </Button>
      </div>
    </Card>

    <PageViewDrawerComp :account-info="accountInfo" @update:page-view="updatePageView" />
  </div>
</template>

<style scoped lang="scss">
.page-view-selector-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.info-card {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }

  :deep(.ant-card-head) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px;
  }

  :deep(.ant-card-body) {
    padding: 16px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.empty-alert {
  margin: 8px 0;
}
</style>
