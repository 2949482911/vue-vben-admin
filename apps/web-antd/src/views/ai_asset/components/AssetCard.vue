<script lang="ts" setup name="AssetCard">
/**
 * 资产卡片外壳（角色 / 场景 / 分集共用）
 *
 * 三个分段只有 tint、图标与文案不同，卡片结构与操作区集中在这里，避免三份重复。
 * 操作按钮由 actions 声明，点击后以 key 抛给父组件处理。
 */
import type { Component } from 'vue';

const props = withDefaults(
  defineProps<{
    actions: Array<{
      danger?: boolean;
      icon?: Component;
      key: string;
      label: string;
    }>;
    body?: string;
    icon: Component;
    imageUrl?: string;
    name: string;
    sub?: string;
    tags?: string[];
    tint?: 'character' | 'episode' | 'scene';
  }>(),
  {
    body: '',
    imageUrl: '',
    sub: '',
    tags: () => [],
    tint: 'character',
  },
);

const emit = defineEmits<{ action: [key: string] }>();
</script>

<template>
  <article class="asset-card" :class="`asset-card--${props.tint}`">
    <div class="asset-head">
      <img
        v-if="props.imageUrl"
        :alt="props.name"
        class="asset-ic asset-ic--img"
        :src="props.imageUrl"
      />
      <span v-else class="asset-ic">
        <component :is="props.icon" />
      </span>
      <div class="asset-head-text">
        <div class="asset-name">{{ props.name }}</div>
        <div class="asset-desc">{{ props.sub }}</div>
      </div>
    </div>

    <div v-if="props.body" class="asset-desc asset-body">{{ props.body }}</div>

    <div v-if="props.tags && props.tags.length > 0" class="asset-tags">
      <span v-for="tag in props.tags" :key="tag" class="mtag">{{ tag }}</span>
    </div>

    <div class="asset-foot">
      <button
        v-for="action in props.actions"
        :key="action.key"
        class="link-btn"
        :class="{ 'link-btn--danger': action.danger }"
        type="button"
        @click="emit('action', action.key)"
      >
        <component :is="action.icon" v-if="action.icon" />
        {{ action.label }}
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
.asset-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  padding: 14px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
  transition: border-color 0.16s ease;
}

.asset-card:hover {
  border-color: color-mix(in srgb, var(--tint, hsl(var(--primary))) 34%, transparent);
}

.asset-card--character {
  --tint: hsl(var(--primary));
}

.asset-card--scene {
  --tint: hsl(187 78% 38%);
}

.asset-card--episode {
  --tint: hsl(258 84% 62%);
}

.asset-head {
  display: flex;
  gap: 10px;
  align-items: center;
}

.asset-head-text {
  min-width: 0;
}

.asset-ic {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  overflow: hidden;
  font-size: 18px;
  color: #fff;
  background: var(--tint, hsl(var(--primary)));
  border-radius: 10px;
}

.asset-ic--img {
  object-fit: cover;
}

.asset-name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-desc {
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

.asset-body {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.asset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mtag {
  padding: 1px 7px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
  border-radius: 5px;
}

.asset-foot {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 4px;
}

.link-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 6px;
  font-size: 12px;
  color: hsl(var(--primary));
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 6px;
}

.link-btn:hover {
  background: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
}

.link-btn--danger {
  color: hsl(var(--destructive));
}

.link-btn--danger:hover {
  background: color-mix(in srgb, hsl(var(--destructive)) 10%, transparent);
}
</style>
