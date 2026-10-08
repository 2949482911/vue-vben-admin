<script setup lang="ts" name="BrandComponent">
import type { CreativeComponentState, CreativeMaterialImage } from "../types";
import type { TencentBrandValue } from "./brand";

/**
 * 品牌形象组件（腾讯 creative_components.brand）
 * 品牌名称走 value.brand_name，品牌图片从素材库选，只提交 materialIdsList，
 * 由后端上传到腾讯后回填 brand_image_id
 */
import type { AccountInfo } from "#/views/marketing/creation/creation";

import { Input } from "ant-design-vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";

import CreativeComponentPanel from "../CreativeComponentPanel.vue";
import CreativeImagePicker from "../CreativeImagePicker.vue";

const props = defineProps({
  /** 参与投放的账户列表 */
  accountInfo: {
    type: Array as unknown as () => AccountInfo[],
    default: () => []
  },
  /** 组件配置：开关 + 分配方式 + 按位置的配置 */
  modelValue: {
    type: Object as unknown as () => CreativeComponentState<TencentBrandValue>,
    default: () => ({ enabled: false, method: RuleMethod.ALL, data: {} })
  }
});

const emit = defineEmits(["update:modelValue"]);

/** 判定某个位置是否已配置完整：品牌名 + 品牌图都要有 */
function isFilled(value?: TencentBrandValue) {
  return Boolean(value?.brand_name && value?.materialIdsList?.length);
}

type Patch = (draft: (value: Record<string, any>) => void) => void;

/** 写入素材库选中的品牌图片 */
function setBrandImage(
  res: { ids: string[]; materials: CreativeMaterialImage[] },
  patch: Patch
) {
  patch((draft) => {
    draft.materialIdsList = res.ids;
    draft.materials = res.materials;
  });
}
</script>

<template>
  <CreativeComponentPanel
    title="品牌形象组件"
    media-key="brand"
    tip="投放版位含视频号时必须配置，否则创意在视频号版位无法播放"
    :account-info="props.accountInfo"
    :model-value="props.modelValue"
    :is-filled="isFilled"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #default="{ value, patch }">
      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          品牌名称
        </span>
        <div class="min-w-0">
          <Input
            :value="value.brand_name"
            class="!w-[300px]"
            placeholder="对外展示的品牌名"
            @update:value="(val: string) => patch((d) => (d.brand_name = val))"
          />
          <div class="mt-1 text-xs text-black/45">brand_name，最长 250 字节</div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          品牌图片
        </span>
        <div class="min-w-0">
          <CreativeImagePicker
            :ids="value.materialIdsList ?? []"
            :materials="value.materials ?? []"
            :max-count="1"
            tip="从素材库选 1 张图片，只提交 materialIdsList，由后端上传并回填 brand_image_id"
            @select="(res) => setBrandImage(res, patch)"
          />
        </div>
      </div>
    </template>
  </CreativeComponentPanel>
</template>
