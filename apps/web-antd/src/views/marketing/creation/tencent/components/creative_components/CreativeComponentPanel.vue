<script setup lang="ts" name="CreativeComponentPanel">
import type { CreativeComponentState } from "./types";

/**
 * 创意组件面板外壳（通用）
 *
 * 每个创意组件（品牌形象 / 行动按钮 / 标签 …）都套这一层，只把「需要填什么」交给插槽，
 * 其余交互——开关、分配方式（全部相同 / 分账户匹配）、账户切换、未配置提示——统一在这里实现。
 *
 * 用法（见 brand/BrandComponent.vue）：
 *   <CreativeComponentPanel title="品牌形象组件" media-key="brand" :account-info="accountInfo"
 *     :model-value="modelValue" :is-filled="isFilled"
 *     @update:model-value="emit('update:modelValue', $event)">
 *     <template #default="{ value, patch }"> ... 各自的字段 ... </template>
 *   </CreativeComponentPanel>
 */
import type { AccountInfo } from "#/views/marketing/creation/creation";

import { computed, ref, watch } from "vue";

import { RadioButton, RadioGroup, Switch } from "ant-design-vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";

import { ALL_ACCOUNT_KEY } from "./types";

const props = defineProps({
  /** 组件名称，如「品牌形象组件」 */
  title: {
    type: String,
    default: ""
  },
  /** 媒体字段名，展示在名称后，便于和提交给腾讯的 creative_components 对齐 */
  mediaKey: {
    type: String,
    default: ""
  },
  /** 一句话说明 */
  tip: {
    type: String,
    default: ""
  },
  /** 参与投放的账户列表 */
  accountInfo: {
    type: Array as unknown as () => AccountInfo[],
    default: () => []
  },
  /** 该组件的完整配置（开关 + 分配方式 + 按位置的配置） */
  modelValue: {
    type: Object as unknown as () => CreativeComponentState<Record<string, any>>,
    default: () => ({ enabled: false, method: RuleMethod.ALL, data: {} })
  },
  /** 判定某个位置（全部相同 / 某个账户）是否已配置完整，由各组件自己实现 */
  isFilled: {
    type: Function as unknown as () => (value: any) => boolean,
    default: () => () => false
  }
});

const emit = defineEmits(["update:modelValue"]);

/** 统一兜底，保证模板里拿到的都有默认形状 */
const state = computed<CreativeComponentState<Record<string, any>>>(() => {
  const value = props.modelValue;
  return {
    enabled: value?.enabled ?? false,
    method: value?.method || RuleMethod.ALL,
    data: value?.data || {}
  };
});

/** 当前正在编辑的位置：全部相同 = "0"，分账户匹配 = 账户 id */
const currentKey = ref<string>(ALL_ACCOUNT_KEY);

/** 当前分配方式下可选的位置 */
const keys = computed<string[]>(() =>
  state.value.method === RuleMethod.ACCOUNT
    ? props.accountInfo.map((item) => item.localAdvertiserId)
    : [ALL_ACCOUNT_KEY]
);

/** 已配置完整的位置数量 */
const filledCount = computed(
  () =>
    keys.value.filter((key) => props.isFilled(state.value.data[key])).length
);

/** 还没配置的位置 */
const emptyKeys = computed(() =>
  keys.value.filter((key) => !props.isFilled(state.value.data[key]))
);

/** 当前位置已配置的提示文案 */
const statusText = computed(() => {
  if (!state.value.enabled) return "未开启";
  if (state.value.method !== RuleMethod.ACCOUNT) {
    return props.isFilled(state.value.data[ALL_ACCOUNT_KEY])
      ? "全部相同 · 已配置"
      : "全部相同 · 待填写";
  }
  return `分账户匹配 · ${filledCount.value}/${keys.value.length}`;
});

const statusType = computed(() => {
  if (!state.value.enabled) return "idle";
  if (state.value.method !== RuleMethod.ACCOUNT) {
    return props.isFilled(state.value.data[ALL_ACCOUNT_KEY]) ? "ok" : "warn";
  }
  return emptyKeys.value.length === 0 ? "ok" : "warn";
});

/** 当前编辑位置的一份配置 */
const currentValue = computed<Record<string, any>>(
  () => state.value.data[currentKey.value] ?? {}
);

const currentAccountName = computed(
  () =>
    props.accountInfo.find((item) => item.localAdvertiserId === currentKey.value)
      ?.advertiserName ?? ""
);

watch(
  () => [state.value.method, props.accountInfo.length] as const,
  () => {
    if (!keys.value.includes(currentKey.value)) {
      currentKey.value = keys.value[0] ?? ALL_ACCOUNT_KEY;
    }
  },
  { immediate: true }
);

/**
 * 改当前这一份配置
 * 每次写回都产出一份新对象，避免直接改深层字段导致表单检测不到变化
 * @param draft 修改函数，直接改传入的对象即可
 */
