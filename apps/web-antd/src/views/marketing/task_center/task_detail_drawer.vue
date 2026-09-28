<script setup lang="ts">
import type { VxeGridProps } from "#/adapter/vxe-table";
import type {
  TaskBatchCenterDetailItem,
  TaskBatchCenterItem,
  TaskBatchCenterProgressResponse
} from "#/api/models/marketing";

import { computed, h, ref } from "vue";

import { useVbenDrawer } from "@vben/common-ui";
import { formatDateTime } from "@vben/utils";

import {
  Badge,
  Card,
  Col,
  Descriptions,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography
} from "ant-design-vue";
import dayjs from "dayjs";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { taskCenterApi } from "#/api";
import { $t } from "#/locales";

import { getBatchOperationLabel } from "../creation/promotion_manager/platformOptions";

/** 任务状态 → Tag 色 + i18n 子键，key 对应后端 taskStatus */
const TASK_STATUS_META: Record<number, { color: string; key: string }> = {
  1: { color: "warning", key: "pending" },
  2: { color: "processing", key: "processing" },
  3: { color: "success", key: "completed" },
  4: { color: "error", key: "failed" }
};

/* 语义色取 vben 设计 token，深色模式自动跟随 */
const COLOR_PRIMARY = "hsl(var(--primary))";
const COLOR_SUCCESS = "hsl(var(--success))";
const COLOR_FAIL = "hsl(var(--destructive))";
const COLOR_WARNING = "hsl(var(--warning))";
const COLOR_MUTED = "hsl(var(--muted-foreground))";

/** 当前主任务ID（由抽屉打开时注入） */
const taskId = ref<number>();

/**
 * 请求参数格式化：在展开行里按 JSON 缩进展示，
 * 比原来把整串 JSON 塞进单元格可读得多
 */
function formatRequestParams(requestParams?: Record<string, any>) {
  if (!requestParams || Object.keys(requestParams).length === 0) {
    return "-";
  }
  return JSON.stringify(requestParams, null, 2);
}

/**
 * 完成度环内的文案。
 * 注意 antd 的 format 是按位置参数调用的（`textFormatter(percent, successPercent)`），
 * 写成 `#format="{ percent }"` 插槽会从数字上解构，永远拿到 undefined → 恒显示 0%
 */
function ringFormat(percent?: number) {
  return h("div", { class: "leading-tight" }, [
    h(
      "div",
      { class: "font-mono text-base font-semibold" },
      `${Math.round(percent ?? 0)}%`
    ),
    h(
      "div",
      { class: "text-muted-foreground text-xs" },
      $t("marketing.taskCenter.columns.progress")
    )
  ]);
}

// ==================== 任务概览 / 失败诊断 ====================

/** 主任务概览：progress 接口一并返回全量明细，用于计数与失败原因聚合 */
const progressInfo = ref<TaskBatchCenterProgressResponse>();
const progressLoading = ref(false);

async function loadProgress() {
  if (!taskId.value) {
    return;
  }
  progressLoading.value = true;
  try {
    progressInfo.value = await taskCenterApi.fetchGetTaskProgress(taskId.value);
  } finally {
    progressLoading.value = false;
  }
}

const totalCount = computed(() => progressInfo.value?.totalCount ?? 0);
const successCount = computed(() => progressInfo.value?.successCount ?? 0);
const failedCount = computed(() => progressInfo.value?.failedCount ?? 0);
const pendingCount = computed(() => progressInfo.value?.pendingCount ?? 0);
const progressPercent = computed(() => progressInfo.value?.progressPercent ?? 0);

const statusMeta = computed(() => {
  const status = progressInfo.value?.taskStatus;
  return status === undefined ? undefined : TASK_STATUS_META[status];
});

const optionTypeLabel = computed(() =>
  getBatchOperationLabel(progressInfo.value?.optionType)
);

/** 完成度环：已完成=绿 / 失败=红 / 其余=主色 */
const ringColor = computed(() => {
  switch (progressInfo.value?.taskStatus) {
    case 3: {
      return COLOR_SUCCESS;
    }
    case 4: {
      return COLOR_FAIL;
    }
    default: {
      return COLOR_PRIMARY;
    }
  }
});

/**
 * 结果构成条用 Progress 的三段形态表达：
 * success.percent 画成功段（绿），success~percent 之间是 strokeColor（红=失败），剩余轨道即待处理
 */
