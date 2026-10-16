<script lang="ts" setup name="MaterialPushDrawer">
/**
 * 素材入库抽屉（推送到「营销 → 素材库」）
 *
 * 选中素材列表 + 选择目标文件夹（营销库目录树，不带 X-Workspace-Id）
 * + 内联新建子文件夹 → POST /ai_asset/material/push → 展示逐条结果。
 *
 * 注意：只有「已确认」(status=2) 的素材能入库；草稿要先去草稿区确认。
 */
import type { MaterialItem } from '#/api/models/ai_asset';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Card,
  DirectoryTree,
  Empty,
  Image,
  Input,
  message,
  Spin,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { materialLibraryApi } from '#/api/core/marketing';

import { MATERIAL_STATUS_MAP, materialDisplayName } from '../../constants';

const emit = defineEmits(['success']);

type PushResultRow = {
  label: string;
  message?: string;
  success: boolean;
};

const items = ref<MaterialItem[]>([]);
const results = ref<PushResultRow[]>([]);

const treeLoading = ref(false);
/** 目录树原始节点（字段：id / name / children），用 field-names 交给 Tree 渲染 */
const treeData = ref<any[]>([]);
/** antd Tree 的选中是数组，这里只允许单选（取第一个） */
const selectedKeys = ref<string[]>([]);
const selectedAlbumId = computed(() => selectedKeys.value[0]);

const newFolderName = ref('');
const creating = ref(false);

const submitting = ref(false);

/** 可入库的（已确认）/ 需要先确认的（草稿等） */
const pushable = computed(() => items.value.filter((item) => item.status === 2));
const blocked = computed(() => items.value.filter((item) => item.status !== 2));
/** 结果统计 */
const okCount = computed(
  () => results.value.filter((row) => row.success).length,
);

async function loadTree() {
  treeLoading.value = true;
  try {
    // 后端返回的是节点数组（营销素材库同样这么消费）
    const raw: any = await materialLibraryApi.fetchDirectoryTreeList();
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    treeData.value = list;
    if (list.length > 0 && selectedKeys.value.length === 0) {
      selectedKeys.value = [String(list[0].id)];
    }
  } finally {
    treeLoading.value = false;
  }
}

/** 内联新建：在当前选中的文件夹下建一个子文件夹 */
async function createFolder() {
  const name = newFolderName.value.trim();
  if (!name) {
    message.warning('请填写文件夹名称');
    return;
  }
  creating.value = true;
  try {
    await materialLibraryApi.fetchCreateFile({
      name,
      parentId: selectedAlbumId.value,
    });
    message.success('文件夹已创建');
    newFolderName.value = '';
    await loadTree();
  } finally {
    creating.value = false;
  }
}

async function submit() {
  if (pushable.value.length === 0) {
    message.warning('没有可入库的素材（仅「已确认」可入库）');
    return;
  }
  const newName = newFolderName.value.trim();
  if (!selectedAlbumId.value && !newName) {
    message.warning('请选择目标文件夹，或在下方新建一个');
    return;
  }
  submitting.value = true;
  try {
    const res = await aiAssetApi.pushMaterials({
      albumId: newName ? undefined : selectedAlbumId.value,
      materialIds: pushable.value.map((item) => item.id),
      newAlbumName: newName || undefined,
      newAlbumParentId: selectedAlbumId.value,
    });
    const rows = res ?? [];
    results.value = rows.map((row) => {
      const source = pushable.value.find(
        (item) => String(item.id) === String(row.materialId),
      );
      return {
        label: source ? materialDisplayName(source) : `素材 #${row.materialId}`,
        message: row.message,
        success: row.success,
      };
    });
    const ok = results.value.filter((item) => item.success).length;
    if (ok > 0) {
      message.success(`入库完成：成功 ${ok} / ${results.value.length}`);
      emit('success');
    } else {
      message.error('入库失败，请看下方逐条结果');
    }
  } finally {
    submitting.value = false;
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[620px]',
  closeOnPressEscape: true,
  async onConfirm() {
    await submit();
  },
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      items.value = [];
      results.value = [];
      newFolderName.value = '';
      selectedKeys.value = [];
      return;
    }
    const data = drawerApi.getData() as undefined | { items?: MaterialItem[] };
    items.value = data?.items ?? [];
    void loadTree();
  },
});
</script>

