<script setup lang="ts" name="LabelComponent">
import type { CreativeComponentState } from "../types";
import type { TencentLabelItem, TencentLabelValue } from "./label";

/**
 * 标签组件（腾讯 creative_components.label）
 * value 结构：{ list: [{ content, type, display_content }] }，可配置多条
 */
import type { AccountInfo } from "#/views/marketing/creation/creation";

import { Button, Input, Select } from "ant-design-vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";
import { Tencent_label_type } from "#/views/marketing/creation/tencent/tencent_enums";

import CreativeComponentPanel from "../CreativeComponentPanel.vue";

const props = defineProps({
  /** 参与投放的账户列表 */
  accountInfo: {
    type: Array as unknown as () => AccountInfo[],
    default: () => []
  },
  /** 组件配置：开关 + 分配方式 + 按位置的配置 */
  modelValue: {
    type: Object as unknown as () => CreativeComponentState<TencentLabelValue>,
    default: () => ({ enabled: false, method: RuleMethod.ALL, data: {} })
  }
});

const emit = defineEmits(["update:modelValue"]);

/** 标签条数上限（媒体侧 struct[] 上限 100，这里按运营习惯收敛） */
const MAX_LABEL_COUNT = 3;

/** 判定某个位置是否已配置完整：至少有一条填了标签内容 */
function isFilled(value?: TencentLabelValue) {
  return Boolean(value?.list?.some((item) => item?.content?.trim()));
}

/** 当前这一份配置里的标签列表，兜底成数组方便模板遍历 */
function labelList(value?: Record<string, any>): TencentLabelItem[] {
  return (value?.list as TencentLabelItem[] | undefined) ?? [];
}

type Patch = (draft: (value: Record<string, any>) => void) => void;

/** 改某一条标签的某个字段 */
function setItem(patch: Patch, index: number, key: string, text: string) {
  patch((draft) => {
    const list = [...(draft.list ?? [])];
    list[index] = { ...list[index], [key]: text };
    draft.list = list;
  });
}

/** 增一条标签：默认给通用标签 */
function addItem(patch: Patch) {
  patch((draft) => {
    draft.list = [
      ...(draft.list ?? []),
      { content: "", type: "LABEL_TYPE_COMMON", display_content: "" }
    ];
  });
}

/** 删一条标签 */
function removeItem(patch: Patch, index: number) {
  patch((draft) => {
    const list = [...(draft.list ?? [])];
    list.splice(index, 1);
    draft.list = list;
  });
}
</script>

<template>
  <CreativeComponentPanel
    title="标签组件"
    media-key="label"
    tip="创意上展示的营销标签，可配置多条，用于突出卖点"
    :account-info="props.accountInfo"
    :model-value="props.modelValue"
    :is-filled="isFilled"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #default="{ value, patch }">
      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          标签
        </span>
        <div class="flex min-w-0 flex-col gap-2">
          <div
            v-for="(item, index) in labelList(value)"
            :key="index"
            class="flex flex-wrap items-center gap-2"
          >
            <Input
              :value="item.content"
              :maxlength="12"
              class="!w-[200px]"
              placeholder="标签内容"
              @update:value="(val: string) => setItem(patch, index, 'content', val)"
            />
            <Select
              :value="item.type"
              :options="Tencent_label_type"
              class="w-[150px]"
              @update:value="(val: any) => setItem(patch, index, 'type', val)"
            />
            <Input
              :value="item.display_content"
              :maxlength="12"
              class="!w-[200px]"
              placeholder="显示内容（选填）"
              @update:value="
                (val: string) =>
                  setItem(patch, index, 'display_content', val)
              "
            />
            <span
              class="inline-flex h-[22px] items-center rounded border border-[#91caff] bg-[#e6f4ff] px-2 text-xs text-[#0958d9]"
            >
              {{ item.display_content || item.content || "标签预览" }}
            </span>
            <a
              v-if="labelList(value).length > 1"
              class="text-xs"
              @click="removeItem(patch, index)"
            >
              删除
            </a>
          </div>

          <div>
            <Button
              :disabled="labelList(value).length >= MAX_LABEL_COUNT"
              size="small"
              @click="addItem(patch)"
            >
              ＋ 添加一条标签
            </Button>
            <span class="ml-2 text-xs text-black/45">
              最多 {{ MAX_LABEL_COUNT }} 条，对应 creative_components.label[].value.list
            </span>
          </div>
        </div>
      </div>
    </template>
  </CreativeComponentPanel>
</template>