const donePercent = computed(() =>
  totalCount.value
    ? ((successCount.value + failedCount.value) / totalCount.value) * 100
    : 0
);
const successPercent = computed(() =>
  totalCount.value ? (successCount.value / totalCount.value) * 100 : 0
);

/** 失败原因聚合：按 结果码 + 原因 归并，次数倒序 */
const failGroups = computed(() => {
  const groups = new Map<
    string,
    { code?: number; count: number; message: string }
  >();
  for (const item of progressInfo.value?.items ?? []) {
    if (item.result !== "FAILED") {
      continue;
    }
    const message = item.message || "-";
    const key = `${item.code ?? ""}|${message}`;
    const exist = groups.get(key);
    if (exist) {
      exist.count += 1;
    } else {
      groups.set(key, { code: item.code, count: 1, message });
    }
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
});

/** 某类失败占失败总数的比例 */
function failGroupPercent(count: number) {
  return failedCount.value ? Math.round((count / failedCount.value) * 100) : 0;
}

/** 计数为 0 时不显示语义色，避免「已完成」任务里 0 还标红 */
function metricValueStyle(value: number, color: string) {
  return { color: value === 0 ? COLOR_MUTED : color };
}

/** 起止时间差 */
const elapsedText = computed(() => {
  const { endTime, startTime } = progressInfo.value ?? {};
  if (!startTime || !endTime) {
    return "-";
  }
  const seconds = dayjs(endTime).diff(dayjs(startTime), "second");
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "-";
  }
  const minutes = Math.floor(seconds / 60);
  return minutes > 0
    ? $t("marketing.taskCenter.duration.minuteSecond", [minutes, seconds % 60])
    : $t("marketing.taskCenter.duration.second", [seconds]);
});

function formatTimeText(value?: string) {
  return value ? formatDateTime(value) : "-";
}

const gridOptions: VxeGridProps<TaskBatchCenterDetailItem> = {
  // 覆盖全局的 align: 'center'，两行结构的单元格左对齐更好读
  align: "left",
  columns: [
    {
      // 行展开：请求参数、完整目标ID 这类长内容放这里，不再挤进单元格
      align: "center",
      slots: { content: "expand" },
      type: "expand",
      width: 44
    },
    {
      field: "result",
      slots: { default: "result" },
      title: $t("marketing.taskCenter.columns.result"),
      width: 108
    },
    {
      field: "targetIds",
      slots: { default: "targetIds" },
      title: $t("marketing.taskCenter.columns.targetIds"),
      minWidth: 200
    },
    {
      field: "message",
      slots: { default: "reason" },
      title: $t("marketing.taskCenter.columns.message"),
      minWidth: 220
    },
    {
      field: "createTime",
      formatter: ({ cellValue }) => (cellValue ? formatDateTime(cellValue) : "-"),
      title: $t("marketing.taskCenter.columns.createTime"),
      width: 170
    }
  ],
  expandConfig: {
    // 内容留白交给插槽自己控制，避免和卡片内边距叠加
    padding: false
  },
  rowConfig: {
    isHover: true,
    keyField: "id",
    useKey: true
  },
  height: "auto",
  // 全局配置是 showOverflow: true（单行省略），会把单元格里的第二行直接裁掉；
  // 这里的单元格都是「主信息 + 次信息」两行结构，必须放开让其按内容自适应行高
  showOverflow: false,
  proxyConfig: {
    // 抽屉打开后再手动加载，避免未打开时发起无效请求
    autoLoad: false,
    ajax: {
      query: async ({ page }) => {
        return await taskCenterApi.fetchGetTaskBatchCenterDetailList({
          taskId: taskId.value as number,
          page: page.currentPage,
          pageSize: page.pageSize
        });
      }
    }
  },
  pagerConfig: {
    enabled: true
  },
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    zoom: true
  }
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const [Drawer, drawerApi] = useVbenDrawer({
  class: "w-[880px]",
  closeOnPressEscape: true,
  // 概览卡 / 失败诊断卡按内容高度固定，明细表吃掉剩余高度
  contentClass: "flex flex-col gap-4",
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 通过 drawerApi.setData 注入主任务行数据
      const data = drawerApi.getData() as TaskBatchCenterItem;
      taskId.value = data?.id as unknown as number | undefined;
      // 列表行本身带全部概览字段，先铺底，避免进度接口返回前整卡都是 0；
      // 接口返回后整体覆盖，两边同名字段含义一致
      progressInfo.value = {
        ...data,
        taskId: taskId.value
      } as TaskBatchCenterProgressResponse;
    }
  },
  onOpened() {
    // 打开动画结束后 Grid 已挂载，手动加载任务概览与详情
    loadProgress();
    gridApi.reload();
  }
});
</script>

