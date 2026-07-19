<script setup lang="ts">
import { $t } from '@vben/locales';
import {
  Row,
  Col,
  DirectoryTree,
  Button,
  Card,
  Dropdown,
  Menu,
  MenuItem,
  message,
} from 'ant-design-vue';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import NewFolder from './newFolder.vue';
import UploadMaterials from './uploadMaterials.vue';
import AlbumFiles from './albumFiles.vue';
import PushMaterialDrawer from './PushMaterialDrawer.vue';
import PushTaskListDrawer from './PushTaskListDrawer.vue';
import { materialLibraryApi } from '#/api/core';
import type { TreeProps } from 'ant-design-vue';
import type { Key } from 'ant-design-vue/es/vc-tree-select/interface';
import type { FolderItem } from '#/api/models';
import type { MaterialItem } from '#/api/models/assert';
import type { MaterialLibraryFolderType } from './materialType';

// 树的数据
const treeData = ref<TreeProps['treeData']>([]);
const expandedKeys = ref<Key[]>([]);
const selectedKeys = ref<string[]>([]);

// ==================== 素材选中状态 ====================
const selectedMaterials = ref<MaterialItem[]>([]);
const selectedMaterialIds = computed(() =>
  selectedMaterials.value.map((m) => m.id),
);

/** AlbumFiles 组件引用，用于获取当前页文件列表 */
const albumFilesRef = ref<ComponentPublicInstance<{ currentPageFiles: MaterialItem[] }>>();

/** 全选当前页 */
function handleSelectAllCurrentPage() {
  const files = albumFilesRef.value?.currentPageFiles ?? [];
  if (files.length === 0) return;
  const fileIds = new Set(files.map((f) => f.id));
  const allSelected = files.every((f) => selectedMaterialIds.value.includes(f.id));
  if (allSelected) {
    // 取消当前页全选
    selectedMaterials.value = selectedMaterials.value.filter(
      (m) => !fileIds.has(m.id),
    );
  } else {
    // 当前页全选
    const existingIds = new Set(selectedMaterialIds.value);
    for (const m of files) {
      if (!existingIds.has(m.id)) {
        selectedMaterials.value.push(m);
      }
    }
  }
}

/** 清空所有选中 */
function handleClearSelection() {
  selectedMaterials.value = [];
}

onMounted(async () => {
  await requestTreeNode();
});

async function requestTreeNode() {
  const res = await materialLibraryApi.fetchDirectoryTreeList();
  treeData.value = res;
  if (res && res.length > 0) {
    const firstNode = res[0];
    treeItem.value = [firstNode];
    selectedKeys.value = [firstNode.id];
    expandedKeys.value = [firstNode.id];
  }
}

// ==================== 新建文件夹 ====================
const [NewFolderModal, newFolderApi] = useVbenModal({
  connectedComponent: NewFolder,
});

const idEditStr = ref<MaterialLibraryFolderType | null>(null);
async function newBuilt(row?: MaterialLibraryFolderType) {
  if (row) {
    idEditStr.value = { ...row };
  } else {
    idEditStr.value = null;
  }
  await nextTick();
  newFolderApi.open();
}

// ==================== 上传素材 ====================
const [UploadMaterialsModal, drawerApi] = useVbenDrawer({
  connectedComponent: UploadMaterials,
});

function upMaterial() {
  drawerApi.open();
}

// ==================== 推送素材 ====================
const [PushMaterialDrawerModal, pushMaterialDrawerApi] = useVbenDrawer({
  connectedComponent: PushMaterialDrawer,
});

function openPushMaterialDrawer() {
  if (selectedMaterials.value.length === 0) {
    message.warning($t('page.marketing.asset.pushDrawer.selectMaterialFirst'));
    return;
  }
  pushMaterialDrawerApi.open();
}

// ==================== 推送任务记录 ====================
const [PushTaskListDrawerModal, pushTaskListDrawerApi] = useVbenDrawer({
  connectedComponent: PushTaskListDrawer,
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      handleClearSelection();
    }
  }
});

function openPushTaskListDrawer() {
  pushTaskListDrawerApi.open();
}

// ==================== 素材选择处理 ====================
function handleToggleMaterialSelect(material: MaterialItem) {
  const idx = selectedMaterials.value.findIndex((m) => m.id === material.id);
  if (idx >= 0) {
    selectedMaterials.value.splice(idx, 1);
  } else {
    selectedMaterials.value.push(material);
  }
}

// ==================== 树操作 ====================
function findPathNodes(
  tree: any[],
  targetId: string | number,
  path: any[] = [],
): any[] | null {
  for (const node of tree) {
    const currentPath = [...path, node];
    if (node.id === targetId) {
      return currentPath;
    }
    if (node.children && node.children.length > 0) {
      const result = findPathNodes(node.children, targetId, currentPath);
      if (result) return result;
    }
  }
  return null;
}

const treeItem = ref<FolderItem[]>();

// 切换文件夹时清空选中
watch(
  () => treeItem.value,
  () => {
    selectedMaterials.value = [];
  },
);

function itemFile(_selectedKeys: Key[], info: any) {
  if (info.selected) {
    const nodeId = info.node.key;
    const fullPath = findPathNodes(treeData.value || [], nodeId);
    if (fullPath) {
      treeItem.value = fullPath;
    }
  }
}

