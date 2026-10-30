<script lang="ts" setup name="AiContextPanel">
/**
 * AI 结果上下文面板：位于细纲/续写/审校结果上方，展示后端返回的参考来源与冲突。
 * 后端没有返回 references/conflicts 时整块不渲染；冲突只在 level=error 时标红。
 */
import type { AiContextConflict, AiReferenceSource } from '#/api/models/ai_asset';

import { computed, ref } from 'vue';

import { Button, Tag } from 'ant-design-vue';

const props = defineProps<{
  conflicts?: AiContextConflict[];
  flush?: boolean;
  references?: AiReferenceSource;
  staleEpisodes?: number[];
}>();

const expanded = ref(false);

/** 连续集号合并成 1–3，避免“第 1、2、3 集”过长 */
function formatEpisodeRanges(input?: Array<number | string>) {
  const seqs = [
    ...new Set(
      (input ?? [])
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item)),
    ),
  ].sort((a, b) => a - b);
  if (!seqs.length) {
    return '';
  }
  const parts: string[] = [];
  let start = seqs[0]!;
  let end = start;
  for (const seq of seqs.slice(1)) {
    if (seq === end + 1) {
      end = seq;
      continue;
    }
    parts.push(start === end ? `${start}` : `${start}–${end}`);
    start = seq;
    end = seq;
  }
  parts.push(start === end ? `${start}` : `${start}–${end}`);
  return parts.join('、');
}

const summary = computed(() => {
  const refs = props.references;
  if (!refs) {
    return '';
  }
  const parts: string[] = [];
  const episodeRange = formatEpisodeRanges(refs.episodes);
  if (episodeRange) {
    parts.push(`参考第 ${episodeRange} 集`);
  }
  if (refs.volumeNo) {
    parts.push(`第 ${refs.volumeNo} 卷摘要`);
  } else if (refs.volumeSummary) {
    parts.push('卷摘要');
  }
  if (refs.storyBible) {
    parts.push('Story Bible');
  }
  if (refs.foreshadows?.length) {
    parts.push(`${refs.foreshadows.length} 条伏笔`);
  }
  return parts.join(' · ');
});

const hasData = computed(
  () =>
    Boolean(summary.value) ||
    (props.conflicts?.length ?? 0) > 0 ||
    (props.staleEpisodes?.length ?? 0) > 0,
);
const hasError = computed(
  () => props.conflicts?.some((item) => item.level === 'error') ?? false,
);
</script>

<template>
  <div
    v-if="hasData"
    class="ai-reference"
    :class="{ 'has-error': hasError, 'is-flush': flush }"
  >
    <div class="ai-reference__hd">
      <span v-if="summary" class="ai-reference__summary">{{ summary }}</span>
      <Button
        v-if="references?.foreshadows?.length"
        type="link"
        size="small"
        @click="expanded = !expanded"
      >
        {{
          expanded
            ? '收起伏笔'
            : `伏笔 ${references.foreshadows.length} 条`
        }}
      </Button>
      <span v-if="staleEpisodes?.length" class="ai-reference__warn">
        参考的第 {{ formatEpisodeRanges(staleEpisodes) }} 集记忆可能已过期
      </span>
    </div>
    <div v-if="expanded" class="ai-reference__detail">
      <p
        v-for="(item, index) in references?.foreshadows ?? []"
        :key="index"
      >
        伏笔：{{ item.text }}
      </p>
    </div>
    <div
      v-for="(conflict, index) in conflicts ?? []"
      :key="index"
      class="ai-conflict"
      :class="conflict.level === 'error' ? 'is-error' : 'is-warn'"
    >
      <Tag
        :bordered="false"
        :color="conflict.level === 'error' ? 'red' : 'orange'"
      >
        {{ conflict.level === 'error' ? '硬冲突' : '软冲突' }}
      </Tag>
      <span>{{ conflict.message }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-reference {
  flex: none;
  padding: 8px 10px;
  margin: 8px 24px 0;
  font-size: 12px;
  background: color-mix(in srgb, hsl(var(--primary)) 5%, hsl(var(--background)));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  &.has-error {
    background: color-mix(in srgb, hsl(var(--destructive)) 6%, hsl(var(--background)));
    border-color: color-mix(in srgb, hsl(var(--destructive)) 35%, transparent);
  }

  &.is-flush {
    margin: 0;
  }
}

.ai-reference__hd {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.ai-reference__warn {
  color: hsl(var(--warning));
}

.ai-reference__summary {
  color: hsl(var(--foreground));
  font-weight: 600;
}

.ai-reference__detail {
  margin-top: 6px;

  p {
    margin: 2px 0;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
  }
}

.ai-conflict {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin-top: 4px;

  &.is-error span {
    color: hsl(var(--destructive));
  }

  &.is-warn span {
    color: hsl(var(--warning));
  }
}
</style>
