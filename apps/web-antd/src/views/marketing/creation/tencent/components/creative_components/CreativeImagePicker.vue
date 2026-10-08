<script setup lang="ts" name="CreativeImagePicker">
import type { CreativeMaterialImage } from "./types";

import type { MaterialItem } from "#/api/models/assert";

/**
 * 创意组件里的图片选择（品牌形象 / 浮层卡片…共用）
 *
 * 只回传本地素材 id 和用于回显的缩略图信息，媒体侧的 *_image_id 由后端上传后回填。
 * 用法：把回传的 ids / materials 摆到自己组件的字段上，见 brand/BrandComponent.vue
 */
import { computed } from "vue";

import { useVbenModal } from "@vben/common-ui";

import { Button } from "ant-design-vue";

import MaterialSelector
  from "#/views/marketing/creation/components/material/MaterialSelector.vue";

const props = defineProps({
  /** 已选图片的本地素材 id */
  ids: {
    type: Array as unknown as () => string[],
    default: () => []
  },
  /** 已选图片的名称与地址，用于缩略图回显 */
  materials: {
    type: Array as unknown as () => CreativeMaterialImage[],
    default: () => []
  },
  /** 最多可选几张 */
  maxCount: {
    type: Number,
    default: 1
  },
  /** 字段说明 */
  tip: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["select"]);

const [MaterialSelectorModal, materialSelectorApi] = useVbenModal({
  connectedComponent: MaterialSelector
});

const picked = computed(() => props.materials ?? []);

/** 打开素材库，带上已选图片用于回显勾选 */
function open() {
  materialSelectorApi.setData({
    materialType: "image",
    maxCount: props.maxCount,
    currentMaterialGroupIndex: 0,
    preSelectedMaterials: picked.value,
    preSelectedIds: props.ids ?? []
  });
  materialSelectorApi.open();
}

/**
 * 接收素材库选中的图片
 * 跨页预选时素材库可能只回传 { id }，这里跟已有记录合并，避免丢掉之前拿到的缩略图
 */
function onPicked(items: MaterialItem[]) {
  const list = items.filter((item) => item.id !== undefined);
  const ids = list.map((item) => String(item.id));
  const known = new Map<string, CreativeMaterialImage>(
    picked.value.map((item) => [item.id, item])
  );

  list.forEach((item) => {
    if (item.fileUrl) {
      known.set(String(item.id), {
        id: String(item.id),
        name: item.name,
        url: item.fileUrl
      });
    }
  });

  emit("select", {
    ids,
    materials: ids
      .map((id) => known.get(id))
      .filter((item): item is CreativeMaterialImage => item !== undefined)
  });
}

/** 清空已选图片 */
function clear() {
  emit("select", { ids: [], materials: [] });
}
</script>

<template>
  <div class="creative-image-picker">
    <div v-if="picked.length" class="flex items-center gap-2">
      <img
        v-for="item in picked"
        :key="item.id"
        :src="item.url"
        :alt="item.name"
        class="h-[72px] w-[72px] rounded border border-black/10 object-cover"
      />
      <Button size="small" @click="open">重新选择</Button>
      <a class="text-xs" @click="clear">清空</a>
    </div>
    <Button v-else size="small" @click="open">选择素材</Button>

    <div v-if="tip" class="mt-1 text-xs text-black/45">{{ tip }}</div>

    <MaterialSelectorModal @update:material="onPicked" />
  </div>
</template>
