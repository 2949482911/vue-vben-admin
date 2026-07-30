<script setup lang="ts" name="AlertList">
/**
 * 智能告警列表
 *
 * 展示超成本、空耗、预算撞线、素材衰退、账户异常等告警
 */
import { computed } from 'vue';
import { Card, Empty, List, ListItem, Tag } from 'ant-design-vue';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';
import type { AlertItem, AlertType } from '#/api/models';

const props = defineProps<{
  /** 告警数据 */
  data: AlertItem[];
  /** 加载状态 */
  loading?: boolean;
}>();

// 告警类型标签配置
const typeConfig: Record<AlertType, { label: string; color: string }> = {
  over_cost: { label: '超成本', color: 'red' },
  empty_spend: { label: '空耗', color: 'orange' },
  budget_limit: { label: '预算撞线', color: 'volcano' },
  material_decline: { label: '素材衰退', color: 'gold' },
  account_anomaly: { label: '账户异常', color: 'magenta' },
};

// 级别图标
const levelIcon = {
  error: ExclamationCircleOutlined,
  warning: WarningOutlined,
  info: InfoCircleOutlined,
};

// 格式化时间
function formatTime(time: string): string {
  if (!time) return '';
  const d = new Date(time);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// 按时间倒序
const sortedData = computed(() =>
  [...props.data].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
);
</script>

<template>
  <Card title="智能告警" class="alert-card" :loading="loading">
    <Empty v-if="sortedData.length === 0 && !loading" description="暂无告警" />
    <List v-else :data-source="sortedData" size="small">
      <template #renderItem="{ item }">
        <ListItem class="alert-item">
          <div class="alert-content">
            <!-- 左侧图标 -->
            <div class="alert-icon">
              <component
                :is="levelIcon[item.level]"
                :style="{
                  color:
                    item.level === 'error'
                      ? '#ff4d4f'
                      : item.level === 'warning'
                        ? '#faad14'
                        : '#1668dc',
                }"
              />
            </div>

            <!-- 中间内容 -->
            <div class="alert-body">
              <div class="alert-header">
                <Tag
                  :color="typeConfig[item.type]?.color || 'default'"
                  :bordered="false"
                  class="alert-type-tag"
                >
                  {{ typeConfig[item.type]?.label || item.type }}
                </Tag>
                <span class="alert-title">{{ item.title }}</span>
              </div>
              <div class="alert-desc">{{ item.content }}</div>
              <div class="alert-meta">
                <span>{{ item.advertiserName }}</span>
                <span>{{ item.platform }}</span>
                <span>{{ formatTime(item.createdAt) }}</span>
              </div>
            </div>

            <!-- 右侧状态 -->
            <Tag
              v-if="item.status === 'unread'"
              color="processing"
              :bordered="false"
            >
              未读
            </Tag>
          </div>
        </ListItem>
      </template>
    </List>
  </Card>
</template>

<style scoped lang="scss">
.alert-card {
  :deep(.ant-card-body) {
    padding: 8px 16px;
    max-height: 400px;
    overflow-y: auto;
  }
}

.alert-item {
  padding: 12px 0 !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.alert-icon {
  font-size: 16px;
  padding-top: 2px;
  flex-shrink: 0;
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  .alert-title {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }
}

.alert-type-tag {
  font-size: 12px;
  flex-shrink: 0;
}

.alert-desc {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.5;
  margin-bottom: 4px;
}

.alert-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.35);
}
</style>
