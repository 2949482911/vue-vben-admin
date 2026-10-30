<script lang="ts" setup name="EpisodeScriptView">
/**
 * 剧本 tab：展示剧本场次/正文，并承载「剧本校验」「剧本定稿」与状态。
 * 上游是 BookWorkbench 的剧本页；下游调用 useEpisodeScript，校验错误由 ScriptValidationModal 展示。
 */
import type {
  EpisodeItem,
  EpisodeScriptIssue,
} from '#/api/models/ai_asset';

import { computed } from 'vue';

import { Button, Tag } from 'ant-design-vue';

import { SCRIPT_STATUS } from '../status';

const props = defineProps<{
  episode: EpisodeItem;
  errors?: EpisodeScriptIssue[];
  finalizing?: boolean;
  status: number;
  statusMeta: { color: string; label: string };
  validating?: boolean;
  warnings?: EpisodeScriptIssue[];
}>();

const emit = defineEmits<{
  finalize: [];
  generate: [];
  validate: [];
}>();

const hasScript = computed(
  () => Boolean(props.episode.script || props.episode.scenes?.length),
);

function issueSummary() {
  const errors = props.errors?.length ?? 0;
  const warnings = props.warnings?.length ?? 0;
  if (!errors && !warnings) {
    return '';
  }
  return `校验：${errors} 个错误 · ${warnings} 个警告`;
}
</script>

<template>
  <div class="script-view nwb-doc">
    <div class="script-view__hd">
      <h3>
        剧本 · 第 {{ episode.seq }} 集
        <Tag :bordered="false" :color="statusMeta.color">
          {{ statusMeta.label }}
        </Tag>
      </h3>
      <div class="script-view__actions">
        <Button
          size="small"
          :disabled="!hasScript"
          :loading="validating"
          @click="emit('validate')"
        >
          剧本校验
        </Button>
        <Button
          v-if="status !== SCRIPT_STATUS.FINALIZED"
          size="small"
          type="primary"
          :disabled="!hasScript"
          :loading="finalizing"
          @click="emit('finalize')"
        >
          剧本定稿
        </Button>
      </div>
    </div>
    <p class="script-view__hint">
      {{
        status === SCRIPT_STATUS.FINALIZED
          ? '已定稿，可生成分镜；剧本修改后需重新定稿。'
          : status === SCRIPT_STATUS.EXPIRED
            ? '剧本内容已变更，状态已过期；请校验并重新定稿后再生成分镜。'
            : status === SCRIPT_STATUS.GENERATED
              ? '剧本已生成但未定稿；请校验并修复问题，再点「剧本定稿」。'
              : hasScript
                ? '剧本状态暂未同步；请先校验并定稿。'
                : '尚未生成剧本；先生成剧本，再校验并定稿。'
      }}
      <span v-if="issueSummary()" class="script-view__issues">
        {{ issueSummary() }}
      </span>
    </p>

    <template v-if="episode.scenes?.length">
      <div v-for="scene in episode.scenes" :key="scene.seq" class="nwb-scene">
        <div class="nwb-scene__hd">
          <span>第 {{ scene.seq }} 场 · {{ scene.heading }}</span>
        </div>
        <div
          v-for="(line, index) in scene.dialogue || []"
          :key="index"
          class="nwb-line"
        >
          <span>{{ line.role }}</span>
          <b>{{ line.line }}</b>
        </div>
        <p v-if="scene.action" class="nwb-action">{{ scene.action }}</p>
      </div>
    </template>
    <div v-else-if="episode.script" class="nwb-prose">
      {{ episode.script }}
    </div>
    <div v-else class="nwb-empty">
      <b>这一集还没有剧本</b>
      <span>按正文和细纲生成，可指定时长与创作要求</span>
      <Button type="primary" @click="emit('generate')">生成剧本</Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.script-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 20px 28px 28px;
  overflow-y: auto;

  h3 {
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
}

.script-view__hd {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.script-view__actions {
  display: flex;
  gap: 8px;
}

.script-view__hint {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.script-view__issues {
  margin-left: 8px;
  color: hsl(var(--warning));
}

.nwb-prose {
  margin-top: 12px;
  font-size: 15px;
  line-height: 2;
  white-space: pre-wrap;
}

.nwb-scene {
  margin-top: 16px;

  &__hd {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 9%, transparent);
    border-radius: 6px;
  }
}

.nwb-line {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.8;

  span {
    flex: none;
    width: 56px;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
    text-align: right;
  }
}

.nwb-action {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.8;
  color: hsl(var(--muted-foreground));
}

.nwb-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: hsl(var(--muted-foreground));

  b {
    font-size: 14px;
    color: hsl(var(--foreground));
  }
}
</style>
