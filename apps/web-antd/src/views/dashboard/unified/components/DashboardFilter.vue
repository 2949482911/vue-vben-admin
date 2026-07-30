<script setup lang="ts" name="DashboardFilter">
/**
 * 看板顶部筛选栏
 *
 * 提供日期范围、平台多选、账户选择三个筛选维度
 * 通过 defineExpose 暴露 getValues 方法供父组件调用
 */
import { ref } from 'vue';
import { Card, DatePicker, Select, Space } from 'ant-design-vue';
import dayjs, { type Dayjs } from 'dayjs';
import { Platform } from '#/constants/enums';

const { RangePicker } = DatePicker;

// 平台选项（从枚举中提取已对接的平台）
const platformOptions = [
  { label: '巨量引擎', value: Platform.BYTEDANCE },
  { label: '腾讯广告', value: Platform.TENCENT },
  { label: 'OPPO', value: Platform.OPPO },
  { label: 'VIVO', value: Platform.VIVO },
  { label: '华为商店', value: Platform.HUAWEI_STORE },
];

// 默认查询最近 7 天
const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs().subtract(6, 'day'),
  dayjs(),
]);

const selectedPlatforms = ref<string[]>([]);
const selectedAdvertisers = ref<string[]>([]);

/**
 * 获取当前筛选值
 */
function getValues() {
  return {
    dateRange: [
      dateRange.value[0]?.format('YYYY-MM-DD') || '',
      dateRange.value[1]?.format('YYYY-MM-DD') || '',
    ] as [string, string],
    platforms: selectedPlatforms.value,
    advertiserIds: selectedAdvertisers.value,
  };
}

defineExpose({ getValues });
</script>

<template>
  <Card class="dashboard-filter" :bordered="false">
    <Space :size="16" wrap>
      <!-- 日期范围 -->
      <div class="filter-item">
        <span class="filter-label">日期范围</span>
        <RangePicker
          v-model:value="dateRange"
          :allow-clear="false"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </div>

      <!-- 平台筛选 -->
      <div class="filter-item">
        <span class="filter-label">平台</span>
        <Select
          v-model:value="selectedPlatforms"
          mode="multiple"
          :options="platformOptions"
          placeholder="全部平台"
          allow-clear
          style="min-width: 200px"
        />
      </div>

      <!-- 账户筛选（后续对接账户接口后启用） -->
      <div class="filter-item">
        <span class="filter-label">账户</span>
        <Select
          v-model:value="selectedAdvertisers"
          mode="multiple"
          placeholder="全部账户"
          allow-clear
          style="min-width: 200px"
          :options="[]"
        />
      </div>
    </Space>
  </Card>
</template>

<style scoped lang="scss">
.dashboard-filter {
  margin-bottom: 16px;

  :deep(.ant-card-body) {
    padding: 16px 24px;
  }
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  white-space: nowrap;
}
</style>
