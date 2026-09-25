<script setup lang="ts">
import type { CreationTaskItem } from '#/api/models/marketing';

/**
 * 批投任务执行结果抽屉（通用，适配所有媒体平台）
 *
 * 抽屉由 vben 的 useVbenDrawer 承载，内容直接复用创编任务列表页的同一份详情面板
 * （creation_task/task_drawer_detail.vue），两处展示完全一致，只维护一份 UI。
 *
 * 父级用法：
 *   const [TaskResultDrawer, taskResultDrawerApi] = useVbenDrawer({
 *     connectedComponent: BatchTaskResultDrawer,
 *   });
 *   // 提交成功拿到 taskId 后：先赋值给 currentTask，再打开抽屉
 *   currentTask.value = { taskId, taskName, platform, projectId };
 *   taskResultDrawerApi.open();
 *
 *   <TaskResultDrawer :task="currentTask" @task-completed="onTaskCompleted" />
 *
 * 任务信息通过 prop 传入（不用 drawerApi.setData/getData），父级一改数据面板立即响应，
 * 提交新任务时面板会自动重新加载并重新开始轮询。
 *
 * 轮询：由详情面板内部完成 —— 进入面板立即查一次，之后每 3s 一次，
 *      直到接口返回终态（3 完成 / 4 失败 / 5 超时）或超过 200 次上限才停止。
 *      这里不销毁抽屉内容（destroyOnClose: false），所以关掉抽屉后仍会继续轮询到任务停止；
 *      父级把 task 置空（点「生成预览」开启新一轮配置）时面板卸载，轮询随之结束。
 */
import { computed } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import TaskDetailPanel from '#/views/marketing/creation/creation_task/task_drawer_detail.vue';

/** 结果层级：计划 / 广告组 / 广告 / 创意 */
type HiddenLayer = 'adGroup' | 'campaign' | 'creative' | 'promotion';

/** 抽屉入参：各平台提交成功后能拿到的任务信息 */
type BatchResultDrawerData = {
  taskId: string;
  taskName?: string;
  platform?: string;
  projectId?: string;
  /** 需要隐藏的结果层（如智擎版没有广告组 / 广告层） */
  hiddenLayers?: HiddenLayer[];
};

const props = defineProps<{
  /** 当前任务；提交成功后由父级赋值，置空代表开启新一轮配置 */
  task?: BatchResultDrawerData | null;
}>();

const emit = defineEmits<{
  /** 任务执行完毕（成功或失败），供父级刷新列表 */
  taskCompleted: [status: number];
}>();

/** 转成详情面板需要的任务结构（taskId → id） */
const panelTask = computed<CreationTaskItem | null>(() => {
  const data = props.task;
  if (!data?.taskId) return null;
  return {
    id: data.taskId,
    name: data.taskName,
    platform: data.platform,
    projectId: data.projectId,
  };
});

const [Drawer] = useVbenDrawer({
  class: 'w-[75%]',
  contentClass: 'p-5',
  // 关闭后不销毁内容，让详情面板继续轮询到任务停止
  destroyOnClose: false,
  footer: false,
  title: '批投任务执行结果',
});
</script>

<template>
  <Drawer>
    <TaskDetailPanel
      v-if="panelTask"
      :task="panelTask"
      :hidden-layers="task?.hiddenLayers"
      @task-completed="emit('taskCompleted', $event)"
    />
  </Drawer>
</template>
