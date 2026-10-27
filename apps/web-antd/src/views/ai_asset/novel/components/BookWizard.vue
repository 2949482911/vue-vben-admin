<script lang="ts" setup name="NovelBookWizard">
import type { OptionItem, OptionMap } from '../constants';

import type { NovelGenerateRequest } from '#/api/models/ai_asset';

import { computed, reactive, ref, watch } from 'vue';

import {
  Button,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Select,
  Switch,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { WIZARD_STEPS } from '../constants';

const props = defineProps<{
  models: Array<{ label: string; value: number | string }>;
  novels: Array<{ id: number | string; name?: string }>;
  open: boolean;
  options: OptionMap;
  personas: Array<{ label: string; value: number | string }>;
}>();
const emit = defineEmits<{
  generated: [novelId: number | string];
  'update:open': [value: boolean];
}>();

const step = ref(1);
const submitting = ref(false);
const stage = ref('正在生成世界观与人物');
let stageTimer: ReturnType<typeof setInterval> | undefined;

const config = reactive<Record<string, any>>({
  genre: [],
  theme: [],
  style: [],
  trope: [],
  narrativeStructure: [],
  literaryGenre: [],
  tone: [],
  protagonist: [],
  conflict: [],
  payoff: [],
  taboo: [],
});
const form = reactive({
  name: '',
  author: '',
  synopsis: '',
  episodeCount: 8,
  wordsPerEpisode: 1500,
  episodeDuration: 90,
  volumeEnabled: false,
  modelId: undefined as number | string | undefined,
  personaId: undefined as number | string | undefined,
  refNovelId: undefined as number | string | undefined,
  prompt: '',
});

const stepItems = [...WIZARD_STEPS.map((item) => item.title), '生成设置'];
const current = computed(() => WIZARD_STEPS[step.value - 1]!);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return;
    }
    step.value = 1;
    if (!form.modelId) {
      form.modelId = props.models[0]?.value;
    }
  },
);

function close() {
  emit('update:open', false);
}

function toggle(group: { key: string; max?: number; type: string }, item: OptionItem) {
  if (group.type === 'single') {
    config[group.key] = item.value;
    return;
  }
  const list: string[] = config[group.key] ?? [];
  const index = list.indexOf(item.value);
  if (index >= 0) {
    list.splice(index, 1);
  } else if (group.max && list.length >= group.max) {
    message.warning(`最多选择 ${group.max} 个`);
    return;
  } else {
    list.push(item.value);
  }
  config[group.key] = [...list];
}

function isOn(group: { key: string; type: string }, item: OptionItem) {
  const value = config[group.key];
  return Array.isArray(value) ? value.includes(item.value) : value === item.value;
}

function hasValue(value: any) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

function validate() {
  if (step.value === 6) {
    if (!form.modelId) {
      message.warning('请选择文本模型');
      return false;
    }
    return true;
  }
  const missing = current.value.groups.filter(
    (group) => group.required && !hasValue(config[group.key]),
  );
  if (missing.length) {
    message.warning(`请先选择：${missing.map((g) => g.label).join('、')}`);
    return false;
  }
  return true;
}

function next() {
  if (!validate()) {
    return;
  }
  if (step.value < 6) {
    step.value += 1;
    return;
  }
  void submit();
}

function prev() {
  if (step.value > 1) {
    step.value -= 1;
  }
}

