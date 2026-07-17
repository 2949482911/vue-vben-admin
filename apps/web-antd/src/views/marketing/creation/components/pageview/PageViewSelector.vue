<script setup lang="ts" name="PageViewSelector">
// 落地页选择组件 - 供后续全媒体批投公用
import type {AccountInfo, PageViewConfigData} from '#/views/marketing/creation/creation';
import {Card, Alert, Space, Button, Divider} from 'ant-design-vue';
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
  <div>
    <Card title="落地页">
      <template v-if="totalCount > 0">
        <PageViewShow :landing-page="localPageView" :account-info="accountInfo" />
        <Divider type="horizontal" />
        <Space align="center" class="w-full justify-center">
          <Button type="link" danger @click="handleClear">清空</Button>
          <Button type="primary" @click="openPageViewDrawerModal">编辑</Button>
        </Space>
      </template>
      <template v-else>
        <Alert type="error" message="请选择落地页" show-icon />
        <Divider type="horizontal" />
        <Space align="center" class="w-full justify-center">
          <Button type="primary" @click="openPageViewDrawerModal">添加</Button>
        </Space>
      </template>
    </Card>

    <PageViewDrawerComp :account-info="accountInfo" @update:page-view="updatePageView" />
  </div>
</template>

<style scoped lang="scss">
</style>
