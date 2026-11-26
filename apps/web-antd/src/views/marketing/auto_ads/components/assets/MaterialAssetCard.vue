<script setup lang="ts" name="MaterialAssetCard">
import type { AssetCommonProps, MaterialAssetConfig } from './types';

import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  Alert,
  Checkbox,
  Col,
  FormItem,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  TreeSelect,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { materialLibraryApi, uploadEditApi } from '#/api/core';
import { getLabelColor } from '#/views/marketing/account/label/constants';

import AssetCardShell from './AssetCardShell.vue';

const props = defineProps<AssetCommonProps>();
const config = defineModel<MaterialAssetConfig>('config', { required: true });

const MATERIAL_CREATED_OPTIONS = [
  { label: '近 7 天', value: '7' },
  { label: '近 30 天', value: '30' },
  { label: '近 90 天', value: '90' },
  { label: '不限', value: 'all' },
];

const MATERIAL_TYPE_OPTIONS = [
  { label: '全部素材', value: 'all' },
  { label: '仅视频', value: 'video' },
  { label: '仅图片', value: 'image' },
];

const MATERIAL_FORMAT_OPTIONS = [
  { label: '不限', value: 'all' },
  { label: '竖版', value: 'vertical' },
  { label: '横版', value: 'horizontal' },
];

const folderTreeData = ref<any[]>([]);
const materialOptions = ref<Array<{ label: string; value: string }>>([]);
const materialLoading = ref(false);
let materialTimer: ReturnType<typeof setTimeout> | undefined;

function toTreeData(node: any): any {
  return {
    children: (node.children ?? []).map(toTreeData),
    title: node.name,
    value: String(node.id),
  };
}

async function loadFolders() {
  try {
    const res: any = await materialLibraryApi.fetchDirectoryTreeList();
    const roots = Array.isArray(res) ? res : [res].filter(Boolean);
    folderTreeData.value = roots.map(toTreeData);
  } catch {
    folderTreeData.value = [];
  }
}

async function loadMaterials() {
  materialLoading.value = true;
  try {
    const type =
      config.value.materialType === 'video'
        ? 2
        : config.value.materialType === 'image'
          ? 1
          : undefined;
    const format =
      config.value.materialFormat === 'vertical'
        ? 2
        : config.value.materialFormat === 'horizontal'
          ? 1
          : undefined;
    const days = Number(config.value.materialCreated);
    const timeRange =
      config.value.materialCreated === 'all' || !days
        ? undefined
        : [
            dayjs().subtract(days, 'day').format('YYYY-MM-DD'),
            dayjs().format('YYYY-MM-DD'),
          ];
    const base: any = {
      needAlbum: false,
      page: 1,
      pageSize: 50,
      ...(type ? { type } : {}),
      ...(format ? { format } : {}),
      ...(timeRange ? { timeRange } : {}),
      ...(props.tagIds.length ? { tagIds: props.tagIds } : {}),
    };
    const folders = config.value.materialFolders;
    const responses = folders.length
      ? await Promise.all(
          folders.map((albumId) =>
            uploadEditApi.fetchMaterialList({ ...base, albumId }),
          ),
        )
      : [await uploadEditApi.fetchMaterialList({ ...base, albumId: '' })];
    const seen = new Set<string>();
    const items = responses
      .flatMap((res: any) => res?.items ?? [])
      .filter((item: any) => item.fileUrl || item.fileMd5)
      .filter((item: any) => {
        const id = String(item.id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    materialOptions.value = items.map((item: any) => ({
      label: item.name || item.fileMd5 || String(item.id),
      value: String(item.id),
    }));
    const allowed = new Set(materialOptions.value.map((item) => item.value));
    config.value.materialSelected = config.value.materialSelected.filter((id) =>
      allowed.has(id),
    );
  } catch {
    materialOptions.value = [];
  } finally {
    materialLoading.value = false;
  }
}

watch(
  () => [
    config.value.materialFolders,
    config.value.materialCreated,
    config.value.materialType,
    config.value.materialFormat,
    props.tagIds,
  ],
  () => {
    if (materialTimer) {
      clearTimeout(materialTimer);
    }
    materialTimer = setTimeout(() => {
      void loadMaterials();
    }, 300);
  },
  { deep: true },
);

onMounted(() => {
  void Promise.all([loadFolders(), loadMaterials()]);
});

onBeforeUnmount(() => {
  if (materialTimer) {
    clearTimeout(materialTimer);
  }
});
</script>

<template>
  <AssetCardShell :asset="asset">
    <FormItem label="素材标签">
      <Space wrap>
        <Tag
          v-for="tag in tagNames"
          :key="tag"
          :color="getLabelColor(tag)"
          :bordered="false"
        >
          {{ tag }}
        </Tag>
      </Space>
    </FormItem>
    <Row :gutter="[24, 16]">
      <Col :span="12">
        <FormItem label="创建时间">
          <Select
            v-model:value="config.materialCreated"
            :options="MATERIAL_CREATED_OPTIONS"
          />
        </FormItem>
      </Col>
      <Col :span="12">
        <FormItem label="单次素材总量上限">
          <InputNumber
            v-model:value="config.materialTotal"
            class="!w-full"
            :min="1"
          />
        </FormItem>
      </Col>
      <Col :span="24">
        <FormItem label="文件夹范围">
          <TreeSelect
            v-model:value="config.materialFolders"
            :tree-data="folderTreeData"
            max-tag-count="responsive"
            placeholder="请选择文件夹范围"
            show-checked-strategy="SHOW_CHILD"
            tree-checkable
            tree-default-expand-all
          />
        </FormItem>
      </Col>
      <Col :span="12">
        <FormItem label="素材类型">
          <Select
            v-model:value="config.materialType"
            :options="MATERIAL_TYPE_OPTIONS"
          />
        </FormItem>
      </Col>
      <Col :span="12">
        <FormItem label="素材格式">
          <Select
            v-model:value="config.materialFormat"
            :options="MATERIAL_FORMAT_OPTIONS"
          />
        </FormItem>
      </Col>
      <Col :span="24">
        <FormItem label="选择素材">
          <Select
            v-model:value="config.materialSelected"
            :loading="materialLoading"
            :options="materialOptions"
            max-tag-count="responsive"
            mode="multiple"
            option-filter-prop="label"
            placeholder="按当前标签和文件夹条件从素材库选择"
            show-search
          />
        </FormItem>
      </Col>
    </Row>
    <Checkbox v-model:checked="config.materialDedupe">按 MD5 去重</Checkbox>
    <Alert
      class="mt-3"
      type="info"
      show-icon
      message="每个广告的素材数和分配方式由策略组控制，自动任务不重复配置。"
    />
  </AssetCardShell>
</template>
