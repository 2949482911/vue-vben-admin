<script lang="ts" setup name="EpisodeListDrawer">
/**
 * 小说 → 分集 钻取抽屉
 *
 * 在「资产 › 小说」卡片点「分集」打开，管理该小说下的分集。
 * 接口：episode/list?novelId=、episode/save、episode/batch_options。
 */
import type { EpisodeItem, NovelItem } from '#/api/models/ai_asset';
import type { BatchOptions } from '#/api/models/core';

import { reactive, ref, watch } from 'vue';

import {
  Button,
  Drawer,
  Empty,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Spin,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { BatchOptionsType } from '#/constants/locales';

const props = defineProps<{
  novel: NovelItem | null;
  open: boolean;
}>();
const emit = defineEmits(['update:open', 'changed']);

const loading = ref(false);
const saving = ref(false);
const episodes = ref<EpisodeItem[]>([]);

const form = reactive<{
  id?: number | string;
  script: string;
  seq: number;
  title: string;
}>({
  id: undefined,
  script: '',
  seq: 1,
  title: '',
});

function resetForm() {
  form.id = undefined;
  form.seq = episodes.value.length + 1;
  form.title = '';
  form.script = '';
}

async function loadEpisodes() {
  if (!props.novel?.id) {
    return;
  }
  loading.value = true;
  try {
    episodes.value = (await aiAssetApi.fetchEpisodes(props.novel.id)) ?? [];
    resetForm();
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      void loadEpisodes();
    }
  },
);

function editEpisode(row: EpisodeItem) {
  form.id = row.id;
  form.seq = row.seq ?? 1;
  form.title = row.title ?? '';
  form.script = row.script ?? '';
}

async function submitEpisode() {
  if (!props.novel?.id) {
    return;
  }
  if (!form.title.trim()) {
    message.warning('请填写分集标题');
    return;
  }
  saving.value = true;
  try {
    await aiAssetApi.saveEpisode({
      id: form.id,
      novelId: props.novel.id,
      script: form.script || undefined,
      seq: form.seq,
      title: form.title,
    });
    message.success(form.id ? '已更新' : '已新增');
    await loadEpisodes();
    emit('changed');
  } finally {
    saving.value = false;
  }
}

async function removeEpisode(row: EpisodeItem) {
  await aiAssetApi.fetchAssetBatchOptions('episode', {
    targetIds: [String(row.id)],
    type: BatchOptionsType.Delete,
    values: {},
  } as BatchOptions);
  message.success('已删除');
  await loadEpisodes();
  emit('changed');
}
</script>

<template>
  <Drawer
    :open="open"
    :title="`分集 — ${novel?.name || ''}`"
    :width="560"
    @close="emit('update:open', false)"
  >
    <!-- 新增 / 编辑分集 -->
    <div class="ep-form">
      <Form layout="inline">
        <FormItem label="集数">
          <InputNumber v-model:value="form.seq" :min="1" style="width: 90px" />
        </FormItem>
        <FormItem label="标题">
          <Input v-model:value="form.title" placeholder="如 开篇：痛点引入" style="width: 200px" />
        </FormItem>
        <FormItem>
          <Button :loading="saving" type="primary" @click="submitEpisode">
            {{ form.id ? '更新' : '新增' }}
          </Button>
          <Button v-if="form.id" class="ml-2" @click="resetForm">取消</Button>
        </FormItem>
      </Form>
      <Input.TextArea
        v-model:value="form.script"
        :rows="3"
        class="mt-2"
        placeholder="分集剧本 / 分镜文本（可选）"
      />
    </div>

    <Spin :spinning="loading">
      <div v-if="episodes.length" class="ep-list">
        <div v-for="ep in episodes" :key="ep.id" class="ep-item">
          <div class="ep-item__b">
            <Tag :bordered="false">第 {{ ep.seq ?? '-' }} 集</Tag>
            <span class="ep-item__t">{{ ep.title || '-' }}</span>
          </div>
          <div v-if="ep.script" class="ep-item__s">{{ ep.script }}</div>
          <div class="ep-item__a">
            <Button size="small" type="link" @click="editEpisode(ep)">编辑</Button>
            <Button danger size="small" type="link" @click="removeEpisode(ep)">删除</Button>
          </div>
        </div>
      </div>
      <Empty v-else description="暂无分集，先在上方新增" />
    </Spin>
  </Drawer>
</template>

<style scoped lang="scss">
.ep-form {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.mt-2 {
  margin-top: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.ep-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ep-item {
  padding: 10px 12px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 4px);
}

.ep-item__b {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ep-item__t {
  font-size: 13px;
  font-weight: 600;
}

.ep-item__s {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

.ep-item__a {
  margin-top: 4px;
}
</style>
