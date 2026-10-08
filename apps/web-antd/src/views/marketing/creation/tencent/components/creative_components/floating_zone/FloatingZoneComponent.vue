<script setup lang="ts" name="FloatingZoneComponent">
import type { CreativeComponentState, CreativeMaterialImage } from "../types";
import type { TencentFloatingZoneValue } from "./floatingZone";

/**
 * 浮层卡片组件（腾讯 creative_components.floating_zone）
 * 图片从素材库选，只提交 materialIdsList，由后端按浮动卡片类型上传后回填对应的 *_image_id；
 * jump_info 是独立的落地页结构，本次不做配置
 */
import type { AccountInfo } from "#/views/marketing/creation/creation";

import { Input, Select, Switch } from "ant-design-vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";
import {
  Tencent_floating_zone_info_type,
  Tencent_floating_zone_type
} from "#/views/marketing/creation/tencent/tencent_enums";

import CreativeComponentPanel from "../CreativeComponentPanel.vue";
import CreativeImagePicker from "../CreativeImagePicker.vue";
import {
  DEFAULT_FLOATING_ZONE_INFO_TYPE,
  DEFAULT_FLOATING_ZONE_TYPE,
  FLOATING_ZONE_SINGLE_IMAGE_TYPE
} from "./floatingZone";

const props = defineProps({
  /** 参与投放的账户列表 */
  accountInfo: {
    type: Array as unknown as () => AccountInfo[],
    default: () => []
  },
  /** 组件配置：开关 + 分配方式 + 按位置的配置 */
  modelValue: {
    type: Object as unknown as () => CreativeComponentState<TencentFloatingZoneValue>,
    default: () => ({ enabled: false, method: RuleMethod.ALL, data: {} })
  }
});

const emit = defineEmits(["update:modelValue"]);

/** 判定某个位置是否已配置完整：浮层图片 + 文案一 */
function isFilled(value?: TencentFloatingZoneValue) {
  return Boolean(value?.floating_zone_name && value?.materialIdsList?.length);
}

type Patch = (draft: (value: Record<string, any>) => void) => void;

/** 写入素材库选中的浮层图片 */
function setZoneImage(
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
    title="浮层卡片组件"
    media-key="floating_zone"
    tip="投放版位包含视频号时，必须配置浮层卡片或多卡轮播，创意才能在视频号版位正常播放"
    :account-info="props.accountInfo"
    :model-value="props.modelValue"
    :is-filled="isFilled"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #default="{ value, patch }">
      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          卡片类型
        </span>
        <div class="min-w-0">
          <Select
            :value="value.floating_zone_type || DEFAULT_FLOATING_ZONE_TYPE"
            :options="Tencent_floating_zone_type"
            class="w-[300px]"
            @update:value="
              (val: any) => patch((d) => (d.floating_zone_type = val))
            "
          />
          <div class="mt-1 text-xs text-black/45">
            floating_zone_type，单图浮层取单图，其余类型取浮层卡片图片
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          浮层图片
        </span>
        <div class="min-w-0">
          <CreativeImagePicker
            :ids="value.materialIdsList ?? []"
            :materials="value.materials ?? []"
            :max-count="1"
            :tip="
              value.floating_zone_type === FLOATING_ZONE_SINGLE_IMAGE_TYPE
                ? '单图浮层：482*270，不超过 50KB，jpg/jpeg/png；只提交 materialIdsList，由后端上传并回填 floating_zone_single_image_id'
                : '512*512，不超过 50KB，jpg/jpeg/png；只提交 materialIdsList，由后端上传并回填 floating_zone_image_id'
            "
            @select="(res) => setZoneImage(res, patch)"
          />
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          文案一
        </span>
        <div class="min-w-0">
          <Input
            :value="value.floating_zone_name"
            :maxlength="10"
            class="!w-[300px]"
            placeholder="如：限时福利"
            @update:value="
              (val: string) => patch((d) => (d.floating_zone_name = val))
            "
          />
          <div class="mt-1 text-xs text-black/45">
            floating_zone_name，最多 10 个等宽字符（10 个中文或 20 个英文）
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          文案二
        </span>
        <div class="min-w-0">
          <Input
            :value="value.floating_zone_desc"
            :maxlength="14"
            class="!w-[400px]"
            placeholder="如：点击立即领取专属优惠"
            @update:value="
              (val: string) => patch((d) => (d.floating_zone_desc = val))
            "
          />
          <div class="mt-1 text-xs text-black/45">
            floating_zone_desc，最多 14 个等宽字符（14 个中文或 28 个英文）
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          按钮文案
        </span>
        <div class="min-w-0">
          <Input
            :value="value.floating_zone_button_text"
            :maxlength="10"
            class="!w-[300px]"
            placeholder="如：立即查看"
            @update:value="
              (val: string) =>
                patch((d) => (d.floating_zone_button_text = val))
            "
          />
          <div class="mt-1 text-xs text-black/45">
            floating_zone_button_text，最多 10 个等宽字符
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          外显类型
        </span>
        <div class="min-w-0">
          <Select
            :value="
              value.floating_zone_info_type || DEFAULT_FLOATING_ZONE_INFO_TYPE
            "
            :options="Tencent_floating_zone_info_type"
            class="w-[300px]"
            @update:value="
              (val: any) => patch((d) => (d.floating_zone_info_type = val))
            "
          />
          <div class="mt-1 text-xs text-black/45">
            floating_zone_info_type
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          视频号基础态
        </span>
        <div class="min-w-0">
          <Input
            :value="value.button_base_text"
            :maxlength="10"
            class="!w-[300px]"
            placeholder="视频号基础态文案"
            @update:value="
              (val: string) => patch((d) => (d.button_base_text = val))
            "
          />
          <div class="mt-1 text-xs text-black/45">
            button_base_text，最多 10 字节
          </div>
        </div>
      </div>

      <div class="flex items-start gap-2">
        <span class="w-[84px] shrink-0 pt-[5px] text-right text-sm text-black/65">
          下载人数评分
        </span>
        <div class="flex min-w-0 items-center gap-2">
          <Switch
            :checked="Boolean(value.floating_zone_show_app_property_switch)"
            @change="
              (checked: any) =>
                patch(
                  (d) => (d.floating_zone_show_app_property_switch = checked)
                )
            "
          />
          <span class="text-xs text-black/45">
            显示已下载人数及评分（仅限应用下载类营销）
          </span>
        </div>
      </div>
    </template>
  </CreativeComponentPanel>
</template>
