<script setup lang="ts" name="AwemeConfigShow">
// 抖音号配置展示组件 - 展示已选抖音号信息
import { computed } from 'vue';
import { Space, Tag } from 'ant-design-vue';
import type { AwemeConfigData, AwemeDistributionRule } from '#/views/marketing/creation/bytedance/bytedance';

const { awemeConfig } = defineProps<{
  awemeConfig: AwemeConfigData;
}>();

const methodLabelMap: Record<AwemeDistributionRule, string> = {
  ALL_SAME: '所有广告用一个',
  PER_ACCOUNT: '每个账户一个',
  PER_PROJECT: '每个项目一个',
  PER_AD: '每个广告一个',
};

const totalCount = computed(() => {
  let total = 0;
  awemeConfig.data.forEach((items) => {
    total += items.length;
  });
  return total;
});

/** 收集所有已选抖音号（去重） */
const uniqueAwemeNames = computed(() => {
  const names: string[] = [];
  awemeConfig.data.forEach((items) => {
    items.forEach((item) => {
      if (item.awemeName && !names.includes(item.awemeName)) {
        names.push(item.awemeName);
      }
    });
  });
  return names;
});
</script>

<template>
  <Space direction="vertical" class="w-full" size="middle">
    <div class="method-info">
      <span class="method-label">分配方式：</span>
      <span class="method-value">
        {{ methodLabelMap[awemeConfig.config.method] || awemeConfig.config.method }}
      </span>
      <span class="method-count">（共 {{ totalCount }} 个分配）</span>
    </div>

    <div class="aweme-tags">
      <Tag v-for="name in uniqueAwemeNames" :key="name" color="green">
        {{ name }}
      </Tag>
    </div>
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

.aweme-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