function handleBreadcrumbJump(item: FolderItem) {
  selectedKeys.value = [item.id as string];
  const fullPath = findPathNodes(treeData.value || [], item.id);
  if (fullPath) {
    treeItem.value = fullPath;
  }
}

async function deleteFolder(folder: MaterialLibraryFolderType) {
  try {
    const params = {
      targetIds: [folder.id],
      type: 'delete',
      values: {},
    };
    await materialLibraryApi.fetchDelFolder(params);
    message.success('删除成功');
    await requestTreeNode();
  } catch (error) {
    message.error('删除失败');
    console.error('删除文件夹失败:', error);
  }
}
</script>

<template>
  <Page auto-content-height>
    <Row class="materialRow" :gutter="{ xs: 8, sm: 16, md: 16 }">
      <Col class="leftCol" :span="6">
        <Card style="width: 100%">
          <div class="materialLeft">
            <div style="margin-bottom: 8px; font-size: 17px; text-align: center">全部专辑</div>
            <div class="tree">
              <DirectoryTree
                v-model:selectedKeys="selectedKeys"
                v-model:expandedKeys="expandedKeys"
                :tree-data="treeData"
                :field-names="{
                  title: 'name',
                  key: 'id',
                  children: 'children',
                }"
                @select="itemFile"
              >
                <template #title="{ data }">
                  <div class="tree-node-title">
                    <span class="tree-node-name">{{ data.name }}</span>
                    <Dropdown
                      trigger="click"
                      placement="bottomRight"
                      :overlay-style="{ minWidth: '80px' }"
                    >
                      <a href="javascript:;" class="tree-node-menu" @click.stop> ••• </a>
                      <template #overlay>
                        <Menu>
                          <MenuItem key="edit" @click="newBuilt(data)"> 编辑 </MenuItem>
                          <MenuItem key="delete" @click="deleteFolder(data)"> 删除 </MenuItem>
                        </Menu>
                      </template>
                    </Dropdown>
                  </div>
                </template>
              </DirectoryTree>
            </div>
          </div>
        </Card>
      </Col>
      <Col class="rightCol" :span="18">
        <Card style="width: 100%">
          <div class="materialRight" style="height: 100%">
            <div class="toolbar">
              <div class="toolbar-left">
                <Button type="primary" @click="upMaterial">上传素材</Button>
                <Button style="margin: 0 5px" @click="newBuilt()">新建文件夹</Button>
                <Button
                  type="primary"
                  :disabled="selectedMaterials.length === 0"
                  @click="openPushMaterialDrawer"
                >
                  {{ $t('page.marketing.asset.pushMaterial') }}
                  <span v-if="selectedMaterials.length > 0" class="selected-count">
                    ({{ selectedMaterials.length }})
                  </span>
                </Button>
                <Button style="margin: 0 5px" @click="openPushTaskListDrawer">
                  {{ $t('page.marketing.asset.pushTaskRecord') }}
                </Button>
                <Button
                  style="margin: 0 5px"
                  @click="handleSelectAllCurrentPage"
                >
                  {{ $t('page.marketing.asset.pushDrawer.selectAllCurrentPage') }}
                </Button>
                <Button
                  danger
                  :disabled="selectedMaterials.length === 0"
                  @click="handleClearSelection"
                >
                  {{ $t('page.marketing.asset.pushDrawer.clearSelection') }}
                </Button>
              </div>
            </div>
            <AlbumFiles
              ref="albumFilesRef"
              @open-file="newBuilt"
              @breadcrumb-click="handleBreadcrumbJump"
              @toggle-material-select="handleToggleMaterialSelect"
              :treeItem="treeItem ?? []"
              :selectedMaterialIds="selectedMaterialIds"
            />
          </div>
        </Card>
      </Col>
    </Row>
    <NewFolderModal @treeNode="requestTreeNode" :treeData="treeData" :idEdit="idEditStr" />
    <UploadMaterialsModal @treeNode="requestTreeNode" :treeData="treeData" />
    <PushMaterialDrawerModal
      @closed="selectedMaterials = []"
      :materials="selectedMaterials"
    />
    <PushTaskListDrawerModal />
  </Page>
</template>

<style scoped lang="scss">
.materialRow {
  height: 100%;
  overflow: hidden;
}

.leftCol,
.rightCol {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.ant-card) {
  display: flex;
  flex-direction: column;
  height: 100%;

  .ant-card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden; /* 内部溢出由子 div 处理 */
  }
}

.materialLeft,
.materialRight {
  flex: 1;
  padding: 10px;
  border-radius: calc(var(--radius) - 2px);
}

.materialLeft {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-bottom: 13px;
}

.tree {
  flex: 1;
  overflow: hidden auto; /* 超出时显示竖向滚动条 */
}

:deep(.ant-tree) {
  border-radius: 0;
}

.tree-node-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
  line-height: 24px;
}

.tree-node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node-menu {
  padding: 0 4px;
  font-size: 14px;
  line-height: 24px;
  color: #999;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node-title:hover .tree-node-menu {
  opacity: 1;
}

:deep(.ant-tree-node-content-wrapper) {
  display: flex;
  align-items: center;
}

:deep(.ant-tree-title) {
  display: flex;
  flex: 1;
  align-items: center;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .toolbar-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }
}

.selected-count {
  margin-left: 2px;
  font-weight: 600;
}
</style>
