<script setup lang="ts" name="TitleSelector">
// 标题包选择组件 - 供后续全媒体批投公用
import type {AccountInfo, TitlePackageConfigData} from '#/views/marketing/creation/creation';
import {Card, Alert, Space, Button, Divider} from 'ant-design-vue';
import {useVbenDrawer} from '@vben/common-ui';
import {ref, computed, watch} from 'vue';
import TitlePackageShow from '#/views/marketing/creation/components/title/TitlePackageShow.vue';
import TitlePackageDrawer from '#/views/marketing/creation/components/title/TitlePackageDrawer.vue';

const props = defineProps<{
  titlePackage: TitlePackageConfigData | null;
  accountInfo: AccountInfo[];
}>();

const emit = defineEmits(['update:titlePackage']);

const [TitlePackageDrawerComp, titlePackageDrawerApi] = useVbenDrawer({
  connectedComponent: TitlePackageDrawer,
});

// 本地标题包数据
const localTitlePackage = ref<TitlePackageConfigData>({
  config: {method: props.titlePackage?.config?.method || 'ALL'},
  data: new Map(),
});

// 计算总标题包数量
const totalCount = computed(() => {
  let total = 0;
  localTitlePackage.value.data.forEach(items => {
    total += items.length;
  });
  return total;
});

// 打开抽屉
function openTitlePackageDrawerModal() {
  titlePackageDrawerApi.setData({
    config: {method: localTitlePackage.value.config.method},
    data: new Map(localTitlePackage.value.data),
  });
  titlePackageDrawerApi.open();
}

/**
 * 接收抽屉确认回调，更新本地数据并 emit 到最外层
 */
function updateTitlePackage(data: TitlePackageConfigData) {
  localTitlePackage.value = {
    config: {...data.config},
    data: new Map(data.data),
  };
  emit('update:titlePackage', {
    config: {...localTitlePackage.value.config},
    data: new Map(localTitlePackage.value.data),
  });
}

/**
 * 清空标题包
 */
function handleClear() {
  localTitlePackage.value.data.clear();
  localTitlePackage.value.config.method = 'ALL';
  emit('update:titlePackage', {
    config: {...localTitlePackage.value.config},
    data: new Map(),
  });
}

// 监听父组件传入的 titlePackage 变化，实现回显
watch(
  () => props.titlePackage,
  (newPackage) => {
    if (newPackage && newPackage.data) {
      // 处理普通对象转换为 Map（复用策略组时 JSON 序列化后 Map 变成普通对象）
      const dataMap = newPackage.data instanceof Map
        ? newPackage.data
        : new Map(Object.entries(newPackage.data || {}));

      localTitlePackage.value = {
        ...newPackage,
        config: {...newPackage.config},
        data: dataMap,
      };
    }
  },
  {immediate: true, deep: true},
);
</script>

<template>
  <div>
    <Card title="标题包">
      <Divider type="horizontal" />
      <template v-if="totalCount > 0">
        <TitlePackageShow :data="localTitlePackage.data" :method="localTitlePackage.config.method" />
        <Space align="center" class="w-full justify-center">
          <Button type="link" danger @click="handleClear">清空</Button>
          <Button type="primary" @click="openTitlePackageDrawerModal">编辑</Button>
        </Space>
      </template>

      <template v-else>
        <Alert type="error" message="请选择标题包" show-icon />
        <Divider type="horizontal" />
        <Space align="center" class="w-full justify-center">
          <Button type="primary" @click="openTitlePackageDrawerModal">添加</Button>
        </Space>
      </template>
    </Card>

    <TitlePackageDrawerComp :account-info="accountInfo" @update:title-package="updateTitlePackage" />
  </div>
</template>

<style scoped lang="scss">
</style>
