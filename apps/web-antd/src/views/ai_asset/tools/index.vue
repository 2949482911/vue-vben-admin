<script lang="ts" setup name="AiAssetWritingTools">
import type {
  WritingToolItem,
  WritingToolParamField,
  WritingToolRunItem,
} from '#/api/models/ai_asset';
import type { OptionItem } from '#/views/ai_asset/novel/constants';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useDictStore } from '@vben/stores';

import {
  CopyOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Empty,
  Input,
  message,
  Modal,
  Select,
  Spin,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi, aiModelApi } from '#/api';

const dictStore = useDictStore();

const FALLBACK_GROUPS: OptionItem[] = [
  { label: '写作辅助', value: 'writing_assist' },
  { label: '大纲架构', value: 'outline' },
  { label: '角色设定', value: 'character' },
  { label: '描写润色', value: 'polish' },
  { label: '起名生成', value: 'naming' },
  { label: '世界观设定', value: 'worldview' },
];

const groups = computed<OptionItem[]>(() => {
  const items = dictStore.dictMap.ai_writing_tool_group ?? [];
  return items.length
    ? items.map((item) => ({ label: String(item.label), value: String(item.value) }))
    : FALLBACK_GROUPS;
});

const activeGroup = ref('');
const tools = ref<WritingToolItem[]>([]);
const toolLoading = ref(false);
const activeTool = ref<WritingToolItem>();
const detail = ref<WritingToolItem>();
const detailLoading = ref(false);
const inputs = reactive<Record<string, any>>({});
const running = ref(false);
const result = ref('');
const lastRun = ref<{ durationMs?: number; runId?: number | string }>();

const models = ref<Array<{ label: string; value: number | string }>>([]);
const modelId = ref<number | string>();
const novels = ref<Array<{ id: number | string; name?: string }>>([]);
const refNovelId = ref<number | string>();

const runsOpen = ref(false);
const runsLoading = ref(false);
const runs = ref<WritingToolRunItem[]>([]);

const fields = computed<WritingToolParamField[]>(
  () => detail.value?.paramsSchema?.fields ?? [],
);

function normalizeOptions(field: WritingToolParamField) {
  return (field.options ?? []).map((option) =>
    typeof option === 'string'
      ? { label: option, value: option }
      : option,
  );
}

async function loadGroups() {
  if (!activeGroup.value) {
    activeGroup.value = groups.value[0]?.value ?? '';
  }
  if (activeGroup.value) {
    await loadTools();
  }
}

async function loadTools() {
  toolLoading.value = true;
  try {
    const res = await aiAssetApi.fetchWritingTools({
      groupCode: activeGroup.value || undefined,
      page: 1,
      pageSize: 100,
    });
    tools.value = res?.items ?? [];
    if (tools.value.length) {
      await selectTool(tools.value[0]!);
    } else {
      activeTool.value = undefined;
      detail.value = undefined;
      result.value = '';
    }
  } catch (error: any) {
    message.error(error?.message || '加载工具失败');
  } finally {
    toolLoading.value = false;
  }
}

async function selectGroup(value: string) {
  if (value === activeGroup.value) {
    return;
  }
  activeGroup.value = value;
  await loadTools();
}

async function selectTool(item: WritingToolItem) {
  activeTool.value = item;
  result.value = '';
  lastRun.value = undefined;
  detailLoading.value = true;
  try {
    detail.value = await aiAssetApi.fetchWritingToolDetail(item.id);
    Object.keys(inputs).forEach((key) => delete inputs[key]);
    (detail.value?.paramsSchema?.fields ?? []).forEach((field) => {
      inputs[field.key] = field.default ?? (field.type === 'number' ? 0 : '');
    });
  } catch (error: any) {
    message.error(error?.message || '加载工具详情失败');
  } finally {
    detailLoading.value = false;
  }
}

function validate() {
  const missing = fields.value.filter(
    (field) => field.required && !String(inputs[field.key] ?? '').trim(),
  );
  if (missing.length) {
    message.warning(`请填写：${missing.map((item) => item.label).join('、')}`);
    return false;
  }
  return true;
}

async function run() {
  if (!activeTool.value || !validate()) {
    return;
  }
  running.value = true;
  result.value = '';
  try {
    const res = await aiAssetApi.runWritingTool({
      inputs: { ...inputs },
      modelId: modelId.value,
      refId: refNovelId.value,
      refType: refNovelId.value ? 'novel' : undefined,
      toolCode: activeTool.value.code,
    });
    result.value = res?.content ?? '';
    lastRun.value = { durationMs: res?.durationMs, runId: res?.runId };
    message.success('生成完成');
  } catch (error: any) {
    message.error(error?.message || '生成失败');
  } finally {
    running.value = false;
  }
}