function buildPayload(): NovelGenerateRequest {
  return {
    modelId: form.modelId!,
    name: form.name.trim() || undefined,
    author: form.author.trim() || undefined,
    audience: config.audience,
    genres: config.genre,
    styles: config.style,
    episodeCount: Number(form.episodeCount) || 8,
    wordsPerEpisode: Number(form.wordsPerEpisode) || 1500,
    volumeEnabled: form.volumeEnabled,
    episodeDuration: Number(form.episodeDuration) || 90,
    synopsis: form.synopsis.trim() || undefined,
    personaId: form.personaId,
    refNovelId: form.refNovelId,
    prompt: form.prompt.trim() || undefined,
    config: {
      theme: config.theme,
      tropes: config.trope,
      languageStyle: config.languageStyle,
      narrativeStructure: config.narrativeStructure,
      literaryGenre: config.literaryGenre,
      tone: config.tone,
      era: config.era,
      narrativeTime: config.narrativeTime,
      narrativePov: config.narrativePov,
      protagonist: config.protagonist,
      conflict: config.conflict,
      payoff: config.payoff,
      taboo: config.taboo,
      openingType: config.openingType,
      heroEntrance: config.heroEntrance,
      hook: config.hook,
      outlineType: config.outlineType,
      corePhilosophy: config.corePhilosophy,
      storySummary: config.storySummary,
      rhythm: config.rhythm,
      loveLine: config.loveLine,
    },
  };
}

async function submit() {
  submitting.value = true;
  const stages = ['解析创作设定', '生成世界观与人物', '拆分分集大纲', '写入角色与场景'];
  let index = 0;
  stage.value = stages[0]!;
  stageTimer = setInterval(() => {
    index = (index + 1) % stages.length;
    stage.value = stages[index]!;
  }, 1500);
  try {
    const res = await aiAssetApi.generateNovel(buildPayload());
    message.success(`《${res.novel.name || form.name || '未命名书籍'}》已生成`);
    emit('generated', res.novel.id);
    close();
  } catch (error: any) {
    message.error(error?.message || '生成失败，请稍后重试');
  } finally {
    submitting.value = false;
    if (stageTimer) {
      clearInterval(stageTimer);
      stageTimer = undefined;
    }
  }
}

const previewRows = computed(() => {
  const labelOf = (group: { dictKey?: keyof OptionMap; options?: OptionItem[] }, value: string) =>
    (group.options ?? (group.dictKey ? props.options[group.dictKey] : []))
      ?.find((item) => item.value === value)?.label ?? value;
  const rows: Array<{ label: string; value: string }> = [];
  WIZARD_STEPS.forEach((s) => {
    s.groups.forEach((group) => {
      const value = config[group.key];
      if (!hasValue(value)) {
        return;
      }
      rows.push({
        label: group.label,
        value: Array.isArray(value)
          ? value.map((item) => labelOf(group, item)).join(' · ')
          : labelOf(group, value),
      });
    });
  });
  if (form.episodeCount) {
    rows.push({ label: '分集数', value: `${form.episodeCount} 集` });
  }
  return rows;
});
</script>

<template>
  <Modal
    :open="open"
    :width="1020"
    :footer="null"
    :mask-closable="!submitting"
    title="新建书籍"
    @cancel="close"
  >
    <div class="wiz">
      <div class="wiz-steps">
        <template v-for="(title, index) in stepItems" :key="title">
          <div
            class="wiz-step"
            :class="{ 'is-done': index + 1 < step, 'is-on': index + 1 === step }"
          >
            <span>{{ index + 1 < step ? '✓' : index + 1 }}</span>
            {{ title }}
          </div>
          <div v-if="index < stepItems.length - 1" class="wiz-line"></div>
        </template>
      </div>

      <div class="wiz-body">
        <div class="wiz-form">
          <template v-if="!submitting">
            <template v-if="step < 6">
              <div v-for="group in current.groups" :key="group.key" class="wiz-group">
                <div class="wiz-label">
                  <b>{{ group.label }}</b>
                  <em v-if="group.required">*</em>
                  <span v-if="group.hint">{{ group.hint }}</span>
                </div>
                <Input
                  v-if="group.type === 'text'"
                  v-model:value="config[group.key]"
                  :placeholder="group.placeholder"
                />
                <Input.TextArea
                  v-else-if="group.type === 'textarea'"
                  v-model:value="config[group.key]"
                  :rows="3"
                  :placeholder="group.placeholder"
                />
                <div v-else class="wiz-chips">
                  <button
                    v-for="item in (group.options ?? (group.dictKey ? options[group.dictKey] : []))"
                    :key="item.value"
                    type="button"
                    class="wiz-chip"
                    :class="{ 'is-on': isOn(group, item) }"
                    @click="toggle(group, item)"
                  >
                    {{ item.label }}
                    <small v-if="item.desc">{{ item.desc }}</small>
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="wiz-grid2">
                <label class="wiz-field">
                  <span>书名 <span class="hint">留空由 AI 起名</span></span>
                  <Input v-model:value="form.name" placeholder="例如：夜航船" />
                </label>
                <label class="wiz-field">
                  <span>笔名</span>
                  <Input v-model:value="form.author" placeholder="留空使用默认笔名" />
                </label>
              </div>
              <label class="wiz-field">
                <span>一句话简介</span>
                <Input v-model:value="form.synopsis" placeholder="过气演员重回出道那年，靠一部短剧翻身" />
              </label>
              <div class="wiz-grid2">
                <label class="wiz-field">
                  <span>分集数</span>
                  <InputNumber v-model:value="form.episodeCount" :min="1" :max="20" style="width: 100%" />
                </label>
                <label class="wiz-field">
                  <span>每集字数</span>
                  <Select
