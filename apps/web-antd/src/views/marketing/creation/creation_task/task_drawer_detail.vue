<script setup lang="ts">
// 批投任务详情抽屉 - 通用组件，适配所有平台
import { ref, watch, onBeforeUnmount, computed } from 'vue';
import { Descriptions, Tag, Progress, Empty, Spin, Alert } from 'ant-design-vue';
import { creationTaskApi } from '#/api';
import type { CreationTaskItem } from '#/api/models/marketing';

const props = defineProps<{
  /** 任务数据 */
  task: CreationTaskItem;
  /** 是否自动轮询（处理中的任务） */
  autoPoll?: boolean;
}>();

// 任务结果数据
const loading = ref(false);
const taskResult = ref<any>(null);
const error = ref<string | null>(null);
let pollTimer: ReturnType<typeof setInterval> | null = null;

// 状态映射
const statusMap: Record<number, { color: string; text: string }> = {
  1: { color: 'orange', text: '待处理' },
  2: { color: 'blue', text: '处理中' },
  3: { color: 'green', text: '已完成' },
  4: { color: 'red', text: '失败' },
};

/** 计算任务进度百分比 */
const progressPercent = computed(() => {
  const item = props.task;
  if (!item) return 0;

  const totalCommit =
    (Number(item.commitCampaignCount) || 0) +
    (Number(item.commitAdGroupCount) || 0) +
    (Number(item.commitPromotionCount) || 0) +
    (Number(item.commitCreativeCount) || 0);

  const totalSuccess =
    (Number(item.successCampaignCount) || 0) +
    (Number(item.successAdGroupCount) || 0) +
    (Number(item.successPromotionCount) || 0) +
    (Number(item.successCreativeCount) || 0);

  if (totalCommit === 0) return 0;
  return Math.round((totalSuccess / totalCommit) * 100);
});

/** 解析结果数据为表格行 */
function parseResultData(
  respData: any,
  resultType: 'campaign' | 'adgroup' | 'promotion' | 'creative'
) {
  if (!respData) return [];

  const rows: Array<{
    advertiserId: string;
    index: number;
    parentId?: string;
    resultId?: string;
    code: number;
    message: string;
    requestId?: string;
  }> = [];

  Object.entries(respData).forEach(([advertiserId, items]) => {
    if (!items || typeof items !== 'object') return;
    Object.entries(items as object).forEach(([index, detail]) => {
      const d = detail as any;
      let resultId: string | undefined;
      let parentId: string | undefined;

      switch (resultType) {
        case 'campaign':
          resultId = d.campaignId;
          break;
        case 'adgroup':
          resultId = d.adgroupId;
          parentId = d.campaignId;
          break;
        case 'promotion':
          resultId = d.promotionId;
          parentId = d.adgroupId || d.campaignId;
          break;
        case 'creative':
          resultId = d.creativeId;
          break;
      }

      rows.push({
        advertiserId,
        index: Number(index),
        parentId,
        resultId,
        code: d.code || 0,
        message: d.message || '',
        requestId: d.requestId,
      });
    });
  });

  return rows;
}

const campaignRows = computed(() => parseResultData(taskResult.value?.campaignResp, 'campaign'));
const adGroupRows = computed(() => parseResultData(taskResult.value?.adGroupResp, 'adgroup'));
const promotionRows = computed(() => parseResultData(taskResult.value?.promotionResp, 'promotion'));
const creativeRows = computed(() => parseResultData(taskResult.value?.creativeResp, 'creative'));

/** 是否有结果数据 */
const hasResults = computed(() => {
  return campaignRows.value.length > 0 ||
    adGroupRows.value.length > 0 ||
    promotionRows.value.length > 0;
});

/** 加载任务结果 */
async function fetchTaskResult() {
  if (!props.task?.id) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await creationTaskApi.fetchVivoSubmitResult({ id: String(props.task.id) });
    taskResult.value = res;
  } catch (e: any) {
    error.value = e?.message || '获取任务结果失败';
  } finally {
    loading.value = false;
  }
}