async function copyResult() {
  if (!result.value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(result.value);
    message.success('已复制');
  } catch {
    message.warning('复制失败，请手动选择文本');
  }
}

async function openRuns() {
  if (!activeTool.value) {
    return;
  }
  runsOpen.value = true;
  runsLoading.value = true;
  try {
    const res = await aiAssetApi.fetchWritingToolRuns({
      page: 1,
      pageSize: 50,
      toolCode: activeTool.value.code,
    });
    runs.value = res?.items ?? [];
  } catch (error: any) {
    message.error(error?.message || '加载运行记录失败');
  } finally {
    runsLoading.value = false;
  }
}

async function loadModels() {
  try {
    const res = await aiModelApi.fetchModelConfigList({ page: 1, pageSize: 500 });
    models.value = (res?.items ?? [])
      .filter((item) => item.status === undefined || item.status === 1)
      .filter((item) => item.capability === 'text')
      .map((item) => ({
        label: `${item.model ?? ''}（${item.provider ?? item.source ?? ''}）`,
        value: item.id,
      }));
    modelId.value = models.value[0]?.value;
  } catch {
    models.value = [];
  }
}

async function loadNovels() {
  try {
    const res = await aiAssetApi.fetchNovelList({ page: 1, pageSize: 200 });
    novels.value = res?.items ?? [];
  } catch {
    novels.value = [];
  }
}

onMounted(async () => {
  await Promise.all([loadModels(), loadNovels()]);
  await loadGroups();
});
</script>

<template>
  <Page auto-content-height>
    <div class="wt-shell">
      <Card class="wt-card">
        <div class="wt-body">
          <div class="wt-toolbar">
            <span class="wt-title">写作工具箱</span>
            <Select
              v-model:value="refNovelId"
              allow-clear
              placeholder="参考书籍（可选）"
              style="width: 200px"
              :options="novels.map((item) => ({ label: `《${item.name || item.id}》`, value: item.id }))"
            />
            <Select
              v-model:value="modelId"
              placeholder="文本模型"
              style="width: 200px"
              :options="models"
              show-search
            />
            <span class="spacer"></span>
            <Button :disabled="!activeTool" @click="openRuns">
              <template #icon><HistoryOutlined /></template>
              运行记录
            </Button>
          </div>

          <div class="wt-grid">
            <Card size="small" class="wt-col wt-groups">
              <div class="wt-col__hd">工具分组</div>
              <div class="wt-col__scroll">
                <button
                  v-for="group in groups"
                  :key="group.value"
                  type="button"
                  class="wt-group"
                  :class="{ 'is-on': group.value === activeGroup }"
                  @click="selectGroup(group.value)"
                >
                  {{ group.label }}
                </button>
              </div>
            </Card>

            <Card size="small" class="wt-col wt-tools">
              <div class="wt-col__hd">
                工具
                <span class="muted">{{ tools.length }}</span>
              </div>
              <div class="wt-col__scroll">
                <Spin :spinning="toolLoading">
                  <Empty
                    v-if="!tools.length"
                    :image="Empty.PRESENTED_IMAGE_SIMPLE"
                    description="该分组暂无工具"
                  />
                  <button
                    v-for="item in tools"
                    :key="item.id"
                    type="button"
                    class="wt-tool"
                    :class="{ 'is-on': activeTool?.id === item.id }"
                    @click="selectTool(item)"
                  >
                    <span class="wt-tool__ic">
                      <ThunderboltOutlined />
                    </span>
                    <span class="wt-tool__text">
                      <b>{{ item.name }}</b>
                      <span>{{ item.description || '文本模型生成' }}</span>
                    </span>
                  </button>
                </Spin>
              </div>
            </Card>

            <Card size="small" class="wt-col wt-runner">
              <div class="wt-col__hd">
                {{ detail?.name || '选择工具' }}
                <Button
                  v-if="result"
                  type="link"
                  size="small"
                  @click="copyResult"
                >
                  <template #icon><CopyOutlined /></template>复制
                </Button>
              </div>
              <div class="wt-col__scroll">
                <Spin :spinning="detailLoading">
                  <Empty
                    v-if="!detail"
                    :image="Empty.PRESENTED_IMAGE_SIMPLE"
                    description="从中间选择工具"
                  />
                  <template v-else>
                    <p class="wt-desc">{{ detail.description }}</p>
                    <div
                      v-for="field in fields"
                      :key="field.key"
                      class="wt-field"
                    >
                      <span>
                        {{ field.label }}
                        <em v-if="field.required">*</em>
                      </span>
                      <Input.TextArea
                        v-if="field.type === 'textarea'"
                        v-model:value="inputs[field.key]"
                        :rows="4"
                        :placeholder="field.placeholder"
                      />
                      <Input
                        v-else-if="field.type === 'text'"
                        v-model:value="inputs[field.key]"
                        :placeholder="field.placeholder"
                      />
                      <Input
                        v-else-if="field.type === 'number'"
                        v-model:value="inputs[field.key]"
                        type="number"
                        :placeholder="field.placeholder"
                      />
                      <Select
                        v-else
                        v-model:value="inputs[field.key]"
                        :options="normalizeOptions(field)"
                        :placeholder="field.placeholder"
                      />
                    </div>

                    <div v-if="result" class="wt-result">
                      <div class="wt-result__hd">
                        生成结果
                        <Tag v-if="lastRun?.durationMs" :bordered="false">
                          {{ (lastRun.durationMs / 1000).toFixed(1) }}s
                        </Tag>
                      </div>
                      <div class="wt-result__body">{{ result }}</div>
                    </div>
                  </template>
                </Spin>
              </div>
              <div class="wt-runner__foot">
                <Button
                  type="primary"
                  block
                  :loading="running"
                  :disabled="!detail"
                  @click="run"
                >
                  <template #icon><PlayCircleOutlined /></template>
                  开始生成
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>

    <Modal
      v-model:open="runsOpen"
      title="运行记录"
      :footer="null"
      width="720px"
    >
      <Spin :spinning="runsLoading">
        <Empty v-if="!runs.length" description="还没有运行记录" />
        <div v-else class="wt-runs">
          <div v-for="item in runs" :key="item.runId" class="wt-run">
            <div class="wt-run__hd">
              <b>{{ item.toolName || item.toolCode }}</b>
              <span>{{ item.createTime }}</span>
              <Tag :bordered="false">
                {{ item.durationMs ? `${(item.durationMs / 1000).toFixed(1)}s` : '—' }}
              </Tag>
            </div>
            <p>{{ item.content }}</p>
          </div>
        </div>
      </Spin>
    </Modal>
  </Page>
