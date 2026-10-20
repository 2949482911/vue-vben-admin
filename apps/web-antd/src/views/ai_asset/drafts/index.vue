<script lang="ts" setup name="AiAssetDrafts">
/**
 * AI 资产 — 草稿区（媒体画廊）
 *
 * 生成与调整中的素材（status=1），确认定稿后才进入素材库。
 * 接口：material/list（分页）、material/confirm、material/version。
 *
 * 字段对齐：name / width / height / fileSizeStr / videoDuration；
 * prompt / skill / model / versionNo / generationStatus / updateTime 由 material/list 聚合返回。
 */
import type { MaterialItem, MaterialType } from '#/api/models/ai_asset';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer, VbenLoading } from '@vben/common-ui';

import {
  DownloadOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  SoundOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Image,
  Input,
  message,
  Modal,
  Pagination,
  Row,
  Segmented,
  Select,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { useWorkspaceStore } from '#/store';

import { MEDIA_TAB_OPTIONS } from '../constants';
import { workspacePagePath } from '../workspace/menu';
import VersionDrawer from './VersionDrawer.vue';

// ==================== 版本抽屉 ====================
const [Version, versionApi] = useVbenDrawer({
  connectedComponent: VersionDrawer,
});

const router = useRouter();
const workspaceStore = useWorkspaceStore();

function openVersion(row: MaterialItem) {
  versionApi.setData({ materialId: row.id });
  versionApi.open();
}

/** 继续迭代：跳创作台并带上 materialId（创作台自动回填参数进入迭代态） */
function handleReedit(row: MaterialItem) {
  const wsId = workspaceStore.workspaceId;
  if (wsId === undefined) {
    message.warning('请先进入工作区');
    return;
  }
  void router.push({
    path: workspacePagePath(wsId, 'studio'),
    query: { materialId: String(row.id) },
  });
}

// ==================== 列表 ====================

const loading = ref(false);
const rows = ref<MaterialItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);
const activeType = ref<string>('all');
const keyword = ref('');
const generationStatus = ref<
  'draft' | 'failed' | 'ready' | 'running' | undefined
>();
const batch = ref(false);
const selected = ref<Set<number | string>>(new Set());
const counts = ref<Record<string, number | undefined>>({});

const MEDIA_TYPES: MaterialType[] = ['image', 'video', 'audio'];

async function load() {
  loading.value = true;
  try {
    const res = await aiAssetApi.fetchMaterialList({
      page: page.value,
      pageSize: pageSize.value,
      status: 1,
      materialType:
        activeType.value === 'all'
          ? undefined
          : (activeType.value as MaterialType),
      // 名称模糊搜索 + 生成态筛选（后端已支持）
      name: keyword.value.trim() || undefined,
      generationStatus: generationStatus.value,
    });
    rows.value = res?.items ?? [];
    total.value = res?.total ?? rows.value.length;
  } finally {
    loading.value = false;
  }
  selected.value = new Set();
}

/** 分段计数：各拉 1 条取 total，避免全量 */
async function loadCounts() {
  try {
    const [all, ...byType] = await Promise.all([
      aiAssetApi.fetchMaterialList({ page: 1, pageSize: 1, status: 1 }),
      ...MEDIA_TYPES.map((type) =>
        aiAssetApi.fetchMaterialList({
          materialType: type,
          page: 1,
          pageSize: 1,
          status: 1,
        }),
      ),
    ]);
    counts.value = {
      all: all?.total,
      ...Object.fromEntries(
        MEDIA_TYPES.map((type, index) => [type, byType[index]?.total]),
      ),
    };
  } catch {
    counts.value = {};
  }
}

function reload() {
  page.value = 1;
  void Promise.all([load(), loadCounts()]);
}

function resetFilters() {
  activeType.value = 'all';
  generationStatus.value = undefined;
  keyword.value = '';
  reload();
}

function toggleBatch() {
  batch.value = !batch.value;
  selected.value = new Set();
}

function tabLabel(value: any): string {
  return MEDIA_TAB_OPTIONS.find((option) => option.value === value)?.label ?? '';
}

function handlePageChange(current: number, size: number) {
  page.value = current;
  pageSize.value = size;
  void load();
}

// ==================== 展示辅助 ====================

const isImage = (item: MaterialItem) => item.materialType === 'image';

/** 生成态：优先用后端 generationStatus，其次按 status 兜底 */
function genStatus(item: MaterialItem): 'draft' | 'failed' | 'ready' | 'running' {
  return item.generationStatus ?? (item.status === 1 ? 'draft' : 'ready');
}

const STATUS_TEXT = { draft: '草稿', failed: '生成失败', ready: '已就绪', running: '生成中' };
const STATUS_COLOR = { draft: 'gold', failed: 'red', ready: 'green', running: 'cyan' };