v-model:value="form.wordsPerEpisode" :options="[
                    { label: '1000 字', value: 1000 },
                    { label: '1500 字', value: 1500 },
                    { label: '2000 字', value: 2000 },
                  ]"
/>
                </label>
                <label class="wiz-field">
                  <span>单集时长</span>
                  <Select
v-model:value="form.episodeDuration" :options="[
                    { label: '60 秒', value: 60 },
                    { label: '90 秒', value: 90 },
                    { label: '120 秒', value: 120 },
                  ]"
/>
                </label>
                <label class="wiz-field">
                  <span>是否分卷</span>
                  <Switch v-model:checked="form.volumeEnabled" checked-children="分卷" un-checked-children="不分卷" />
                </label>
                <label class="wiz-field">
                  <span>文本模型 <em>*</em></span>
                  <Select
                    v-model:value="form.modelId"
                    :options="models"
                    placeholder="选择文本模型"
                    show-search
                    option-filter-prop="label"
                  />
                </label>
                <label class="wiz-field">
                  <span>作者人设</span>
                  <Select
                    v-model:value="form.personaId"
                    allow-clear
                    placeholder="不绑定人设"
                    :options="personas"
                  />
                </label>
                <label class="wiz-field">
                  <span>参考已有书籍</span>
                  <Select
                    v-model:value="form.refNovelId"
                    allow-clear
                    placeholder="不参考"
                    :options="novels.map((n) => ({ label: `《${n.name || n.id}》`, value: n.id }))"
                  />
                </label>
              </div>
              <label class="wiz-field">
                <span>故事方向 / 特殊要求</span>
                <Input.TextArea v-model:value="form.prompt" :rows="3" placeholder="例如：女频重生，主角腹黑大小姐，每集结尾留钩子" />
              </label>
              <div class="wiz-summary">
                <div><span>分集</span><b>{{ form.episodeCount }} 集 × {{ form.wordsPerEpisode }} 字</b></div>
                <div><span>时长</span><b>{{ form.episodeDuration }} 秒 / 集</b></div>
                <div><span>类型</span><b>{{ (config.genre || []).join(' · ') || '—' }}</b></div>
                <div><span>总纲</span><b>{{ config.outlineType || '—' }}</b></div>
              </div>
              <p class="wiz-note">只生成世界观、角色与分集大纲；正文按集懒生成，不一次性写全书。</p>
            </template>
          </template>

          <div v-else class="wiz-loading">
            <Progress :percent="0" status="active" :show-info="false" />
            <div class="wiz-loading__title">正在生成《{{ form.name || '未命名书籍' }}》</div>
            <div class="wiz-loading__stage">{{ stage }}</div>
            <div class="wiz-loading__hint">同步生成，预计 20~120 秒；请勿关闭页面</div>
          </div>
        </div>

        <aside class="wiz-preview">
          <div class="wiz-preview__title">配置预览</div>
          <div v-if="previewRows.length" class="wiz-preview__list">
            <div v-for="row in previewRows" :key="row.label" class="wiz-preview__row">
              <dt>{{ row.label }}</dt>
              <dd>{{ row.value }}</dd>
            </div>
          </div>
          <div v-else class="wiz-preview__empty">请选择左侧配置</div>
        </aside>
      </div>

      <footer class="wiz-foot">
        <span class="wiz-foot__hint">
          <template v-if="step < 6">第 {{ step }} 步 · {{ current?.title }}</template>
          <template v-else>第 6 步 · 生成设置</template>
        </span>
        <Button :disabled="submitting" @click="close">取消</Button>
        <Button v-if="step > 1" :disabled="submitting" @click="prev">上一步</Button>
        <Button type="primary" :loading="submitting" @click="next">
          {{ step === 6 ? '开始生成' : '下一步' }}
        </Button>
      </footer>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.wiz {
  display: flex;
  flex-direction: column;
}