<template>
  <Drawer :title="$t('marketing.taskCenter.detailTitle')">
    <!-- ① 任务概览 -->
    <Card :loading="progressLoading" class="shrink-0">
      <div class="flex items-start gap-4">
        <div class="min-w-0 flex-1">
          <div class="text-muted-foreground font-mono text-xs">
            TASK-{{ progressInfo?.taskId ?? "-" }}
          </div>
          <div class="mt-1 mb-2.5 text-base leading-snug font-semibold">
            {{ progressInfo?.name || "-" }}
          </div>
          <Space :size="6" wrap>
            <Tag v-if="statusMeta" :color="statusMeta.color">
              {{ $t(`marketing.taskCenter.taskStatus.${statusMeta.key}`) }}
            </Tag>
            <Tag v-if="optionTypeLabel">{{ optionTypeLabel }}</Tag>
            <Tag v-if="progressInfo?.platform">{{ progressInfo.platform }}</Tag>
          </Space>
        </div>

        <Progress
          :format="ringFormat"
          :percent="progressPercent"
          :stroke-color="ringColor"
          :stroke-width="7"
          :width="92"
          type="circle"
        />
      </div>

      <!-- 结果构成：成功 / 失败 / 待处理 -->
      <Progress
        :percent="donePercent"
        :show-info="false"
        :stroke-color="COLOR_FAIL"
        :stroke-width="8"
        :success="{ percent: successPercent, strokeColor: COLOR_SUCCESS }"
        class="mt-4"
      />

      <Space :size="20" class="mt-2" wrap>
        <Badge
          :color="COLOR_SUCCESS"
          :text="`${$t('marketing.taskCenter.result.success')} ${successCount}`"
        />
        <Badge
          :color="COLOR_FAIL"
          :text="`${$t('marketing.taskCenter.result.failed')} ${failedCount}`"
        />
        <Badge
          :color="COLOR_WARNING"
          :text="`${$t('marketing.taskCenter.columns.pendingCount')} ${pendingCount}`"
        />
      </Space>

      <Row :gutter="16" class="border-border mt-4 border-t pt-3">
        <Col :span="6">
          <Statistic
            :title="$t('marketing.taskCenter.columns.totalCount')"
            :value="totalCount"
          />
        </Col>
        <Col :span="6">
          <Statistic
            :title="$t('marketing.taskCenter.columns.successCount')"
            :value="successCount"
            :value-style="metricValueStyle(successCount, COLOR_SUCCESS)"
          />
        </Col>
        <Col :span="6">
          <Statistic
            :title="$t('marketing.taskCenter.columns.failedCount')"
            :value="failedCount"
            :value-style="metricValueStyle(failedCount, COLOR_FAIL)"
          />
        </Col>
        <Col :span="6">
          <Statistic
            :title="$t('marketing.taskCenter.columns.pendingCount')"
            :value="pendingCount"
            :value-style="metricValueStyle(pendingCount, COLOR_WARNING)"
          />
        </Col>
      </Row>

      <Descriptions :column="3" class="mt-3" size="small">
        <Descriptions.Item :label="$t('marketing.taskCenter.columns.startTime')">
          {{ formatTimeText(progressInfo?.startTime) }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('marketing.taskCenter.columns.endTime')">
          {{ formatTimeText(progressInfo?.endTime) }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('marketing.taskCenter.elapsed')">
          {{ elapsedText }}
        </Descriptions.Item>
      </Descriptions>
    </Card>

    <!-- ② 失败诊断：按聚合结果判断，进度接口未返回时不显示空壳 -->
    <Card
      v-if="!progressLoading && failGroups.length > 0"
      class="fail-card shrink-0"
    >
      <template #title>
        <Space :size="8">
          <Badge status="error" />
          <span>
            {{
              $t("marketing.taskCenter.failSummary", [
                failedCount,
                failGroups.length
              ])
            }}
          </span>
        </Space>
      </template>

      <List
        :data-source="failGroups"
        :split="false"
        class="fail-list"
        size="small"
      >
        <template #renderItem="{ item }">
          <List.Item>
            <div class="flex w-full items-center gap-3">
              <Tag class="mr-0! shrink-0 font-mono">{{ item.code ?? "-" }}</Tag>
              <span class="min-w-0 flex-1">{{ item.message }}</span>
              <span class="text-muted-foreground shrink-0 font-mono text-xs">
                {{
                  $t("marketing.taskCenter.failStat", [
                    item.count,
                    failGroupPercent(item.count)
                  ])
                }}
              </span>
            </div>
          </List.Item>
        </template>
      </List>
    </Card>

    <!-- ③ 提交明细：给定最小高度，抽屉里被上面两张卡挤完后表格不会过矮 -->
    <div class="min-h-[400px] flex-1">
      <Grid>
        <!-- 结果：标签 + 结果码 -->
        <template #result="{ row }">
          <Tag v-if="row.result === 'SUCCESS'" color="green">
            {{ $t("marketing.taskCenter.result.success") }}
          </Tag>
          <Tag v-else-if="row.result === 'FAILED'" color="red">
            {{ $t("marketing.taskCenter.result.failed") }}
          </Tag>
          <span v-else>{{ row.result || "-" }}</span>
          <div class="text-muted-foreground mt-1 font-mono text-xs">
            {{ $t("marketing.taskCenter.columns.code") }} {{ row.code ?? "-" }}
          </div>
        </template>

        <!-- 目标ID：前 2 个用标签展示，其余折叠成 +N，完整列表在展开行 -->
        <template #targetIds="{ row }">
          <div class="flex flex-wrap items-center gap-1">
            <Tag
              v-for="id in (row.targetIds ?? []).slice(0, 2)"
              :key="id"
              class="mr-0! font-mono"
            >
              {{ id }}
            </Tag>
            <span
              v-if="(row.targetIds?.length ?? 0) > 2"
              class="text-muted-foreground font-mono text-xs"
            >
              +{{ (row.targetIds?.length ?? 0) - 2 }}
            </span>
            <span
              v-if="!row.targetIds?.length"
              class="text-muted-foreground"
            >
              -
            </span>
          </div>
          <div class="text-muted-foreground mt-1 text-xs">
            {{ row.platform || "-" }} · {{ getBatchOperationLabel(row.optionType) }}
          </div>
        </template>

        <!-- 失败原因 + 请求ID -->
        <template #reason="{ row }">
          <Typography.Text
            :type="row.result === 'FAILED' ? 'danger' : 'secondary'"
            class="text-xs"
          >
            {{ row.message || "-" }}
          </Typography.Text>
          <div class="text-muted-foreground mt-1 font-mono text-xs">
            {{ row.requestId || "-" }}
          </div>
        </template>

        <!-- 展开行：请求参数与完整目标ID -->
        <template #expand="{ row }">
          <div class="flex flex-col gap-3 p-3">
            <div>
              <div class="text-muted-foreground mb-1 text-xs font-medium">
                {{ $t("marketing.taskCenter.columns.requestParams") }}
              </div>
              <pre class="param-pre font-mono">{{
                formatRequestParams(row.requestParams)
              }}</pre>
            </div>
            <div>
              <div class="text-muted-foreground mb-1 text-xs font-medium">
                {{ $t("marketing.taskCenter.columns.targetIds") }}（{{
                  row.targetIds?.length ?? 0
                }}）
              </div>
              <div class="flex flex-wrap items-center gap-1">
                <Tag
                  v-for="id in row.targetIds ?? []"
                  :key="id"
                  class="mr-0! font-mono"
                >
                  {{ id }}
                </Tag>
                <span
                  v-if="!row.targetIds?.length"
                  class="text-muted-foreground"
                >
                  -
                </span>
              </div>
            </div>
          </div>
        </template>
      </Grid>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
/* 失败诊断卡：用 token 的 destructive 做轻量描边，不整块铺红 */
.fail-card {
  border-color: hsl(var(--destructive) / 32%);
  background:
    linear-gradient(
      hsl(var(--destructive) / 4%),
      hsl(var(--destructive) / 4%)
    ),
    hsl(var(--card));
}

/* 失败原因较多时卡片内部滚动，避免把明细表挤没 */
.fail-list {
  max-height: 220px;
  overflow-y: auto;
}

/* 展开行里的请求参数：保留 JSON 缩进，超宽时横向滚动而不是撑破抽屉 */
.param-pre {
  padding: 10px 12px;
  margin: 0;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.7;
  background: hsl(var(--muted) / 55%);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}
</style>
