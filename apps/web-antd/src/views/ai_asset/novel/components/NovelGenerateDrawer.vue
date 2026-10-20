<script lang="ts" setup name="NovelGenerateDrawer">
/**
 * AI 生成小说（同步 LLM，20~120s）
 *
 * 模型（capability=text）+ 提示词 / 题材 / 风格 / 集数 → novel/generate
 * 返回 novel（含正文）+ episodes。
 */
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Input, InputNumber, message, Select, Spin } from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';

const emit = defineEmits<{ success: [novelId: number | string] }>();

const models = ref<Array<{ label: string; value: number | string }>>([]);
const modelId = ref<number | string>();
const prompt = ref('');
const genre = ref('');
const style = ref('');
const episodeCount = ref(6);
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
  if (!modelId.value) {
    message.warning('请选择文本模型（capability=text）');
    return;
  }
  submitting.value = true;
  try {
    const result = await aiAssetApi.generateNovel({
      episodeCount: episodeCount.value || undefined,
      genre: genre.value.trim() || undefined,
      modelId: modelId.value,
      prompt: prompt.value.trim() || undefined,
      style: style.value.trim() || undefined,
    });
    message.success(
      `已生成《${result?.novel?.name ?? '未命名'}》及 ${result?.episodes?.length ?? 0} 个分集`,
    );
    emit('success', result?.novel?.id ?? '');
    await drawerApi.close();
  } finally {
    submitting.value = false;
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[620px]',
  async onConfirm() {
    await submit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      prompt.value = '';
      genre.value = '';
      style.value = '';
      episodeCount.value = 6;
      if (models.value.length === 0) {
        void loadModels();
      }
    }
  },
});
</script>

<template>
  <Drawer title="AI 生成小说">
    <p class="gen-hint">
      同步生成，通常需要 20~120 秒；成功后自动创建小说并写出分集。
    </p>

    <Spin :spinning="loadingModels">
      <div class="gen-field">
        <span class="gen-label">文本模型</span>
        <Select
          v-model:value="modelId"
          :options="models"
          placeholder="选择 capability=text 的模型"
          show-search
          style="width: 100%"
        />
      </div>
    </Spin>

    <div class="gen-field">
      <span class="gen-label">故事提示词</span>
      <Input.TextArea
        v-model:value="prompt"
        :auto-size="{ maxRows: 5, minRows: 3 }"
        placeholder="例如：都市职场女性逆袭，绑定系统后靠短视频带货翻身"
      />
    </div>

    <div class="gen-row">
      <div class="gen-field">
        <span class="gen-label">题材</span>
        <Input v-model:value="genre" placeholder="如 都市 / 玄幻 / 悬疑" />
      </div>
      <div class="gen-field">
        <span class="gen-label">风格</span>
        <Input v-model:value="style" placeholder="如 爽文 / 轻喜剧 / 悬疑推理" />
      </div>
      <div class="gen-field gen-field--sm">
        <span class="gen-label">分集数</span>
        <InputNumber v-model:value="episodeCount" :max="60" :min="1" style="width: 100%" />
      </div>
    </div>

    <div class="gen-foot">
      <Button :loading="submitting" type="primary" @click="submit">开始生成</Button>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.gen-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.gen-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.gen-field--sm {
  max-width: 110px;
}

.gen-label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.gen-row {
  display: flex;
  gap: 10px;
}

.gen-foot {
  display: flex;
  justify-content: flex-end;
}
</style>
