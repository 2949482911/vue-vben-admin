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

import { useVbenDrawer, VbenLoading } from '@vben/common-ui';

import { SearchOutlined, UploadOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  message,
  Pagination,
  Row,
  Segmented,
  Select
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { BatchOptionsType } from '#/constants/locales';

import {
  MATERIAL_STATUS_OPTIONS,
  materialDisplayName,
  MEDIA_TAB_OPTIONS,
} from '../../constants';
import MaterialCard from './MaterialCard.vue';
import MaterialUploadDrawer from './MaterialUploadDrawer.vue';
import MaterialPushDrawer from './PushToAlbumDrawer.vue';

const MEDIA_TYPES: MaterialType[] = ['image', 'video', 'audio'];

const [UploadDrawer, uploadDrawerApi] = useVbenDrawer({
  connectedComponent: MaterialUploadDrawer,
});
const [PushDrawer, pushDrawerApi] = useVbenDrawer({
  connectedComponent: MaterialPushDrawer,
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
  })),
);

function labelOf(value: any): string {
  return tabOptions.value.find((option) => option.value === value)?.label ?? '';
}

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

/** 全选当前页（与营销素材库一致，避免误全量勾选） */
function selectAllCurrentPage() {
  selected.value = new Set([
    ...selected.value,
    ...visibleRows.value.map((item) => item.id),
  ]);
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

function openCreate() {
  uploadDrawerApi.open();
}

/** 入库：把当前选中的素材交给入库抽屉（选择目标文件夹 → material/push） */
function openPush() {
  const items = rows.value.filter((item) => selected.value.has(item.id));
  if (items.length === 0) {
    return;
  }
  pushDrawerApi.setData({ items });
  pushDrawerApi.open();
}

watch([activeType, statusFilter], reload);
onMounted(reload);
</script>

<template>
  <Card class="library-card">
    <div class="library-body">
      <!-- 顶部工具栏：操作 + 类型分段 + 搜索/状态（对齐营销素材库，不做左目录树） -->
      <div class="library-toolbar">
      <Button type="primary" @click="openCreate">
        <template #icon><UploadOutlined /></template>
        新增素材
      </Button>
      <Button :disabled="visibleRows.length === 0" @click="selectAllCurrentPage">
        全选当前页
      </Button>
      <Button
        :disabled="selected.size === 0"
        @click="selected = new Set()"
      >
        清空选择
      </Button>
      <Button danger :disabled="selected.size === 0" @click="removeSelected">
        批量删除{{ selected.size > 0 ? `（${selected.size}）` : '' }}
      </Button>
      <Button :disabled="selected.size === 0" type="primary" ghost @click="openPush">
        入库到素材库
      </Button>

      <Segmented
        v-model:value="activeType"
        class="library-segmented"
        :options="tabOptions"
      >
        <template #label="{ value }">
          <span class="seg-label">
            {{ labelOf(value) }}
            <span class="seg-count">{{ typeCounts[value] ?? 0 }}</span>
          </span>
        </template>
      </Segmented>

      <div class="library-toolbar__right">
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
    </div>

    <!-- 素材网格：占满剩余高度，自身滚动 -->
    <div class="library-scroll">
      <Empty
        v-if="!loading && visibleRows.length === 0"
        class="panel-empty"
        description="暂无素材，点击左上角「新增素材」上传本地文件"
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
    </div>

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
      <VbenLoading :spinning="loading" />
    </div>
  </Card>

  <UploadDrawer @success="reload" />
  <PushDrawer @success="reload" />
</template>

<style scoped lang="scss">
@use './segmented.scss';

/* 整张卡占满页面剩余高度：工具栏/翻页固定，网格区自己滚 */
.library-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px 16px;
  }
}

.library-body {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.library-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 顶部工具栏（对齐营销素材库：操作按钮 + 类型分段 + 搜索，不做左侧目录树） */
.library-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
}

.library-toolbar__right {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.media-search {
  width: 220px;
}

.status-select {
  width: 160px;
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