.wiz-steps {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 0 14px;
  border-bottom: 1px solid hsl(var(--border));
}

.wiz-step {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    background: hsl(var(--accent));
    border-radius: 50%;
  }

  &.is-on {
    font-weight: 600;
    color: hsl(var(--foreground));

    span {
      color: #fff;
      background: hsl(var(--primary));
    }
  }

  &.is-done span {
    color: hsl(var(--success));
    background: color-mix(in srgb, hsl(var(--success)) 16%, transparent);
  }
}

.wiz-line {
  flex: 1;
  height: 1px;
  background: hsl(var(--border));
}

.wiz-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 18px;
  padding: 14px 0;
}

.wiz-form {
  min-height: 380px;
  max-height: 52vh;
  padding-right: 4px;
  overflow-y: auto;
}

.wiz-group {
  margin-bottom: 16px;
}

.wiz-label {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 13px;

  em {
    font-style: normal;
    color: hsl(var(--destructive));
  }

  span {
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }
}

.wiz-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.wiz-chip {
  height: 29px;
  padding: 0 11px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px;

  small {
    margin-left: 4px;
    font-size: 11px;
    opacity: 0.65;
  }

  &:hover {
    color: hsl(var(--foreground));
    border-color: color-mix(in srgb, hsl(var(--primary)) 40%, transparent);
  }

  &.is-on {
    font-weight: 550;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 9%, transparent);
    border-color: color-mix(in srgb, hsl(var(--primary)) 45%, transparent);
  }
}

.wiz-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.wiz-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;

  em {
    font-style: normal;
    color: hsl(var(--destructive));
  }
}

.wiz-field .hint {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.wiz-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 10px 14px;
  margin: 4px 0 10px;
  background: color-mix(in srgb, hsl(var(--primary)) 5%, hsl(var(--card)));
  border: 1px solid color-mix(in srgb, hsl(var(--primary)) 20%, hsl(var(--border)));
  border-radius: 10px;

  div {
    display: flex;
    gap: 8px;
    font-size: 12px;
  }

  span {
    color: hsl(var(--muted-foreground));
  }
}

.wiz-note {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.wiz-preview {
  align-self: start;
  padding: 14px;
  background: hsl(var(--accent));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;

  &__title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
  }

  &__row {
    padding: 6px 0;
    font-size: 12px;
    border-bottom: 1px dashed hsl(var(--border));

    dt {
      margin-bottom: 2px;
      color: hsl(var(--muted-foreground));
    }

    dd {
      margin: 0;
      line-height: 1.6;
      word-break: break-all;
    }
  }

  &__empty {
    padding: 24px 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    text-align: center;
  }

  &__tip {
    padding-top: 8px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }
}

.wiz-loading {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 320px;

  &__title {
    font-size: 15px;
    font-weight: 600;
  }

  &__stage {
    font-size: 13px;
    color: hsl(var(--primary));
  }

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.wiz-foot {
  display: flex;
  gap: 10px;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));

  &__hint {
    flex: 1;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

@media (width <= 1080px) {
  .wiz-body {
    grid-template-columns: 1fr;
  }

  .wiz-preview {
    display: none;
  }
}
</style>