function sizeChips(item: MaterialItem): string[] {
  const out: string[] = [];
  if (item.width && item.height) out.push(`${item.width}×${item.height}`);
  if (item.fileSizeStr) out.push(item.fileSizeStr);
  if (item.videoDuration) out.push(item.videoDuration);
  return out;
}

function versionChain(item: MaterialItem): string {
  // 后端约定：无版本时 versionNo = 0
  const v = Math.max(1, item.versionNo ?? 0);
  const parts: string[] = [];
  for (let i = 1; i <= v; i++) parts.push(`v${i}`);
  return parts.join(' → ');
}

/** 版本标签：无版本时按 v1 展示 */
function displayVersion(item: MaterialItem): number {
  return Math.max(1, item.versionNo ?? 0);
}

function toggleSelect(item: MaterialItem) {
  selected.value.has(item.id)
    ? selected.value.delete(item.id)
    : selected.value.add(item.id);
  selected.value = new Set(selected.value);
}

function openUrl(url?: string) {
  if (url) window.open(url, '_blank');
}

// ==================== 操作 ====================

async function handleConfirm(row: MaterialItem) {
  Modal.confirm({
    title: '确认定稿',
    content:
      '确认后素材进入「已确认」（设计定稿）；之后可在素材库勾选后「入库到素材库」推到营销素材库。',
    okText: '确认定稿',
    async onOk() {
      await aiAssetApi.confirmMaterial(row.id);
      message.success('已确认定稿');
      reload();
    },
  });
}

async function confirmSelected() {
  const ids = [...selected.value];
  if (ids.length === 0) return;
  Modal.confirm({
    title: `批量确认定稿 ${ids.length} 个素材？`,
    content: '确认后素材进入「已确认」，之后可在素材库入库到营销素材库。',
    okText: '确认定稿',
    async onOk() {
      for (const id of ids) {
        await aiAssetApi.confirmMaterial(id);
      }
      message.success(`已确认定稿 ${ids.length} 个素材`);
      reload();
    },
  });
}

onMounted(() => {
  void load();
  void loadCounts();
});
</script>

<template>
  <Page auto-content-height>
    <div class="drafts-shell">
      <Card class="drafts-card">
        <div class="drafts-body">
          <div class="drafts-toolbar">
            <Segmented
              v-model:value="activeType"
              class="library-segmented"
              :options="MEDIA_TAB_OPTIONS"
              @change="reload"
            >
              <template #label="{ value }">
                <span class="seg-label">
                  {{ tabLabel(value) }}
                  <span class="seg-count">{{ counts[value] ?? 0 }}</span>
                </span>
              </template>
            </Segmented>

            <Select
              v-model:value="generationStatus"
              allow-clear
              class="status-select"
              placeholder="全部状态"
              :options="[
                { label: '草稿', value: 'draft' },
                { label: '生成中', value: 'running' },
                { label: '生成失败', value: 'failed' },
                { label: '已就绪', value: 'ready' },
              ]"
              @change="reload"
            />

            <Input
              v-model:value="keyword"
              allow-clear
              class="media-search"
              placeholder="搜索素材名称"
              @press-enter="reload"
            >
              <template #prefix><SearchOutlined /></template>
            </Input>

            <div class="drafts-toolbar__right">
              <Button @click="toggleBatch">
                {{ batch ? '退出批量' : '批量管理' }}
              </Button>
              <Button
                v-if="batch"
                type="primary"
                :disabled="selected.size === 0"
                @click="confirmSelected"
              >
                确认定稿{{ selected.size > 0 ? `（${selected.size}）` : '' }}
              </Button>
              <Button @click="resetFilters">重置</Button>
              <Button @click="reload">
                <template #icon><ReloadOutlined /></template>
                刷新
              </Button>
            </div>
          </div>

          <div class="drafts-scroll">
            <Empty
              v-if="!loading && rows.length === 0"
              class="panel-empty"
              description="暂无草稿，去「创作工作台」生成第一张素材"
            />
            <Row v-else :gutter="[14, 14]">
              <Col
                v-for="item in rows"
                :key="item.id"
                :lg="6"
                :md="8"
                :sm="12"
                :xs="24"
              >
                <Card
                  class="draft-card"
                  hoverable
                  :class="{ 'is-on': selected.has(item.id), 'show-pick': batch }"
                >
                  <template #cover>
                    <div class="thumb">
                      <Image
                        v-if="isImage(item) && (item.thumbnailUrl || item.storageUrl)"
                        class="thumb-img"
                        :preview="{ src: item.storageUrl || item.thumbnailUrl }"
                        :src="item.thumbnailUrl || item.storageUrl"
                      />
                      <video
                        v-else-if="item.materialType === 'video' && item.storageUrl"
                        class="thumb-img"
                        controls
                        muted
                        playsinline
                        preload="metadata"
                        :src="item.storageUrl"
                        @click.stop
                      ></video>
                      <div v-else class="thumb-ph">
                        <component
                          :is="
                            item.materialType === 'video'
                              ? PlayCircleOutlined
                              : item.materialType === 'audio'
                                ? SoundOutlined
                                : FileImageOutlined
                          "
                        />
                      </div>

                      <Tag class="vtag" :bordered="false">
                        v{{ displayVersion(item) }}
                      </Tag>
                      <Tag
                        class="st"
                        :bordered="false"
                        :color="STATUS_COLOR[genStatus(item)]"
                      >
                        {{ STATUS_TEXT[genStatus(item)] }}
                      </Tag>

                      <Checkbox
                        class="pick"
                        :checked="selected.has(item.id)"
                        @click.stop="toggleSelect(item)"
                      />

                      <div class="overlay" @click.stop>
                        <Tooltip title="下载">
                          <Button
                            class="ov-btn"
                            size="small"
                            type="text"
                            @click="openUrl(item.storageUrl)"
                          >
                            <template #icon><DownloadOutlined /></template>
                          </Button>
                        </Tooltip>
                        <Button
                          class="ov-btn"
                          size="small"
                          type="text"
                          @click="openVersion(item)"
                        >
                          版本
                        </Button>
                      </div>
                    </div>
                  </template>

                  <div class="draft-body">
                    <div class="draft-name" :title="item.name">
                      {{ item.name || `素材 #${item.id}` }}
                    </div>
                    <div v-if="item.prompt" class="draft-prompt">
                      {{ item.prompt }}
                    </div>
                    <div class="chips">
                      <Tag v-if="item.skill" :bordered="false" color="purple">
                        {{ item.skill }}
                      </Tag>
                      <Tag v-if="item.model" :bordered="false" color="cyan">
                        {{ item.model }}
                      </Tag>
                      <Tag
                        v-for="c in sizeChips(item)"
                        :key="c"
                        :bordered="false"
                      >
                        {{ c }}
                      </Tag>
                    </div>
                    <div class="draft-foot">
                      <span class="chain">{{ versionChain(item) }}</span>
                      <span class="time">
                        {{ item.updateTime || item.createTime }}
                      </span>
                    </div>
                    <div class="draft-acts">
                      <Button @click="handleReedit(item)">继续迭代</Button>
                      <Button
                        type="primary"
                        :disabled="
                          genStatus(item) === 'running' ||
                          genStatus(item) === 'failed'
                        "
                        @click="handleConfirm(item)"
                      >
                        确认定稿
                      </Button>
                    </div>
                  </div>
                </Card>
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

      <Version />
    </div>
  </Page>