</template>

<style scoped lang="scss">
.wt-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.wt-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px 16px;
  }
}

.wt-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.wt-toolbar {
  display: flex;
  flex: none;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.wt-title {
  font-size: 15px;
  font-weight: 600;
}

.spacer {
  flex: 1;
}

.wt-grid {
  display: grid;
  flex: 1;
  grid-template-columns: 180px minmax(0, 1fr) 380px;
  grid-template-rows: minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
}

.wt-col {
  display: flex;
  flex-direction: column;
  min-height: 0;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 10px;
  }

  &__hd {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
    border-bottom: 1px solid hsl(var(--border));
  }

  &__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}

.muted {
  font-size: 12px;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}

.wt-group {
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 2px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  text-align: left;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 8px;

  &:hover {
    background: hsl(var(--accent));
  }

  &.is-on {
    font-weight: 600;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 9%, transparent);
  }
}

.wt-tool {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 9px 10px;
  margin-bottom: 6px;
  text-align: left;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 9px;

  &:hover,
  &.is-on {
    border-color: color-mix(in srgb, hsl(var(--primary)) 45%, transparent);
  }

  &.is-on {
    background: color-mix(in srgb, hsl(var(--primary)) 6%, transparent);
  }

  &__ic {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
    border-radius: 7px;
  }

  &__text {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 13px;
    }

    span {
      display: block;
      overflow: hidden;
      font-size: 11px;
      color: hsl(var(--muted-foreground));
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.wt-desc {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

.wt-field {
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

.wt-result {
  margin-top: 10px;

  &__hd {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 600;
  }

  &__body {
    max-height: 260px;
    padding: 10px 12px;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.9;
    white-space: pre-wrap;
    background: hsl(var(--accent));
    border-radius: 8px;
  }
}

.wt-runner {
  &__foot {
    flex: none;
    padding-top: 10px;
    border-top: 1px solid hsl(var(--border));
  }
}

.wt-runs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 560px;
  overflow-y: auto;
}

.wt-run {
  padding: 10px 12px;
  background: hsl(var(--accent));
  border-radius: 9px;

  &__hd {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    color: hsl(var(--muted-foreground));

    b {
      font-size: 13px;
      color: hsl(var(--foreground));
    }
  }

  p {
    display: -webkit-box;
    margin: 6px 0 0;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.7;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
}

@media (width <= 1280px) {
  .wt-grid {
    grid-template-columns: 160px minmax(0, 1fr) 340px;
  }
}
</style>
