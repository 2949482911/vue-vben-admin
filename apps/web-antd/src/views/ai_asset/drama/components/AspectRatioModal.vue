<script lang="ts" setup name="DramaAspectRatioModal">
/**
 * 项目画面比例（P2 契约）。
 *
 * 链路位置：短剧工作台顶栏「画面比例」→ 本弹窗 → v2/project/novels/{novelId}/aspect-ratio。
 * 可选比例只读系统字典 ai_aspect_ratio；字典未就绪时禁用并显示「待接入」，不内置比例列表。
 */
import { computed, ref, watch } from 'vue';

import { Alert, Button, Modal, Radio } from 'ant-design-vue';

import { aiAssetProjectApi } from '#/api/core/ai_asset_project';

import { formatApiError, parseApiError } from '../error';
import { useAspectRatioDict } from '../useAspectRatioDict';

const props = defineProps<{
  novelId?: number | string;
  open: boolean;
  value: string;
}>();

const emit = defineEmits<{
  saved: [value: string];
  'update:open': [value: boolean];
}>();

const { labelOf, options, ready } = useAspectRatioDict();

const draft = ref('');
const loading = ref(false);
const saving = ref(false);
const notReady = ref(false);
const errorText = ref('');
const saveError = ref('');

const currentLabel = computed(() =>
  props.value ? labelOf(props.value) : '未设置',
);

const canSave = computed(
  () =>
    ready.value &&
    !notReady.value &&
    !errorText.value &&
    !saveError.value &&
    !loading.value &&
    !saving.value &&
    options.value.some((item) => item.value === draft.value),
);

async function load() {
  errorText.value = '';
  saveError.value = '';
  notReady.value = false;
  draft.value = props.value ?? '';
  if (!props.novelId) {
    return;
  }
  loading.value = true;
  try {
    const result = await aiAssetProjectApi.fetchProjectAspectRatio(
      props.novelId,
    );
    draft.value = result.aspectRatio ?? '';
  } catch (error) {
    const info = parseApiError(error);
    notReady.value = info.notReady;
    errorText.value = info.notReady ? '' : formatApiError(info);
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!props.novelId || !canSave.value) {
    return;
  }
  saving.value = true;
  saveError.value = '';
  try {
    await aiAssetProjectApi.saveProjectAspectRatio(
      props.novelId,
      draft.value,
    );
    emit('saved', draft.value);
    emit('update:open', false);
  } catch (error) {
    saveError.value = formatApiError(parseApiError(error));
  } finally {
    saving.value = false;
  }
}

watch(
  () => [props.open, props.novelId] as const,
  ([open]) => {
    if (open) {
      void load();
    }
  },
  { immediate: true },
);
</script>

<template>
  <Modal
    :confirm-loading="saving"
    :ok-button-props="{ disabled: !canSave }"
    :open="open"
    cancel-text="取消"
    ok-text="保存"
    title="画面比例"
    @cancel="emit('update:open', false)"
    @ok="save"
  >
    <div class="ratio">
      <Alert
        v-if="!ready"
        message="画面比例字典未就绪（待接入）"
        description="系统字典 ai_aspect_ratio 配置后可用，前端不内置比例列表。"
        type="info"
        show-icon
      />
      <Alert
        v-else-if="notReady"
        message="接口未就绪"
        description="后端 v2/project 画面比例契约尚未上线。"
        type="info"
        show-icon
      />
      <Alert
        v-else-if="errorText"
        :message="errorText"
        type="error"
        show-icon
      >
        <template #action>
          <Button size="small" @click="load">重新加载</Button>
        </template>
      </Alert>
      <Radio.Group
        v-model:value="draft"
        :disabled="!ready || loading || notReady"
      >
        <Radio
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </Radio>
      </Radio.Group>
      <Alert v-if="saveError" :message="saveError" type="error" show-icon />
      <div class="ratio__hint">
        当前项目：{{ currentLabel }}；选项来自系统字典 ai_aspect_ratio
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.ratio {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  :deep(.ant-radio-wrapper) {
    margin-right: 16px;
  }
}
</style>
