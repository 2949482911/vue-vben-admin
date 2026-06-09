<script setup lang="ts" name="PageViewShow">
// 落地页展示组件 - 展示已选落地页信息

import {computed} from 'vue';
import {Space, Tag} from 'ant-design-vue';
import type {PageViewItem} from '#/api/models/assert';
import {RuleMethod} from '#/views/marketing/creation/creation_enums';

const {data, method} = defineProps<{
  data: Map<string, PageViewItem[]>;
  method: RuleMethod;
}>();

// 获取分配方式标签
function getMethodLabel(): string {
  switch (method) {
    case RuleMethod.ALL:
      return '全账户复用';
    case RuleMethod.ACCOUNT:
      return '按账户分配';
    default:
      return '平均分配';
  }
}

// 计算总落地页数量
const totalCount = computed(() => {
  let total = 0;
  data.forEach(items => {
    total += items.length;
  });
  return total;
});

// 获取条目列表
const entries = computed(() => {
  const result: Array<{key: string; items: PageViewItem[]}> = [];
  data.forEach((items, key) => {
    result.push({key, items});
  });
  return result;
});
</script>

<template>
  <Space direction="vertical" class="w-full" size="middle">
    <!-- 分配方式 -->
    <div class="method-info">
      <span class="method-label">分配方式：</span>
      <span class="method-value">{{ getMethodLabel() }}</span>
      <span class="method-count">（共 {{ totalCount }} 个落地页）</span>
    </div>

    <!-- 落地页列表 -->
    <template v-for="entry in entries" :key="entry.key">
      <div v-if="entry.items.length > 0" class="package-section">
        <div class="section-label">
          {{ method === RuleMethod.ALL ? '落地页' : `账户 ${entry.key} 的落地页` }}
        </div>
        <div class="package-tags">
          <Tag v-for="item in entry.items" :key="item.id" color="blue">
            {{ item.name }}
          </Tag>
        </div>
      </div>
    </template>
  </Space>
</template>

<style scoped lang="scss">
.method-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .method-label {
    font-weight: 500;
  }

  .method-value {
    font-weight: 500;
  }

  .method-count {
    opacity: 0.7;
  }
}

.package-section {
  .section-label {
    font-weight: 500;
    margin-bottom: 8px;
  }

  .package-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
