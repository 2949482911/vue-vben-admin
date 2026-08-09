<script setup lang="ts">
/**
 * 批量操作-任务进度面板（通用）
 *
 * 提交批量操作拿到 taskId 后，传入本组件即可自动轮询进度接口，
 * 展示进度条、任务状态、成功/失败统计和结果明细。
 */
import type { TaskBatchCenterProgressResponse } from '#/api/models/marketing';

import { taskCenterApi } from '#/api';
import { $t } from '#/locales';
import {
  Alert,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'ant-design-vue';
import { onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 批量操作任务ID */
    taskId: string | number;
    /** 轮询间隔（毫秒），默认 2000 */
    pollInterval?: number;
  }>(),
  {
    pollInterval: 2000,
  },
);

const emit = defineEmits<{
  /** 任务执行完毕（成功或失败），供父组件停止轮询/刷新列表 */
  taskCompleted: [status: number];
}>();

// ==================== 状态 ====================
const loading = ref(false);
const progress = ref<TaskBatchCenterProgressResponse | null>(null);
const error = ref<string | null>(null);
let pollTimer: ReturnType<typeof setInterval> | null = null;

// ==================== 状态映射 ====================
const statusMap: Record<number, { color: string; textKey: string }> = {
  1: { color: 'orange', textKey: 'marketing.taskCenter.taskStatus.pending' },
  2: { color: 'blue', textKey: 'marketing.taskCenter.taskStatus.processing' },
  3: { color: 'green', textKey: 'marketing.taskCenter.taskStatus.completed' },
  4: { color: 'red', textKey: 'marketing.taskCenter.taskStatus.failed' },
};

/** 进度百分比（后端返回，兜底本地计算） */
const percent = () => {
  const p = progress.value;
  if (!p) return 0;
  if (p.progressPercent != null) return Math.round(p.progressPercent);
  const total = Number(p.totalCount ?? 0);
  if (total === 0) return 0;
  const done = (Number(p.successCount ?? 0) + Number(p.failedCount ?? 0)) / total;
  return Math.round(done * 100);
};

/** 任务是否已结束 */
const isFinished = () => {
  const status = progress.value?.taskStatus;
  return status === 3 || status === 4;
};

/** 轮询一次 */
async function fetchProgress() {
  if (!props.taskId) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await taskCenterApi.fetchGetTaskProgress(props.taskId);
    progress.value = res;
    if (isFinished()) {
      stopPolling();
      emit('taskCompleted', res?.taskStatus ?? 3);
    }
  } catch (e: any) {
    error.value = e?.message || $t('marketing.promotionManager.progress.fetchError');
  } finally {
    loading.value = false;
  }
}

/** 开始轮询 */
function startPolling() {
  stopPolling();
  fetchProgress();
  pollTimer = setInterval(() => {
    fetchProgress();
  }, props.pollInterval);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// 任务ID变化时重新开始轮询
watch(
  () => props.taskId,
  (id) => {
    if (id) {
      progress.value = null;
      startPolling();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <Space direction="vertical" :size="12" class="w-full">
    <!-- 请求错误提示 -->
    <Alert v-if="error" type="error" :message="error" show-icon />

    <!-- 进度卡片 -->
    <Card v-if="progress" size="small">
      <Space direction="vertical" :size="12" class="w-full">
        <!-- 任务名称 + 状态 -->
        <Space :size="8" align="center">
          <Typography.Text strong>{{ progress.name }}</Typography.Text>
          <Tag :color="statusMap[progress.taskStatus ?? 2]?.color">
            {{ $t(statusMap[progress.taskStatus ?? 2]?.textKey || '') }}
          </Tag>
        </Space>

        <!-- 进度条 -->
        <Progress
          :percent="percent()"
          :status="
            progress.taskStatus === 4
              ? 'exception'
              : progress.taskStatus === 3
                ? 'success'
                : 'active'
          "
        />

        <!-- 统计 -->
        <Row :gutter="[8, 8]">
          <Col :span="6">
            <Statistic
              :title="$t('marketing.promotionManager.progress.submittedCount')"
              :value="progress.totalCount ?? 0"
            />
          </Col>
          <Col :span="6">
            <Statistic
              :title="$t('marketing.promotionManager.progress.successCount')"
              :value="progress.successCount ?? 0"
              :value-style="{ color: '#52c41a' }"
            />
          </Col>
          <Col :span="6">
            <Statistic
              :title="$t('marketing.promotionManager.progress.failedCount')"
              :value="progress.failedCount ?? 0"
              :value-style="{ color: '#ff4d4f' }"
            />
          </Col>
          <Col :span="6">
            <Statistic
              :title="$t('marketing.promotionManager.progress.pendingCount')"
              :value="progress.pendingCount ?? 0"
            />
          </Col>
        </Row>
      </Space>
    </Card>

    <!-- 结果明细卡片 -->
    <Card
      v-if="progress?.items?.length"
      size="small"
      :title="$t('marketing.promotionManager.progress.resultDetail')"
    >
      <List :data-source="progress.items" size="small">
        <template #renderItem="{ item }">
          <List.Item>
            <List.Item.Meta
              :title="item.platform"
              :description="(item.targetIds || []).join(', ') || '-'"
            />
            <Tag
              :color="
                item.result === 'SUCCESS'
                  ? 'green'
                  : item.result === 'FAILED'
                    ? 'red'
                    : 'default'
              "
            >
              {{
                item.result === 'SUCCESS'
                  ? $t('marketing.promotionManager.progress.success')
                  : item.result === 'FAILED'
                    ? $t('marketing.promotionManager.progress.failed')
                    : item.result || '-'
              }}
            </Tag>
          </List.Item>
        </template>
      </List>
    </Card>
  </Space>
</template>

<style scoped lang="scss"></style>
