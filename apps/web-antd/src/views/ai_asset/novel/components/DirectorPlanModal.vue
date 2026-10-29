<script lang="ts" setup name="DirectorPlanModal">
/**
 * 导演规划抽屉（P1）：位于分镜页 → 段落生成之前。
 * 由 BookWorkbench 打开，进入时优先读取后端已保存规划，没有再用 episode.config 兜底；
 * 支持生成/编辑/批量切换生成模式/保存，保存后由后端重算 segments。
 */
import type { DirectorPlanSegment } from '#/api/models/ai_asset';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Empty, Input, InputNumber, message, Select, Spin, Tag } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

const emit = defineEmits<{ saved: [] }>();

const loading = ref(false);
const saving = ref(false);
const segments = ref<DirectorPlanSegment[]>([]);
const episodeId = ref<number | string>();
const modelId = ref<number | string>();
const maxDurationSeconds = ref<number>();

const MODE_OPTIONS = [
  { label: '段落生成', value: 'segment' },
  { label: '单镜生成', value: 'shot' },
];

/** 后端可能返回 {segments}、{plan:{segments}} 或数组，统一成可编辑列表 */
function normalizePlan(raw: any): DirectorPlanSegment[] {
  const list = Array.isArray(raw)
    ? raw
    : (raw?.segments ??
      raw?.plan?.segments ??
      raw?.directorPlan?.segments ??
      []);
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((segment: any) => ({
    ...segment,
    dialogue: (segment.dialogue ?? []).map((line: any) => ({ ...line })),
    durationSeconds: Number(segment.durationSeconds ?? 0) || undefined,
    generationMode: segment.generationMode === 'shot' ? 'shot' : 'segment',
  }));
}

function addDialogue(segment: DirectorPlanSegment) {
  if (!segment.dialogue) {
    segment.dialogue = [];
  }
  segment.dialogue.push({ emotion: '', line: '', speaker: '' });
}

function removeDialogue(segment: DirectorPlanSegment, index: number) {
  segment.dialogue?.splice(index, 1);
}

function dialogueText(segment: DirectorPlanSegment) {
  return (segment.dialogue ?? []).map((item) => item.line ?? '').join('');
}

function durationWarning(segment: DirectorPlanSegment) {
  const max = maxDurationSeconds.value;
  if (!max || !segment.durationSeconds) {
    return '';
  }
  return segment.durationSeconds > max
    ? `超过模型时长上限 ${max} 秒`
    : '';
}

/** 批量动作只改当前草稿，仍需点保存才写回后端 */
function setAllMode(mode: 'segment' | 'shot') {
  for (const segment of segments.value) {
    segment.generationMode = mode;
  }
  message.info(
    mode === 'segment'
      ? '已批量改为段落生成，请保存规划'
      : '已批量改为单镜生成，请保存规划',
  );
}

async function loadSavedPlan() {
  if (!episodeId.value) {
    return;
  }
  loading.value = true;
  try {
    // 后端没有单独 GET：POST director/plan + regenerate=false 返回已有段落
    const res = await aiAssetApi.generateDirectorPlan(
      {
        episodeId: episodeId.value,
        modelId: modelId.value,
        regenerate: false,
      },
      true,
    );
    const saved = normalizePlan(res);
    if (saved.length) {
      segments.value = saved;
    }
  } catch {
    // 读取失败时保留 episode.config 的兜底数据
  } finally {
    loading.value = false;
  }
}

async function generatePlan() {
  if (!episodeId.value) {
    return;
  }
  loading.value = true;
  try {
    const res = await aiAssetApi.generateDirectorPlan({
      episodeId: episodeId.value,
      modelId: modelId.value,
      regenerate: true,
    });
    segments.value = normalizePlan(res);
    if (!segments.value.length) {
      message.info('导演规划返回为空');
    }
  } catch (error: any) {
    message.error(error?.message || '导演规划接口未就绪，请稍后再试');
  } finally {
    loading.value = false;
  }
}

