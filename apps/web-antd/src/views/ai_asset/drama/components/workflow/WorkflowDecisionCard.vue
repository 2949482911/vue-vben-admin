<script lang="ts" setup name="WorkflowDecisionCard">
import type {
  WorkflowDecision,
  WorkflowDecisionOption,
} from '#/api/models/ai_asset_workflow';

import { Button, Card } from 'ant-design-vue';

defineProps<{
  decision?: WorkflowDecision;
  loading: boolean;
}>();

const emit = defineEmits<{
  decide: [option: WorkflowDecisionOption];
  refresh: [];
}>();

function optionType(option: WorkflowDecisionOption) {
  return option.style === 'primary' ? 'primary' : 'default';
}
</script>

<template>
  <Card v-if="decision" class="workflow-decision" :body-style="{ padding: '12px' }">
    <div class="workflow-decision__title">
      {{ decision.title || '需要你决定' }}
    </div>
    <div v-if="decision.message" class="workflow-decision__text">
      {{ decision.message }}
    </div>
    <div v-if="decision.options?.length" class="workflow-decision__actions">
      <Button
        v-for="option in decision.options"
        :key="option.action"
        :disabled="!decision.decisionId || loading"
        :loading="loading"
        :type="optionType(option)"
        @click="emit('decide', option)"
      >
        {{ option.label }}
      </Button>
    </div>
    <div v-else class="workflow-decision__text">
      暂无可用决策项。
      <Button size="small" type="link" @click="emit('refresh')">
        刷新状态
      </Button>
    </div>
  </Card>
</template>

<style scoped lang="scss">
.workflow-decision {
  width: 100%;
  background: color-mix(in srgb, hsl(var(--warning)) 5%, hsl(var(--card)));
  border-color: color-mix(
    in srgb,
    hsl(var(--warning)) 30%,
    hsl(var(--border))
  );

  &__title {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  &__text {
    font-size: 13px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
}
</style>
