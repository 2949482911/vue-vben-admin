<script lang="ts" setup name="ScriptValidationModal">
/**
 * 剧本校验结果弹窗：按场次展示 error/warning，生成分镜被拦截时也复用此弹窗。
 * 上游是 EpisodeScriptView 的「剧本校验」与 BookWorkbench 的生成分镜守卫。
 */
import type { EpisodeScriptIssue } from '#/api/models/ai_asset';

import { computed } from 'vue';

import { Empty, Modal, Spin, Tag } from 'ant-design-vue';

const props = defineProps<{
  errors?: EpisodeScriptIssue[];
  validating?: boolean;
  warnings?: EpisodeScriptIssue[];
}>();

const open = defineModel<boolean>('open', { default: false });
const total = computed(
  () => (props.errors?.length ?? 0) + (props.warnings?.length ?? 0),
);

function sceneNo(issue: EpisodeScriptIssue) {
  return issue.sceneSeq ?? issue.seq;
}
</script>

<template>
  <Modal v-model:open="open" :footer="null" title="剧本校验" width="620px">
    <Spin :spinning="validating">
      <Empty
        v-if="!total"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        description="未返回校验问题；若生成分镜仍失败，请查看后端返回原因"
      />
      <div v-else class="script-check">
        <div
          v-for="(item, index) in errors ?? []"
          :key="`e-${index}`"
          class="script-check__row is-error"
        >
          <Tag :bordered="false" color="red">错误</Tag>
          <b>第 {{ sceneNo(item) ?? '?' }} 场</b>
          <span>{{ item.message }}</span>
        </div>
        <div
          v-for="(item, index) in warnings ?? []"
          :key="`w-${index}`"
          class="script-check__row is-warn"
        >
          <Tag :bordered="false" color="orange">警告</Tag>
          <b>第 {{ sceneNo(item) ?? '?' }} 场</b>
          <span>{{ item.message }}</span>
        </div>
      </div>
    </Spin>
  </Modal>
</template>

<style scoped lang="scss">
.script-check {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.script-check__row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 10px;
  font-size: 12px;
  background: hsl(var(--accent));
  border-radius: 8px;

  b {
    flex: none;
    min-width: 64px;
  }

  span {
    line-height: 1.6;
  }

  &.is-error span {
    color: hsl(var(--destructive));
  }

  &.is-warn span {
    color: hsl(var(--warning));
  }
}
</style>