</template>

<style scoped lang="scss">
@use '../asset/components/segmented.scss';

/* Page 为底铺满，整张卡占满剩余高度：工具栏/翻页固定，网格区自己滚 */
.drafts-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.drafts-card {
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

.drafts-body {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.drafts-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
}

.drafts-toolbar__right {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.status-select {
  width: 160px;
}

.media-search {
  width: 220px;
}

.drafts-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.panel-empty {
  padding: 56px 0;
}

.draft-card {
  --tint: hsl(var(--primary));
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--tint) 30%, transparent);
    box-shadow: 0 12px 28px hsl(var(--foreground) / 10%);
  }

  &.is-on {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 3px color-mix(in srgb, hsl(var(--primary)) 16%, transparent);
  }

  :deep(.ant-card-body) {
    padding: 12px 14px;
  }
}

.thumb {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    hsl(var(--accent)),
    color-mix(in srgb, hsl(var(--primary)) 8%, hsl(var(--accent)))
  );

  :deep(.ant-image) {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* 缩略图铺满封面（antd Image 的内层 img 默认按原始比例，会留白） */
  :deep(.ant-image-img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 34px;
  color: hsl(var(--muted-foreground));
}

.vtag {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  margin: 0;
  color: #fff;
  background: hsl(0 0% 0% / 42%);
}

.st {
  position: absolute;
  top: 10px;
  right: 44px;
  z-index: 2;
  margin: 0;
}

.pick {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.draft-card:hover .pick,
.draft-card.is-on .pick,
.draft-card.show-pick .pick {
  opacity: 1;
}

.overlay {
  position: absolute;
  inset: auto 0 0;
  z-index: 2;
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  padding: 8px;
  opacity: 0;
  background: linear-gradient(0deg, hsl(0 0% 0% / 55%), transparent);
  transition: opacity 0.18s ease;
}

.draft-card:hover .overlay {
  opacity: 1;
}

.ov-btn {
  color: #fff;
  background: rgb(255 255 255 / 18%);
}

.ov-btn:hover {
  background: rgb(255 255 255 / 30%);
}

.draft-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.draft-name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.draft-prompt {
  display: -webkit-box;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  :deep(.ant-tag) {
    margin: 0;
    font-size: 11px;
  }
}

.draft-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chain {
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
}

.draft-acts {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  margin-top: 4px;
  border-top: 1px solid hsl(var(--border));

  :deep(.ant-btn) {
    flex: 1;
  }
}

.time {
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