<template>
  <Drawer title="入库到素材库">
    <div class="push-drawer">
      <Alert
        v-if="blocked.length > 0"
        show-icon
        :message="`有 ${blocked.length} 个素材不是「已确认」状态，将跳过（草稿请先去草稿区确认入库）`"
        type="warning"
      />

      <!-- 本次入库 -->
      <Card class="push-card" size="small">
        <template #title>
          <span class="push-card__title">本次入库</span>
        </template>
        <template #extra>
          <span class="push-card__count">{{ pushable.length }} 个素材</span>
        </template>

        <div v-if="pushable.length > 0" class="push-scroll">
          <div v-for="item in pushable" :key="item.id" class="push-item">
            <Image
              class="push-item__img"
              :height="44"
              :preview="false"
              :src="item.thumbnailUrl || item.storageUrl"
              :width="44"
            />
            <div class="push-item__main">
              <div
                class="push-item__name"
                :title="materialDisplayName(item)"
              >
                {{ materialDisplayName(item) }}
              </div>
              <div class="push-item__meta">
                <Tag
                  :bordered="false"
                  :color="MATERIAL_STATUS_MAP[item.status ?? 1]?.color"
                >
                  {{ MATERIAL_STATUS_MAP[item.status ?? 1]?.label }}
                </Tag>
                <span v-if="item.width && item.height">
                  {{ item.width }}×{{ item.height }}
                </span>
                <span v-if="item.fileSizeStr">{{ item.fileSizeStr }}</span>
              </div>
            </div>
          </div>
        </div>
        <Empty
          v-else
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="没有可入库的素材"
        />
      </Card>

      <!-- 目标文件夹 -->
      <Card class="push-card" size="small" title="目标文件夹">
        <template #extra>
          <span class="push-card__count">营销素材库</span>
        </template>

        <Spin :spinning="treeLoading">
          <div v-if="treeData.length > 0" class="push-tree">
            <DirectoryTree
              v-model:selected-keys="selectedKeys"
              block-node
              default-expand-all
              :field-names="{ children: 'children', key: 'id', title: 'name' }"
              show-icon
              :tree-data="treeData"
            />
          </div>
          <Empty
            v-else
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            description="暂无文件夹，可在下方新建"
          />
        </Spin>

        <div class="push-new">
          <Input
            v-model:value="newFolderName"
            allow-clear
            placeholder="新建子文件夹名称（建在选中文件夹下）"
          />
          <Button :loading="creating" @click="createFolder">新建</Button>
        </div>
        <p class="push-hint">
          选中文件夹后直接点「确认」入库；也可以先填名称，提交时会先建文件夹再入库。
        </p>
      </Card>

      <!-- 入库结果 -->
      <Card v-if="results.length > 0" class="push-card" size="small" title="入库结果">
        <template #extra>
          <span class="push-card__count">
            成功 {{ okCount }} / {{ results.length }}
          </span>
        </template>

        <div class="push-results">
          <div v-for="row in results" :key="row.label" class="push-result">
            <CheckCircleFilled v-if="row.success" class="is-ok" />
            <CloseCircleFilled v-else class="is-err" />
            <span class="push-result__name" :title="row.label">
              {{ row.label }}
            </span>
            <span v-if="row.message" class="push-result__msg">
              {{ row.message }}
            </span>
          </div>
        </div>
      </Card>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.push-drawer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 三段都用 Card 呈现，跟项目里其它页面同一卡片风格 */
.push-card {
  :deep(.ant-card-body) {
    padding: 12px;
  }
}

.push-card__title {
  font-size: 13px;
  font-weight: 600;
}

.push-card__count {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 本次入库：素材行（浅底无硬边框，更柔） */
.push-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 184px;
  overflow-y: auto;
}

.push-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px;
  background: hsl(var(--accent));
  border-radius: 10px;
}

.push-item__main {
  min-width: 0;
}

.push-item__img {
  flex: none;
  overflow: hidden;
  border-radius: 8px;
}

.push-item__name {
  overflow: hidden;
  font-size: 13px;
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.push-item__meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 2px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 目录树：给个带边框的内滚区域，别让树裸着 */
.push-tree {
  max-height: 220px;
  padding: 6px;
  overflow-y: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.push-new {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.push-hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

/* 结果：图标 + 名称 + 原因 */
.push-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.push-result {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 12px;

  .is-ok {
    color: hsl(var(--success));
  }

  .is-err {
    color: hsl(var(--destructive));
  }
}

.push-result__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.push-result__msg {
  color: hsl(var(--muted-foreground));
}
</style>
