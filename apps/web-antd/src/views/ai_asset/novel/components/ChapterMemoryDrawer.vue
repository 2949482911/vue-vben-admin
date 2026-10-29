<script lang="ts" setup name="ChapterMemoryDrawer">
/**
 * 章级结构化记忆抽屉：位于小说编辑器「本章记忆」卡片，属于正文定稿后的记忆维护环节。
 * 读取/人工修订/单章重建 ai_asset_chapter_memory；接口未就绪时展示空表单并提示，不伪造旧摘要。
 * 人工修订保存后 memory_source=manual，自动重算不覆盖，除非主动点「重建本章记忆」。
 */
import type { ChapterMemoryJson } from '#/api/models/ai_asset';

import { reactive, ref, watch } from 'vue';

import {
  Button,
  Drawer,
  Empty,
  Input,
  message,
  Select,
  Spin,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

const props = defineProps<{
  episodeId?: number | string;
  episodeSeq?: number;
  modelId?: number | string;
}>();
const emit = defineEmits<{ updated: [] }>();
const open = defineModel<boolean>('open', { default: false });

const loading = ref(false);
const saving = ref(false);
const rebuilding = ref(false);
const apiReady = ref(false);
const status = ref<number>();
const source = ref('');
const contentVersion = ref<number>();
const errorMsg = ref('');

const form = reactive({
  characters: [] as Array<{ name: string; state: string }>,
  endingState: '',
  events: [] as Array<{ id: string; text: string; type: string }>,
  foreshadows: [] as Array<{
    action: string;
    id: string;
    importance: string;
    text: string;
  }>,
  summary: '',
  timelineFrom: '',
  timelinePlace: '',
  timelineTo: '',
});

const EVENT_TYPES = [
  { label: '目标', value: 'goal' },
  { label: '阻碍', value: 'obstacle' },
  { label: '转折', value: 'twist' },
  { label: '悬念', value: 'cliffhanger' },
];
const FORESHADOW_ACTIONS = [
  { label: '埋设', value: 'plant' },
  { label: '推进', value: 'advance' },
  { label: '回收', value: 'resolve' },
];
const IMPORTANCE_OPTIONS = [
  { label: '高', value: 'high' },
  { label: '中', value: 'mid' },
  { label: '低', value: 'low' },
];

const STATUS_META: Record<number, { color: string; label: string }> = {
  0: { color: 'default', label: '未生成' },
  1: { color: 'blue', label: '生成中' },
  2: { color: 'green', label: '成功' },
  3: { color: 'orange', label: '过期' },
  4: { color: 'red', label: '失败' },
};

function fillForm(memory?: ChapterMemoryJson) {
  form.summary = memory?.summary ?? '';
  form.endingState = memory?.endingState ?? '';
  form.timelineFrom = memory?.timeline?.from ?? '';
  form.timelineTo = memory?.timeline?.to ?? '';
  form.timelinePlace = memory?.timeline?.place ?? '';
  form.events = (memory?.events ?? []).map((item) => ({
    id: String(item.id ?? ''),
    text: item.text ?? '',
    type: item.type ?? 'goal',
  }));
  form.characters = (memory?.characters ?? []).map((item) => ({
    name: item.name ?? '',
    state: item.state ?? '',
  }));
  form.foreshadows = (memory?.foreshadows ?? []).map((item) => ({
    action: item.action ?? 'plant',
    id: String(item.id ?? ''),
    importance: item.importance ?? 'mid',
    text: item.text ?? '',
  }));
}

function addEvent() {
  form.events.push({ id: `e${form.events.length + 1}`, text: '', type: 'goal' });
}

function addCharacter() {
  form.characters.push({ name: '', state: '' });
}

function addForeshadow() {
  form.foreshadows.push({
    action: 'plant',
    id: `f${form.foreshadows.length + 1}`,
    importance: 'mid',
    text: '',
  });
}

function buildMemoryJson(): ChapterMemoryJson {
  return {
    characters: form.characters
      .filter((item) => item.name.trim())
      .map((item) => ({ name: item.name.trim(), state: item.state.trim() })),
    endingState: form.endingState.trim(),
    events: form.events
      .filter((item) => item.text.trim())
      .map((item, index) => ({
        id: item.id || `e${index + 1}`,
        text: item.text.trim(),
        type: item.type,
      })),
    foreshadows: form.foreshadows
      .filter((item) => item.text.trim())
      .map((item, index) => ({
        action: item.action,
        id: item.id || `f${index + 1}`,
        importance: item.importance,
        text: item.text.trim(),
      })),
    schemaVersion: 1,
    summary: form.summary.trim(),
    timeline: {
      from: form.timelineFrom.trim() || undefined,
      place: form.timelinePlace.trim() || undefined,
      to: form.timelineTo.trim() || undefined,
    },
  };
}

async function load() {
  if (!props.episodeId) {
    return;
  }
  loading.value = true;
  apiReady.value = false;
  try {
    const res = await aiAssetApi.fetchChapterMemory(props.episodeId);
    apiReady.value = true;
    status.value = res?.memoryStatus;
    source.value = res?.memorySource ?? '';
    contentVersion.value = res?.contentVersion;
    errorMsg.value = res?.errorMsg ?? '';
    fillForm(res?.memoryJson);
  } catch {
    // 新接口未就绪：不伪造旧摘要，保持空表单并提示
    fillForm({});
    status.value = 0;
    source.value = '';
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!props.episodeId) {
    return;
  }
  saving.value = true;
  try {
    const res = await aiAssetApi.saveChapterMemory({
      episodeId: props.episodeId,
      memoryJson: buildMemoryJson(),
    });
    status.value = res?.memoryStatus ?? 2;
    source.value = res?.memorySource ?? 'manual';
    message.success('已人工修订，自动重算不会覆盖，除非手动重建');
    emit('updated');
  } catch (error: any) {
    message.error(error?.message || '保存章节记忆失败');
  } finally {
    saving.value = false;
  }
}

async function rebuild() {
  if (!props.episodeId) {
    return;
  }
  rebuilding.value = true;
  try {
    const res = await aiAssetApi.rebuildChapterMemory({
      episodeId: props.episodeId,
      force: true,
      modelId: props.modelId,
    });
    status.value = res?.memoryStatus ?? 2;
    source.value = res?.memorySource ?? 'ai';
    errorMsg.value = res?.errorMsg ?? '';
    fillForm(res?.memoryJson);
    message.success('本章记忆已重建');
    emit('updated');
  } catch (error: any) {
    message.error(error?.message || '重建章节记忆失败');
  } finally {
    rebuilding.value = false;
  }
}

watch(open, (value) => {
  if (value) {
    void load();
  }
});
</script>

<template>
  <Drawer
    v-model:open="open"
    :width="760"
    destroy-on-close
    title="本章结构化记忆"
  >
    <Spin :spinning="loading">
      <div class="chapter-memory">
        <div class="chapter-memory__status">
          <Tag :bordered="false" :color="STATUS_META[status ?? 0]?.color">
            {{ STATUS_META[status ?? 0]?.label ?? '未知' }}
          </Tag>
          <span v-if="source">来源：{{ source }}</span>
          <span v-if="contentVersion">
            contentVersion：{{ contentVersion }}
          </span>
          <Button
            size="small"
            :loading="rebuilding"
            @click="rebuild"
          >
            重建本章记忆
          </Button>
          <Button
            type="primary"
            size="small"
            :loading="saving"
            @click="save"
          >
            保存人工修订
          </Button>
        </div>
        <p v-if="errorMsg" class="chapter-memory__error">{{ errorMsg }}</p>
        <p v-if="!apiReady" class="nwb-tip">
          结构化记忆接口未就绪，当前仅展示旧版短记忆摘要；保存/重建将调用预留接口。
        </p>

        <label>
          <span>摘要</span>
          <Input.TextArea v-model:value="form.summary" :rows="3" />
        </label>

        <div class="chapter-memory__block">
          <div class="chapter-memory__hd">
            <b>事件（带因果）</b>
            <Button type="link" size="small" @click="addEvent">+ 事件</Button>
          </div>
          <div v-for="(item, index) in form.events" :key="index" class="chapter-memory__row">
            <Select
              v-model:value="item.type"
              :options="EVENT_TYPES"
              size="small"
              style="width: 100px"
            />
            <Input v-model:value="item.text" placeholder="事件内容" size="small" />
            <Button danger type="link" size="small" @click="form.events.splice(index, 1)">
              删除
            </Button>
          </div>
          <Empty
            v-if="!form.events.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无事件"
          />
        </div>

        <div class="chapter-memory__block">
          <div class="chapter-memory__hd">
            <b>人物状态变化</b>
            <Button type="link" size="small" @click="addCharacter">+ 人物</Button>
          </div>
          <div
            v-for="(item, index) in form.characters"
            :key="index"
            class="chapter-memory__row"
          >
            <Input v-model:value="item.name" placeholder="人物名" size="small" style="width: 130px" />
            <Input v-model:value="item.state" placeholder="本章结束时的处境/心态/已知信息" size="small" />
            <Button danger type="link" size="small" @click="form.characters.splice(index, 1)">
              删除
            </Button>
          </div>
          <Empty
            v-if="!form.characters.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无人物状态"
          />
        </div>

        <div class="chapter-memory__block">
          <div class="chapter-memory__hd">
            <b>伏笔埋收</b>
            <Button type="link" size="small" @click="addForeshadow">+ 伏笔</Button>
          </div>
          <div
            v-for="(item, index) in form.foreshadows"
            :key="index"
            class="chapter-memory__row"
          >
            <Select v-model:value="item.action" :options="FORESHADOW_ACTIONS" size="small" style="width: 90px" />
            <Select v-model:value="item.importance" :options="IMPORTANCE_OPTIONS" size="small" style="width: 80px" />
            <Input v-model:value="item.text" placeholder="伏笔内容" size="small" />
            <Button danger type="link" size="small" @click="form.foreshadows.splice(index, 1)">
              删除
            </Button>
          </div>
          <Empty
            v-if="!form.foreshadows.length"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无伏笔"
          />
        </div>

        <div class="chapter-memory__block">
          <div class="chapter-memory__hd"><b>时空推进</b></div>
          <div class="chapter-memory__row">
            <Input v-model:value="form.timelineFrom" placeholder="从（如第3天清晨）" size="small" />
            <Input v-model:value="form.timelineTo" placeholder="到（如当日上午）" size="small" />
            <Input v-model:value="form.timelinePlace" placeholder="地点" size="small" />
          </div>
        </div>

        <label>
          <span>结尾未完成动作 / 悬念</span>
          <Input.TextArea v-model:value="form.endingState" :rows="3" />
        </label>
      </div>
    </Spin>
  </Drawer>
</template>

<style scoped lang="scss">
.chapter-memory {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
  }
}

.chapter-memory__status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.chapter-memory__error {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--destructive));
}

.chapter-memory__block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: hsl(var(--accent));
  border-radius: 8px;
}

.chapter-memory__hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.chapter-memory__row {
  display: flex;
  gap: 6px;
  align-items: center;
}
</style>
