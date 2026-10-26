<script lang="ts" setup name="MaterialLibrary">
/**
 * 素材库
 *
 * 类型分段（带计数）+ 名称搜索 + 状态筛选 + 批量删除 + 分页；卡片见 MaterialCard.vue，
 * 新增素材走 MaterialUploadDrawer（OSS 直传后交给后端登记）。
 *
 * ⚠ 后端 material/list 不支持按名称检索与来源字段，搜索为「当前页」本地过滤；
 *    POST /material/upload、POST /material/batch_options 尚未实现时会在行内/接口层报错。
 */
import type { MaterialItem, MaterialType } from '#/api/models/ai_asset';
import type { BatchOptions } from '#/api/models/core';

import { computed, onMounted, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { SearchOutlined, UploadOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Col,
  Empty,
  Input,
  message,
  Pagination,
  Row,
  Select,
  Spin,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { BatchOptionsType } from '#/constants/locales';

import {
  MATERIAL_STATUS_OPTIONS,
  materialDisplayName,
  MEDIA_TAB_OPTIONS,
} from '../constants';
import MaterialCard from './MaterialCard.vue';
import MaterialUploadDrawer from './MaterialUploadDrawer.vue';
import SegTabs from './SegTabs.vue';

const MEDIA_TYPES: MaterialType[] = ['image', 'video', 'audio'];

const [UploadDrawer, uploadDrawerApi] = useVbenDrawer({
  connectedComponent: MaterialUploadDrawer,
});

const loading = ref(false);
const rows = ref<MaterialItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);
const activeType = ref<string>('all');
const statusFilter = ref<number | undefined>();
const keyword = ref('');
const selected = ref<Set<number | string>>(new Set());
const typeCounts = ref<Record<string, number>>({ all: 0 });

const tabOptions = computed(() =>
  MEDIA_TAB_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
    count: typeCounts.value[option.value] ?? 0,
  })),
);

/** 后端不支持名称检索，这里只过滤当前页已加载的素材 */
const visibleRows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) {
    return rows.value;
  }
  return rows.value.filter((item) =>
    materialDisplayName(item).toLowerCase().includes(q),
  );
});

/** 各类型数量（分段计数）：只取 total，pageSize 用 1 */
async function loadCounts() {
  const [all, ...byType] = await Promise.all([
    aiAssetApi.fetchMaterialList({
      page: 1,
      pageSize: 1,
      status: statusFilter.value,
    }),
    ...MEDIA_TYPES.map((type) =>
      aiAssetApi.fetchMaterialList({
        materialType: type,
        page: 1,
        pageSize: 1,
        status: statusFilter.value,
      }),
    ),
  ]);
  typeCounts.value = {
    all: all?.total ?? 0,
    ...Object.fromEntries(
      MEDIA_TYPES.map((type, index) => [type, byType[index]?.total ?? 0]),
    ),
  };
}

async function load() {
  loading.value = true;
  try {
    const res = await aiAssetApi.fetchMaterialList({
      materialType:
        activeType.value === 'all'
          ? undefined
          : (activeType.value as MaterialType),
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value,
    });
    rows.value = res?.items ?? [];
    total.value = res?.total ?? rows.value.length;
  } finally {
    loading.value = false;
  }
  selected.value = new Set();
}

function reload() {
  page.value = 1;
  void Promise.all([load(), loadCounts()]);
}

function handlePageChange(current: number, size: number) {
  page.value = current;
  pageSize.value = size;
  void load();
}

function toggleSelect(item: MaterialItem) {
  if (selected.value.has(item.id)) {
    selected.value.delete(item.id);
  } else {
    selected.value.add(item.id);
  }
  selected.value = new Set(selected.value);
}

function download(item: MaterialItem) {
  if (item.storageUrl) {
    window.open(item.storageUrl, '_blank');
  }
}

async function removeMaterial(item: MaterialItem) {
  await aiAssetApi.fetchMaterialBatchOptions({
    targetIds: [String(item.id)],
    type: BatchOptionsType.Delete,
    values: {},
  } as BatchOptions);
  message.success('已删除');
  reload();
}

async function removeSelected() {
  const ids = [...selected.value].map(String);
  await aiAssetApi.fetchMaterialBatchOptions({
    targetIds: ids,
    type: BatchOptionsType.Delete,
    values: {},
  } as BatchOptions);
  message.success(`已批量删除 ${ids.length} 个素材`);
  reload();
}

watch([activeType, statusFilter], reload);
onMounted(reload);
</script>

<template>
  <div class="page-head">
    <div>
      <h1 class="page-title">素材库</h1>
      <p class="page-sub">上传 / 生成 / 管理 AI 图片、视频、音频素材</p>
    </div>
    <Button type="primary" @click="uploadDrawerApi.open()">
      <template #icon><UploadOutlined /></template>
      新增素材
    </Button>
  </div>

  <div class="filterbar">
    <SegTabs v-model="activeType" :options="tabOptions" size="sm" />
    <Input
      v-model:value="keyword"
      allow-clear
      class="media-search"
      placeholder="搜索素材名称"
    >
      <template #prefix><SearchOutlined /></template>
    </Input>
    <Select
      v-model:value="statusFilter"
      allow-clear
      class="status-select"
      :options="MATERIAL_STATUS_OPTIONS"
      placeholder="全部状态"
    />
  </div>

  <div v-if="selected.size > 0" class="bulk">
    <span>已选 <b>{{ selected.size }}</b> 项</span>
    <div class="bulk-actions">
      <Button @click="selected = new Set()">取消选择</Button>
      <Button danger @click="removeSelected">批量删除</Button>
    </div>
  </div>

  <Spin :spinning="loading">
    <Empty
      v-if="!loading && visibleRows.length === 0"
      class="panel-empty"
      description="暂无素材，点击右上角「新增素材」上传本地文件"
    />
    <Row v-else :gutter="[14, 14]">
      <Col
        v-for="item in visibleRows"
        :key="item.id"
        :lg="6"
        :md="8"
        :sm="12"
        :xs="24"
      >
        <MaterialCard
          :item="item"
          :selected="selected.has(item.id)"
          @download="download(item)"
          @remove="removeMaterial(item)"
          @toggle="toggleSelect(item)"
        />
      </Col>
    </Row>

    <div v-if="total > 0" class="pager">
      <Pagination
        :current="page"
        :page-size="pageSize"
        show-size-changer
        :show-total="(t: number) => `共 ${t} 个素材`"
        :total="total"
        @change="handlePageChange"
      />
    </div>
  </Spin>

  <UploadDrawer @success="reload" />
</template>

<style scoped lang="scss">
.page-head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.page-sub {
  margin-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.filterbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.media-search {
  width: 220px;
}

.status-select {
  width: 160px;
}

.bulk {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  margin-bottom: 14px;
  background: color-mix(in srgb, hsl(var(--primary)) 8%, hsl(var(--card)));
  border: 1px solid color-mix(in srgb, hsl(var(--primary)) 28%, transparent);
  border-radius: 12px;

  b {
    color: hsl(var(--primary));
  }
}

.bulk-actions {
  display: flex;
  gap: 10px;
}

.panel-empty {
  padding: 56px 0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
