<script lang="ts" setup name="WorkflowComposer">
import type { WorkflowSubmitPayload } from './useWorkflowTask';

import type { WorkflowBrief } from '#/api/models/ai_asset_workflow';

import { computed, ref, watch } from 'vue';

import { SendOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Input,
  InputNumber,
  Segmented,
  Select,
  Switch,
  Tooltip,
} from 'ant-design-vue';

import { useAspectRatioDict } from '../../useAspectRatioDict';

const props = defineProps<{
  disabled: boolean;
  loading: boolean;
  novelId?: number | string;
  projectRatio?: string;
}>();

const emit = defineEmits<{ submit: [payload: WorkflowSubmitPayload] }>();

const ENDPOINT_AUTO = 'auto';

const ENDPOINT_OPTIONS = [
  { label: '按指令', value: ENDPOINT_AUTO },
  { label: '分镜+提示词', value: 'storyboard_prompt' },
  { label: '分镜图', value: 'storyboard_image' },
  { label: '视频', value: 'video' },
];

const { options: ratioOptions, ready: ratioReady } = useAspectRatioDict();

const promptText = ref('');
const quickEpisodeCount = ref<number>();
const quickMaxShots = ref<number>();
const quickRatio = ref('');
const ratioTouched = ref(false);
const quickEndpoint = ref(ENDPOINT_AUTO);
const quickAutoFinalize = ref(false);

const canSend = computed(
  () =>
    Boolean(props.novelId) &&
    !props.disabled &&
    !props.loading &&
    promptText.value.trim().length > 0,
);

const disabledReason = computed(() => {
  if (!props.novelId) {
    return '先选择项目';
  }
  if (props.disabled) {
    return '任务执行中，完成后可继续下单';
  }
  return '';
});

/**
 * 只有用户主动改过的快捷项才进入 overrides；
 * 自然语言意图始终优先，默认状态不得覆盖 Agent 解析。
 */
function buildOverrides(): WorkflowBrief {
  const overrides: WorkflowBrief = {};
  if (quickEpisodeCount.value !== undefined) {
    overrides.targetEpisodeCount = quickEpisodeCount.value;
  }
  if (typeof quickMaxShots.value === 'number') {
    overrides.maxShots = quickMaxShots.value;
  }
  if (quickEndpoint.value !== ENDPOINT_AUTO) {
    overrides.endpoint = quickEndpoint.value;
  }
  if (ratioTouched.value && quickRatio.value) {
    overrides.aspectRatio = quickRatio.value;
  }
  if (quickAutoFinalize.value) {
    overrides.autoFinalizeEntities = true;
  }
  return overrides;
}

function submit() {
  if (!canSend.value) {
    return;
  }
  emit('submit', {
    autoFinalizeEntities: quickAutoFinalize.value || undefined,
    message: promptText.value.trim(),
    overrides: buildOverrides(),
  });
}

function clear() {
  promptText.value = '';
}

defineExpose({ clear });

watch(
  () => props.projectRatio,
  (value) => {
    if (value) {
      quickRatio.value = value;
      ratioTouched.value = false;
    }
  },
  { immediate: true },
);

watch(
  ratioOptions,
  (options) => {
    if (!quickRatio.value && options.length) {
      quickRatio.value = options[0]?.value ?? '';
      ratioTouched.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="workflow-composer">
    <Input.TextArea
      v-model:value="promptText"
      :auto-size="{ maxRows: 4, minRows: 2 }"
      :disabled="disabled"
      placeholder="用自然语言描述这次出片任务，或使用下方快捷项"
    />
    <div class="workflow-composer__quick">
      <label class="workflow-quick">
        <span>集数</span>
        <InputNumber
          v-model:value="quickEpisodeCount"
          :disabled="disabled"
          :min="1"
          :precision="0"
          placeholder="按故事"
          size="small"
        />
      </label>
      <label class="workflow-quick">
        <span>镜头上限</span>
        <InputNumber
          v-model:value="quickMaxShots"
          :disabled="disabled"
          :min="1"
          :precision="0"
          placeholder="全量"
          size="small"
        />
      </label>
      <label class="workflow-quick">
        <span>比例</span>
        <Segmented
          v-model:value="quickRatio"
          :disabled="disabled || !ratioReady"
          :options="ratioOptions"
          size="small"
          @change="ratioTouched = true"
        />
      </label>
      <label class="workflow-quick">
        <span>终点</span>
        <Select
          v-model:value="quickEndpoint"
          :disabled="disabled"
          :options="ENDPOINT_OPTIONS"
          size="small"
        />
      </label>
      <label class="workflow-quick">
        <span>自动定稿</span>
        <Switch
          v-model:checked="quickAutoFinalize"
          :disabled="disabled"
          size="small"
        />
      </label>
      <span v-if="!ratioReady" class="workflow-composer__hint">
        画面比例字典未就绪
      </span>
      <span class="workflow-composer__spacer"></span>
      <Tooltip :title="disabledReason">
        <span>
          <Button
            :disabled="!canSend"
            :loading="loading"
            type="primary"
            @click="submit"
          >
            <template #icon><SendOutlined /></template>
            发送
          </Button>
        </span>
      </Tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.workflow-composer {
  flex: none;
  padding: 10px 12px;
  border-top: 1px solid hsl(var(--border));

  :deep(.ant-input) {
    font-size: 14px;
  }

  &__quick {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
  }

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__spacer {
    flex: 1;
  }
}

.workflow-quick {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  :deep(.ant-input-number) {
    width: 88px;
  }

  :deep(.ant-select) {
    min-width: 104px;
  }
}
</style>