/** 开始轮询 */
function startPolling() {
  stopPolling();
  const taskStatus = props.task?.taskStatus;
  // 只有待处理或处理中才轮询
  if (taskStatus === 1 || taskStatus === 2) {
    pollTimer = setInterval(() => {
      fetchTaskResult();
    }, 3000);
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// 组件挂载时加载
watch(
  () => props.task?.id,
  (id) => {
    if (id) {
      fetchTaskResult();
      if (props.autoPoll !== false) {
        startPolling();
      }
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  stopPolling();
});

/** 结果码颜色 */
function getCodeColor(code: number) {
  if (code === 0) return 'green';
  if (code === 9) return 'orange';
  return 'red';
}

function getCodeText(code: number) {
  if (code === 0) return '成功';
  if (code === 9) return '已清理';
  return '失败';
}
</script>

<template>
  <div class="task-detail-drawer">
    <!-- 加载状态 -->
    <Spin :spinning="loading" tip="加载中...">
      <!-- 错误提示 -->
      <Alert v-if="error" type="error" :message="error" show-icon class="mb-4" />

      <!-- 任务基本信息 -->
      <Descriptions :column="2" size="small" bordered class="mb-4">
        <Descriptions.Item label="任务ID">{{ task.id }}</Descriptions.Item>
        <Descriptions.Item label="任务名称">{{ task.name }}</Descriptions.Item>
        <Descriptions.Item label="所属平台">{{ task.platform }}</Descriptions.Item>
        <Descriptions.Item label="项目ID">{{ task.projectId }}</Descriptions.Item>
        <Descriptions.Item label="任务状态">
          <Tag :color="statusMap[task.taskStatus as number]?.color">
            {{ statusMap[task.taskStatus as number]?.text || '未知' }}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="开始时间">{{ task.startTime || '-' }}</Descriptions.Item>
        <Descriptions.Item label="结束时间">{{ task.endTime || '-' }}</Descriptions.Item>
        <Descriptions.Item label="提交账户数">{{ task.commitAdvertiserCount || 0 }}</Descriptions.Item>
      </Descriptions>

      <!-- 进度概览 -->
      <div class="mb-4 rounded-md bg-gray-50 p-4 dark:bg-gray-800">
        <div class="mb-2 text-sm font-medium">任务执行进度</div>
        <Progress :percent="progressPercent" :status="task.taskStatus === 4 ? 'exception' : undefined" />
        <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 md:grid-cols-4">
          <div>
            计划: <span class="font-medium text-green-600">{{ task.successCampaignCount || 0 }}</span>
            / {{ task.commitCampaignCount || 0 }}
          </div>
          <div>
            广告组: <span class="font-medium text-green-600">{{ task.successAdGroupCount || 0 }}</span>
            / {{ task.commitAdGroupCount || 0 }}
          </div>
          <div>
            广告: <span class="font-medium text-green-600">{{ task.successPromotionCount || 0 }}</span>
            / {{ task.commitPromotionCount || 0 }}
          </div>
          <div>
            创意: <span class="font-medium text-green-600">{{ task.successCreativeCount || 0 }}</span>
            / {{ task.commitCreativeCount || 0 }}
          </div>
        </div>
      </div>

      <!-- 执行详情 -->
      <Empty v-if="taskResult && !hasResults" description="暂无执行结果数据" />

      <!-- 计划层结果 -->
      <div v-if="campaignRows.length" class="mb-4">
        <div class="mb-2 text-sm font-medium">计划（广告组）创建结果</div>
        <div class="overflow-x-auto">
          <table class="min-w-full border text-xs">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="border px-2 py-1 text-left">账户ID</th>
                <th class="border px-2 py-1 text-left">序号</th>
                <th class="border px-2 py-1 text-left">计划ID</th>
                <th class="border px-2 py-1 text-left">结果码</th>
                <th class="border px-2 py-1 text-left">消息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in campaignRows" :key="`campaign-${i}`" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="border px-2 py-1">{{ row.advertiserId }}</td>
                <td class="border px-2 py-1">{{ row.index }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.resultId || '-' }}</td>
                <td class="border px-2 py-1">
                  <Tag :color="getCodeColor(row.code)">{{ getCodeText(row.code) }}</Tag>
                </td>
                <td class="border px-2 py-1 max-w-[200px] truncate" :title="row.message">{{ row.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 广告组层结果 -->
      <div v-if="adGroupRows.length" class="mb-4">
        <div class="mb-2 text-sm font-medium">广告组创建结果</div>
        <div class="overflow-x-auto">
          <table class="min-w-full border text-xs">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="border px-2 py-1 text-left">账户ID</th>
                <th class="border px-2 py-1 text-left">序号</th>
                <th class="border px-2 py-1 text-left">父计划ID</th>
                <th class="border px-2 py-1 text-left">广告组ID</th>
                <th class="border px-2 py-1 text-left">结果码</th>
                <th class="border px-2 py-1 text-left">消息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in adGroupRows" :key="`adgroup-${i}`" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="border px-2 py-1">{{ row.advertiserId }}</td>
                <td class="border px-2 py-1">{{ row.index }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.parentId || '-' }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.resultId || '-' }}</td>
                <td class="border px-2 py-1">
                  <Tag :color="getCodeColor(row.code)">{{ getCodeText(row.code) }}</Tag>
                </td>
                <td class="border px-2 py-1 max-w-[200px] truncate" :title="row.message">{{ row.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 广告/推广层结果 -->
      <div v-if="promotionRows.length" class="mb-4">
        <div class="mb-2 text-sm font-medium">广告（推广）创建结果</div>
        <div class="overflow-x-auto">
          <table class="min-w-full border text-xs">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="border px-2 py-1 text-left">账户ID</th>
                <th class="border px-2 py-1 text-left">序号</th>
                <th class="border px-2 py-1 text-left">父级ID</th>
                <th class="border px-2 py-1 text-left">广告ID</th>
                <th class="border px-2 py-1 text-left">结果码</th>
                <th class="border px-2 py-1 text-left">消息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in promotionRows" :key="`promotion-${i}`" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="border px-2 py-1">{{ row.advertiserId }}</td>
                <td class="border px-2 py-1">{{ row.index }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.parentId || '-' }}</td>
                <td class="border px-2 py-1 font-mono text-blue-600">{{ row.resultId || '-' }}</td>
                <td class="border px-2 py-1">
                  <Tag :color="getCodeColor(row.code)">{{ getCodeText(row.code) }}</Tag>
                </td>
                <td class="border px-2 py-1 max-w-[200px] truncate" :title="row.message">{{ row.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Spin>
  </div>
</template>

<style scoped lang="scss">
.task-detail-drawer {
  :deep(.ant-descriptions-item-label) {
    width: 100px;
  }

  table {
    th, td {
      white-space: nowrap;
    }
  }
}
</style>
