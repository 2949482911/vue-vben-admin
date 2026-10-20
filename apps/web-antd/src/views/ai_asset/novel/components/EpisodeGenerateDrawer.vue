<script lang="ts" setup name="EpisodeGenerateDrawer">
/**
 * 批量生成分集（novel/episodes/generate）
 */
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Input, InputNumber, message, Select, Spin } from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';

const emit = defineEmits<{ success: [] }>();

const novelId = ref<number | string>();
const novelName = ref('');
const models = ref<Array<{ label: string; value: number | string }>>([]);
const modelId = ref<number | string>();
const count = ref(3);
const fromSeq = ref<number>();
const requirements = ref('');
const submitting = ref(false);
const loadingModels = ref(false);

async function loadModels() {
  loadingModels.value = true;
  try {
    const res = await aiModelApi.fetchModelConfigList({
      capability: 'text',
      page: 1,
      pageSize: 200,
    });
    models.value = (res?.items ?? [])
      .filter((item) => item.status === undefined || item.status === 1)
      .map((item) => ({
        label: `${item.model ?? ''}（${item.provider ?? item.source ?? ''}）`,
        value: item.id,
      }));
  } finally {
    loadingModels.value = false;
  }
}

async function submit() {
  if (!novelId.value) {
    return;
  }
  if (!modelId.value) {
    message.warning('请选择文本模型');
    return;
  }
  submitting.value = true;
  try {
    const rows = await aiAssetApi.generateEpisodes({
      count: count.value || undefined,
      fromSeq: fromSeq.value || undefined,
      modelId: modelId.value,
      novelId: novelId.value,
      requirements: requirements.value.trim() || undefined,
    });
    message.success(`已生成 ${rows?.length ?? 0} 个分集`);
    emit('success');
    await drawerApi.close();
  } finally {
    submitting.value = false;
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[560px]',
  async onConfirm() {
    await submit();
  },
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    const data = drawerApi.getData() as undefined | { novelId?: number | string; novelName?: string; nextSeq?: number };
    novelId.value = data?.novelId;
    novelName.value = data?.novelName ?? '';
    fromSeq.value = data?.nextSeq;
    count.value = 3;
    requirements.value = '';
    if (models.value.length === 0) {
      void loadModels();
    }
  },
});
</script>

<template>
  <Drawer :title="`批量生成分集${novelName ? ` · ${novelName}` : ''}`">
    <Spin :spinning="loadingModels">
      <div class="gen-field">
        <span class="gen-label">文本模型</span>
        <Select v-model:value="modelId" :options="models" placeholder="选择模型" show-search style="width: 100%" />
      </div>
    </Spin>
    <div class="gen-row">
      <div class="gen-field">
        <span class="gen-label">生成数量</span>
        <InputNumber v-model:value="count" :max="30" :min="1" style="width: 100%" />
      </div>
      <div class="gen-field">
        <span class="gen-label">起始集号（可选）</span>
        <InputNumber v-model:value="fromSeq" :min="1" style="width: 100%" />
      </div>
    </div>
    <div class="gen-field">
      <span class="gen-label">额外要求（可选）</span>
      <Input.TextArea v-model:value="requirements" :auto-size="{ maxRows: 4, minRows: 2 }" placeholder="如：每集结尾留钩子" />
    </div>
    <div class="gen-foot">
      <Button :loading="submitting" type="primary" @click="submit">开始生成</Button>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.gen-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.gen-row {
  display: flex;
  gap: 10px;
}

.gen-label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.gen-foot {
  display: flex;
  justify-content: flex-end;
}
</style>
