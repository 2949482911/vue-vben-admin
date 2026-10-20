<script lang="ts" setup name="EpisodeScriptDrawer">
/**
 * 单集剧本生成（episode/script/generate → 回写 EpisodeItem.script）
 */
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Input, InputNumber, message, Select, Spin } from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';

const emit = defineEmits<{ success: [] }>();

const episodeId = ref<number | string>();
const episodeTitle = ref('');
const models = ref<Array<{ label: string; value: number | string }>>([]);
const modelId = ref<number | string>();
const durationSeconds = ref(60);
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
  if (!episodeId.value) {
    return;
  }
  if (!modelId.value) {
    message.warning('请选择文本模型');
    return;
  }
  submitting.value = true;
  try {
    await aiAssetApi.generateEpisodeScript({
      durationSeconds: durationSeconds.value || undefined,
      episodeId: episodeId.value,
      modelId: modelId.value,
      requirements: requirements.value.trim() || undefined,
    });
    message.success('剧本已生成并回写');
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
    const data = drawerApi.getData() as undefined | { episodeId?: number | string; title?: string };
    episodeId.value = data?.episodeId;
    episodeTitle.value = data?.title ?? '';
    durationSeconds.value = 60;
    requirements.value = '';
    if (models.value.length === 0) {
      void loadModels();
    }
  },
});
</script>

<template>
  <Drawer :title="`生成剧本${episodeTitle ? ` · ${episodeTitle}` : ''}`">
    <Spin :spinning="loadingModels">
      <div class="gen-field">
        <span class="gen-label">文本模型</span>
        <Select v-model:value="modelId" :options="models" placeholder="选择模型" show-search style="width: 100%" />
      </div>
    </Spin>
    <div class="gen-field">
      <span class="gen-label">单集时长（秒）</span>
      <InputNumber v-model:value="durationSeconds" :max="900" :min="15" style="width: 160px" />
    </div>
    <div class="gen-field">
      <span class="gen-label">额外要求（可选）</span>
      <Input.TextArea v-model:value="requirements" :auto-size="{ maxRows: 4, minRows: 2 }" placeholder="如：前 3 秒强钩子，结尾带口播 CTA" />
    </div>
    <div class="gen-foot">
      <Button :loading="submitting" type="primary" @click="submit">开始生成</Button>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.gen-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
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