async function savePlan() {
  if (!episodeId.value || !segments.value.length) {
    return;
  }
  saving.value = true;
  try {
    await aiAssetApi.saveDirectorPlan({
      episodeId: episodeId.value,
      // 只提交后端 SegmentInput 认识的字段，避免把 id/shotType 等前端辅助字段带过去
      segments: segments.value.map((segment) => ({
        action: segment.action,
        dialogue: segment.dialogue ?? [],
        durationSeconds: segment.durationSeconds,
        firstFrameMaterialId: segment.firstFrameMaterialId,
        generationMode: segment.generationMode,
        lastFrameMaterialId: segment.lastFrameMaterialId,
        sceneSeq: segment.sceneSeq,
        seq: segment.seq,
        shotIds: segment.shotIds ?? [],
      })),
    });
    message.success('导演规划已保存，正在刷新段落');
    emit('saved');
    await drawerApi.close();
  } catch (error: any) {
    message.error(error?.message || '导演规划保存接口未就绪，请稍后再试');
  } finally {
    saving.value = false;
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[1000px]',
  contentClass: 'flex min-h-0 flex-col gap-3 p-3',
  closeOnPressEscape: true,
  footer: false,
  async onOpenChange(open) {
    if (!open) {
      return;
    }
    const data = drawerApi.getData() as
      | undefined
      | {
          episodeId?: number | string;
          initialPlan?: unknown;
          maxDurationSeconds?: number;
          modelId?: number | string;
        };
    episodeId.value = data?.episodeId;
    modelId.value = data?.modelId;
    maxDurationSeconds.value = data?.maxDurationSeconds;
    segments.value = normalizePlan(data?.initialPlan);
    await loadSavedPlan();
  },
});
</script>

<template>
  <Drawer title="导演规划">
    <div class="director">
      <div class="director__bar">
        <span class="director__tip">
          规划段落时长、台词、动作与生成模式；保存后由后端重算段落
        </span>
        <Button size="small" :loading="loading" @click="generatePlan">
          {{ segments.length ? '重新生成规划' : '生成规划' }}
        </Button>
        <Button
          size="small"
          :disabled="!segments.length"
          @click="setAllMode('segment')"
        >
          批量改为段落生成
        </Button>
        <Button
          size="small"
          :disabled="!segments.length"
          @click="setAllMode('shot')"
        >
          批量改为单镜生成
        </Button>
        <Button
          size="small"
          type="primary"
          :disabled="!segments.length"
          :loading="saving"
          @click="savePlan"
        >
          保存规划
        </Button>
      </div>

      <Spin :spinning="loading">
        <Empty
          v-if="!segments.length"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="还没有导演规划，先点「生成规划」"
        />
        <div v-else class="director__list">
          <div
            v-for="(segment, index) in segments"
            :key="`${segment.sceneSeq}-${segment.seq}-${index}`"
            class="director-row"
          >
            <div class="director-row__hd">
              <b>第 {{ segment.sceneSeq }} 场 · 段 {{ segment.seq }}</b>
              <Tag :bordered="false">
                台词 {{ dialogueText(segment).length }} 字
              </Tag>
              <span
                v-if="durationWarning(segment)"
                class="director-row__warn"
              >
                {{ durationWarning(segment) }}
              </span>
              <span class="spacer"></span>
              <label class="director-row__field">
                <span>时长</span>
                <InputNumber
                  v-model:value="segment.durationSeconds"
                  :min="2"
                  :max="maxDurationSeconds || 60"
                  size="small"
                  style="width: 90px"
                />
              </label>
              <Select
                v-model:value="segment.generationMode"
                :options="MODE_OPTIONS"
                size="small"
                style="width: 120px"
              />
            </div>

            <label class="director-row__field director-row__field--wide">
              <span>动作 / 画面</span>
              <Input v-model:value="segment.action" placeholder="本段动作与画面描述" />
            </label>

            <div class="director-dialogue">
              <div class="director-dialogue__hd">
                <span>台词（以段落为单位，不跨段）</span>
                <Button type="link" size="small" @click="addDialogue(segment)">
                  + 加一句
                </Button>
              </div>
              <div
                v-for="(line, lineIndex) in segment.dialogue || []"
                :key="lineIndex"
                class="director-dialogue__row"
              >
                <Input
                  v-model:value="line.speaker"
                  placeholder="说话人"
                  size="small"
                  style="width: 110px"
                />
                <Input
                  v-model:value="line.line"
                  placeholder="台词内容"
                  size="small"
                />
                <Input
                  v-model:value="line.emotion"
                  placeholder="情绪"
                  size="small"
                  style="width: 90px"
                />
                <Button
                  danger
                  type="link"
                  size="small"
                  @click="removeDialogue(segment, lineIndex)"
                >
                  删除
                </Button>
              </div>
              <span v-if="!segment.dialogue?.length" class="director__tip">
                本段无台词（空镜/动作段）
              </span>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.director {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.director__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.director__tip {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.director__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.director-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: hsl(var(--accent));
  border-radius: 9px;

  &__hd {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    font-size: 13px;
  }

  &__warn {
    font-size: 12px;
    color: hsl(var(--destructive));
  }

  &__field {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: hsl(var(--muted-foreground));

    &--wide {
      width: 100%;
    }
  }
}

.director-dialogue {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__row {
    display: flex;
    gap: 6px;
    align-items: center;

    :deep(.ant-input) {
      flex: 1;
    }
  }
}

.spacer {
  flex: 1;
}
</style>
