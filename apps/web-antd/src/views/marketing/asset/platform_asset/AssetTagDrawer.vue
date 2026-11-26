<script setup lang="ts" name="AssetTagDrawer">
/**
 * 媒体资产 — 全局本地标签覆盖保存
 *
 * 标签列表复用 advertiser_tag；应用后通过 /platform_asset/batch_label 覆盖所选资产标签。
 */
import type {
  PlatformAssetItem,
  PlatformAssetType,
} from '#/api/models/platform_asset';

import { computed, h, ref, watch } from 'vue';

import { Button, Drawer, message, Select, Spin, Tag } from 'ant-design-vue';

import { platformAssetApi } from '#/api/core';
import { getLabelColor } from '#/views/marketing/account/label/constants';
import { useAccountLabelOptions } from '#/views/marketing/account/label/useAccountLabelOptions';

const props = defineProps<{
  assetType: PlatformAssetType;
  open: boolean;
  targets: PlatformAssetItem[];
}>();

const emit = defineEmits<{
  'success': [];
  'update:open': [boolean];
}>();

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const { labelOptions, loadLabelOptions } = useAccountLabelOptions();

const selectedLabelIds = ref<string[]>([]);
const loading = ref(false);
const submitting = ref(false);

const title = computed(() => {
  if (props.targets.length === 1) {
    return `打标签 · ${props.targets[0]?.assetName ?? ''}`;
  }
  return `批量打标签 · ${props.targets.length} 个资产`;
});

function tagRender(tagProps: any) {
  return h(
    Tag,
    {
      bordered: false,
      closable: tagProps.closable,
      color: getLabelColor(tagProps.label),
      onClose: tagProps.onClose,
      style: { marginInlineEnd: '4px' },
    },
    () => tagProps.label,
  );
}

async function openDrawer() {
  loading.value = true;
  try {
    await loadLabelOptions(true);
    selectedLabelIds.value = initialSelection();
  } finally {
    loading.value = false;
  }
}

/** 单个资产沿用原标签；批量取交集，避免默认清空未涉及标签 */
function initialSelection(): string[] {
  if (props.targets.length === 1) {
    return (props.targets[0]?.labelIds ?? []).map(String);
  }
  if (props.targets.length === 0) {
    return [];
  }
  const sets = props.targets.map(
    (target) => new Set((target.labelIds ?? []).map(String)),
  );
  return [...sets[0]!].filter((id) => sets.every((set) => set.has(id)));
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      void openDrawer();
    }
  },
);

async function applyTags() {
  if (props.targets.length === 0) {
    return;
  }
  submitting.value = true;
  try {
    const result = await platformAssetApi.fetchBatchLabel({
      platform: 'bytedance',
      assetType: props.assetType,
      ids: props.targets.map((target) => String(target.id)),
      labelIds: selectedLabelIds.value,
      reason: '媒体资产本地标签覆盖',
    });
    if (result.failedCount > 0) {
      const firstFailure = result.items?.find((item) => !item.success);
      message.warning(
        `成功 ${result.successCount} 个，失败 ${result.failedCount} 个${
          firstFailure?.message ? `：${firstFailure.message}` : ''
        }`,
      );
    } else {
      message.success(`已覆盖更新 ${result.successCount} 个资产的本地标签`);
    }
    emit('success');
    visible.value = false;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <Drawer v-model:open="visible" :width="440">
    <template #title>
      <span>{{ title }}</span>
    </template>

    <div class="flex flex-col gap-3">
      <div
        class="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
      >
        覆盖保存：应用后将替换所选资产的本地标签；未选择任何标签表示清空。标签为全局标签，只保存在本地，不回写媒体平台。
      </div>

      <Spin :spinning="loading" class="!w-full">
        <Select
          v-model:value="selectedLabelIds"
          allow-clear
          class="!w-full"
          mode="multiple"
          option-filter-prop="label"
          :options="labelOptions"
          :placeholder="labelOptions.length ? '请选择标签' : '暂无可用标签'"
          :tag-render="tagRender"
          show-search
        />
        <div
          v-if="!loading && labelOptions.length === 0"
          class="mt-2 text-xs text-muted-foreground"
        >
          暂无全局标签，请到「标签管理」中新建后再来打标。
        </div>
      </Spin>

      <div class="text-xs text-muted-foreground">
        当前已选 {{ selectedLabelIds.length }} 个标签
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="visible = false">取消</Button>
        <Button :loading="submitting" type="primary" @click="applyTags">
          覆盖保存
        </Button>
      </div>
    </template>
  </Drawer>
</template>
