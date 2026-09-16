<script setup lang="ts" name="BatchCreateLayout">
// 批创工作台骨架（所有媒体通用）
//
// 高度契约（区域高度由容器决定，不由内容决定，选完配置不变高）：
//   ① 配置条   --bc-bar-h    固定 60px
//   ② 配置工作台            与预览区共同分配剩余高度，最小 420px
//   ③ 操作条   --bc-actions-h 固定 56px
//   ④ 预览区                与工作台共同分配剩余高度，最小 280px
//
// 卡片滚动契约：工作台内的 ant-card 必须表现为「flex 列 + body 占满剩余高度 + body 可滚动 + footer 固定」。
// 这里用 !important 统一兜住，避免各媒体卡片自己的 :deep(.ant-card-body) 覆盖掉滚动。
import { Page } from '@vben/common-ui';
</script>

<template>
  <Page auto-content-height>
    <div class="batch-create">
      <!-- ① 配置条：项目 / 媒体账户 / 模板 / 规则摘要 -->
      <section class="bc-bar">
        <div class="bc-bar-main">
          <slot name="config"></slot>
        </div>
      </section>

      <!-- ② 配置工作台：各列等高，列内滚动 -->
      <section class="bc-workbench">
        <slot name="workbench"></slot>
      </section>

      <!-- ③ 操作条：监测链接组 / 保存策略组 / 生成预览 / 提交审核 -->
      <section class="bc-actions">
        <slot name="actions"></slot>
      </section>

      <!-- ④ 预览区：占满剩余高度 -->
      <section class="bc-preview">
        <slot name="preview"></slot>
      </section>

      <slot></slot>
    </div>
  </Page>
</template>

<style scoped lang="scss">
.batch-create {
  --bc-bar-h: 60px;
  --bc-actions-h: 56px;

  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.bc-bar,
.bc-actions {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  align-items: center;
  height: var(--bc-bar-h);
  padding: 0 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.bc-bar-main {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.bc-actions {
  height: var(--bc-actions-h);
}

// 工作台与预览区共同分配 Page 剩余高度；工作台占更大比例，保证配置卡片有充足空间。
// 高度由 flex 算法决定，与卡片内容无关，因此选择完配置后不会「顶出去」。
.bc-workbench {
  flex: 1.5 1 420px;
  min-height: 420px;
  overflow: hidden;

  // 卡片滚动契约：工作台内的所有卡片强制采用 flex 列布局，
  // body 占满剩余高度并可滚动，footer 固定可见。
  :deep(.ant-card) {
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    max-height: 100% !important;
    overflow: hidden !important;
  }

  :deep(.ant-card-head) {
    flex-shrink: 0 !important;
  }

  :deep(.ant-card-body) {
    display: flex !important;
    flex: 1 1 0% !important;
    flex-direction: column !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-content) {
    flex: 1 1 0% !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-footer) {
    flex-shrink: 0 !important;
  }
}

.bc-preview {
  display: flex;
  flex: 1 1 280px;
  flex-direction: column;
  min-width: 0;
  min-height: 280px;
  overflow: hidden;
}
</style>