function patch(draft: (value: Record<string, any>) => void) {
  const next: CreativeComponentState<Record<string, any>> = {
    ...state.value,
    data: { ...state.value.data }
  };
  const value = { ...(next.data[currentKey.value] ?? {}) };
  draft(value);
  next.data[currentKey.value] = value;
  emit("update:modelValue", next);
}

/** 开关 */
function toggle(enabled: boolean) {
  emit("update:modelValue", { ...state.value, enabled });
}

/** 切换分配方式 */
function changeMethod(value: any) {
  emit("update:modelValue", { ...state.value, method: value.target.value });
}

/** 把当前配置复制到其它位置，分账户匹配时省去逐个重填 */
function copyToAll() {
  const source = { ...currentValue.value };
  const data = { ...state.value.data };
  keys.value.forEach((key) => {
    data[key] = { ...source };
  });
  emit("update:modelValue", { ...state.value, data });
}
</script>

<template>
  <div class="creative-component-panel">
    <!-- 开关行 -->
    <div class="panel-head">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="title">{{ title }}</span>
          <span v-if="mediaKey" class="media-key">{{ mediaKey }}</span>
        </div>
        <div v-if="tip" class="tip">{{ tip }}</div>
      </div>
      <div class="ml-auto flex shrink-0 items-center gap-3">
        <span class="status" :class="`is-${statusType}`">{{ statusText }}</span>
        <Switch :checked="state.enabled" @change="(checked: any) => toggle(Boolean(checked))" />
      </div>
    </div>

    <!-- 展开区：开关打开才显示 -->
    <div v-if="state.enabled" class="panel-body">
      <div class="flex flex-wrap items-center gap-3">
        <span class="label">分配方式</span>
        <RadioGroup :value="state.method" @change="changeMethod">
          <RadioButton :value="RuleMethod.ALL">全部相同</RadioButton>
          <RadioButton :value="RuleMethod.ACCOUNT">分账户匹配</RadioButton>
        </RadioGroup>
        <span v-if="state.method === RuleMethod.ACCOUNT" class="text-xs text-black/45">
          已配置 {{ filledCount }} / {{ keys.length }} 个账户
        </span>
        <a
          v-if="state.method === RuleMethod.ACCOUNT"
          class="ml-auto text-xs"
          @click="copyToAll"
        >
          当前配置应用到全部账户
        </a>
      </div>

      <!-- 分账户匹配：切换编辑的账户 -->
      <div v-if="state.method === RuleMethod.ACCOUNT" class="flex flex-wrap gap-2">
        <span
          v-for="item in accountInfo"
          :key="item.localAdvertiserId"
          class="account-chip"
          :class="{ 'is-active': item.localAdvertiserId === currentKey }"
          @click="currentKey = item.localAdvertiserId"
        >
          <i
            class="dot"
            :class="{ 'is-empty': !isFilled(state.data[item.localAdvertiserId]) }"
          ></i>
          {{ item.advertiserName }}
        </span>
      </div>

      <!-- 各自的配置项 -->
      <div class="panel-fields">
        <slot :value="currentValue" :patch="patch" :account-name="currentAccountName"></slot>
      </div>

      <div v-if="state.method === RuleMethod.ACCOUNT && emptyKeys.length > 0" class="warn">
        还有 {{ emptyKeys.length }} 个账户未配置该组件，未配置的账户不会下发生成
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.creative-component-panel {
  border: 1px solid rgb(5 5 5 / 6%);
  border-radius: 8px;
  transition: border-color 0.2s;

  &:has(.panel-body) {
    border-color: #91caff;
  }
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
}

.title {
  font-size: 14px;
  font-weight: 500;
}

.media-key {
  padding: 1px 6px;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 11px;
  color: rgb(0 0 0 / 45%);
  background: rgb(0 0 0 / 4%);
  border-radius: 4px;
}

.tip {
  margin-top: 2px;
  font-size: 12px;
  color: rgb(0 0 0 / 45%);
}

.status {
  padding: 1px 8px;
  font-size: 12px;
  line-height: 18px;
  border: 1px solid transparent;
  border-radius: 100px;

  &.is-ok {
    color: #389e0d;
    background: #f6ffed;
    border-color: #b7eb8f;
  }

  &.is-warn {
    color: #d46b08;
    background: #fff7e6;
    border-color: #ffd591;
  }

  &.is-idle {
    color: rgb(0 0 0 / 45%);
    background: rgb(0 0 0 / 4%);
  }
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 14px;
  border-top: 1px dashed rgb(5 5 5 / 6%);
}

.label {
  font-size: 13px;
  color: rgb(0 0 0 / 65%);
}

.account-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 12px;
  font-size: 12px;
  color: rgb(0 0 0 / 65%);
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 100px;
  transition: all 0.2s;

  &:hover {
    color: #1677ff;
    border-color: #91caff;
  }

  &.is-active {
    color: #1677ff;
    background: #e6f4ff;
    border-color: #1677ff;
  }
}

.dot {
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;

  &.is-empty {
    background: #d9d9d9;
  }
}

.panel-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.warn {
  padding: 6px 10px;
  font-size: 12px;
  color: #d48806;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
}
</style>
