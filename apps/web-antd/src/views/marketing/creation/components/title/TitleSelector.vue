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
  <div class="title-selector-container">
    <Card title="标题包" class="info-card">
      <div class="card-content">
        <template v-if="totalCount > 0">
          <TitlePackageShow :data="localTitlePackage.data" :method="localTitlePackage.config.method" />
        </template>

        <template v-else>
          <Alert type="error" message="请选择标题包" show-icon class="empty-alert" />
        </template>
      </div>
      <div class="card-footer">
        <Button v-if="totalCount > 0" type="link" danger @click="handleClear">清空</Button>
        <Button type="primary" @click="openTitlePackageDrawerModal">
          {{ totalCount > 0 ? "编辑" : "添加" }}
        </Button>
      </div>
    </Card>

    <TitlePackageDrawerComp :account-info="accountInfo" @update:title-package="updateTitlePackage" />
  </div>
</template>

<style scoped lang="scss">
.title-selector-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info-card {
  width: 100%;
  height: 100%;
  min-height: 616px; // 固定最小高度，匹配营销单元（300px * 2 + 16px gap）
  
  // Card 样式优化
  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }
  
  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px; // Card 标题固定高度
  }
  
  .ant-card-body {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
  min-height: 150px; // 增大内容区域最小高度，确保有足够空间显示内容
}

.card-footer {
  display: flex;
  justify-content: center; // 居中对齐
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: auto; // 自动推到底部
}

.empty-alert {
  margin: 8px 0;
}
</style>
