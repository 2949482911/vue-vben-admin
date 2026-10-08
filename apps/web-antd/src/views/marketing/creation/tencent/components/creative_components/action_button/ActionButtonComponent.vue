<script setup lang="ts" name="ActionButtonComponent">
import type { CreativeComponentState } from "../types";
import type { TencentActionButtonValue } from "./actionButton";

/**
 * 行动按钮组件（腾讯 creative_components.action_button）
 * 字段：button_text（按钮文案）、mini_program_button_text（小程序按钮文案）、jump_info（落地页结构）
 * 文案只能从媒体预设的文案里选，见 Tencent_action_button_text
 */
import type { AccountInfo } from "#/views/marketing/creation/creation";

import { Select } from "ant-design-vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";
import { Tencent_action_button_text } from "#/views/marketing/creation/tencent/tencent_enums";

import CreativeComponentPanel from "../CreativeComponentPanel.vue";

const props = defineProps({
  /** 参与投放的账户列表 */
  accountInfo: {
    type: Array as unknown as () => AccountInfo[],
    default: () => []
  },
  /** 组件配置：开关 + 分配方式 + 按位置的配置 */
  modelValue: {
    type: Object as unknown as () => CreativeComponentState<TencentActionButtonValue>,
    default: () => ({ enabled: false, method: RuleMethod.ALL, data: {} })
  }
});

const emit = defineEmits(["update:modelValue"]);

/** 判定某个位置是否已配置完整：按钮文案填了其中一个即算 */
function isFilled(value?: TencentActionButtonValue) {
  return Boolean(value?.button_text || value?.mini_program_button_text);
}

/** 预览用的按钮文案：小程序落地页优先取 mini_program_button_text */
function previewText(value?: TencentActionButtonValue) {
  return value?.mini_program_button_text || value?.button_text || "按钮文案";
}
</script>

<template>
  <CreativeComponentPanel
    title="行动按钮组件"
    media-key="action_button"
    tip="创意卡片上的行动按钮文案，长度上限由创意形式（creative_template_id）决定"
    :account-info="props.accountInfo"
    :model-value="props.modelValue"
    :is-filled="isFilled"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #default="{ value, patch }">
      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          按钮文案
        </span>
        <div class="min-w-0">
          <Select
            :value="value.button_text"
            :options="Tencent_action_button_text"
            allow-clear
            class="w-[300px]"
            placeholder="请选择按钮文案"
            @update:value="(val: any) => patch((d) => (d.button_text = val))"
          />
          <div class="mt-1 text-xs text-black/45">
            button_text，只能取媒体预设文案
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          小程序按钮文案
        </span>
        <div class="min-w-0">
          <Select
            :value="value.mini_program_button_text"
            :options="Tencent_action_button_text"
            allow-clear
            class="w-[300px]"
            placeholder="请选择按钮文案"
            @update:value="
              (val: any) => patch((d) => (d.mini_program_button_text = val))
            "
          />
          <div class="mt-1 text-xs text-black/45">
            mini_program_button_text，落地页是微信小程序时用这个
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          效果预览
        </span>
        <div class="min-w-0 pt-[3px]">
          <span
            class="inline-flex h-8 items-center justify-center rounded-md bg-[#1677ff] px-[18px] text-sm text-white"
          >
            {{ previewText(value) }}
          </span>
        </div>
      </div>
    </template>
  </CreativeComponentPanel>
</template>
