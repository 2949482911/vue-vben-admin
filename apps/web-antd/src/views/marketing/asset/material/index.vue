<script setup lang="ts">
import type { TreeProps } from "ant-design-vue";
import type { Key } from "ant-design-vue/es/vc-tree-select/interface";

import type { ComponentPublicInstance } from "vue";

import type { MaterialLibraryFolderType } from "./materialType";

import type { VbenFormProps } from "#/adapter/form";
import type { FolderItem } from "#/api/models";
import type { MaterialItem } from "#/api/models/assert";
import type { MaterialListParams } from "#/api/models/marketing";

import { computed, nextTick, onMounted, ref, watch } from "vue";

import { Page, useVbenDrawer, useVbenModal } from "@vben/common-ui";
import { $t } from "@vben/locales";

import {
  CheckSquareOutlined,
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  FolderAddOutlined,
  FolderFilled,
  HistoryOutlined,
  SearchOutlined,
  SendOutlined,
  UploadOutlined
} from "@ant-design/icons-vue";
import {
  Badge,
  Button,
  Card,
  DirectoryTree,
  Divider,
  Dropdown,
  Input,
  Menu,
  MenuItem,
  message,
  Space
} from "ant-design-vue";

import { useVbenForm } from "#/adapter/form";
import { materialLibraryApi } from "#/api/core";

import AlbumFiles from "./albumFiles.vue";
import NewFolder from "./newFolder.vue";
import PushMaterialDrawer from "./PushMaterialDrawer.vue";
import PushTaskListDrawer from "./PushTaskListDrawer.vue";
import UploadMaterials from "./uploadMaterials.vue";

// 树的数据
const treeData = ref<TreeProps["treeData"]>([]);
const expandedKeys = ref<Key[]>([]);
const selectedKeys = ref<string[]>([]);
const keyword = ref("");

// ==================== 素材选中状态 ====================
const selectedMaterials = ref<MaterialItem[]>([]);
const selectedMaterialIds = computed<string[]>(() =>
  selectedMaterials.value
    .map((m) => m.id)
    .filter((id): id is string => Boolean(id))
);

/** 树节点总数 */
const treeTotal = computed(() => {
  const count = (nodes: any[]): number =>
    nodes.reduce(
      (acc: number, node: any) => acc + 1 + count(node.children ?? []),
      0
    );
  return count(treeData.value ?? []);
});

/** 关键字过滤目录树（保留含匹配项的分支） */
const filteredTree = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  const filter = (nodes: any[]): any[] => {
    const result: any[] = [];
    for (const node of nodes) {
      const children = filter(node.children ?? []);
      const nameMatched = node.name?.toLowerCase().includes(kw);
      if (nameMatched || children.length > 0) {
        result.push({ ...node, children });
      }
    }
    return result;
  };
  if (!kw) return treeData.value;
  return filter(treeData.value ?? []);
});

// 搜索时自动展开命中的目录分支
watch(
  keyword,
  () => {
    if (!keyword.value.trim()) return;
    const expand = (nodes: any[]): string[] =>
      nodes.reduce((acc: string[], node: any) => {
        if (node.children?.length) {
          acc.push(node.id);
          acc.push(...expand(node.children));
        }
        return acc;
      }, []);
    expandedKeys.value = expand(filteredTree.value ?? []);
  },
  { flush: "post" }
);

/** AlbumFiles 组件引用，用于获取当前页文件列表 */
type AlbumFilesInstance = ComponentPublicInstance<{
  currentPageFiles: MaterialItem[];
  reload: () => Promise<void>;
}>;
const albumFilesRef = ref<AlbumFilesInstance>();

// ==================== 素材筛选 ====================
/** 筛选查询参数（透传给素材列表接口） */
const filterParams = ref<Partial<MaterialListParams>>({});

/** 素材类型：1 图片 2 视频 3 音频 */
const MATERIAL_TYPE_OPTIONS = [
  { label: "图片", value: 1 },
  { label: "视频", value: 2 },
  { label: "音频", value: 3 },
];

/** 素材格式：1 横版 2 竖版 */
const MATERIAL_FORMAT_OPTIONS = [
  { label: "横版", value: 1 },
  { label: "竖版", value: 2 },
];

/** 常用宽高比（供快速选择，允许自由输入） */
const ASPECT_PRESET_OPTIONS = ["9:16", "3:4", "1:1", "4:3", "16:9", "21:9"];

const filterFormOptions: VbenFormProps = {
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 表单提交后更新筛选条件；子组件 watch filterParams 自动触发列表刷新
  handleSubmit: async (values) => {
    filterParams.value = {
      name: String(values?.materialName ?? "").trim() || undefined,
      type: values?.materialType,
      format: values?.materialFormat,
      fileMd5: values?.fileMd5,
      aspectXy: values?.aspectXy,
      aspectRatio: values?.aspectRatio,
      timeRange: values?.timeRange,
    };
  },
  handleReset: async () => {
    await filterFormApi.resetForm();
    filterParams.value = {};
  },
  // 多列栅格，避免单个筛选项占满整行
  wrapperClass: "xl:grid-cols-4",
  submitButtonOptions: {
    content: "查询",
  },
  resetButtonOptions: {
    content: "重置",
  },
  schema: [
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: "请输入素材名称",
      },
      fieldName: "materialName",
      label: "素材名称",
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        placeholder: "全部类型",
        options: MATERIAL_TYPE_OPTIONS,
      },
      fieldName: "materialType",
      label: "素材类型",
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        placeholder: "全部格式",
        options: MATERIAL_FORMAT_OPTIONS,
      },
      fieldName: "materialFormat",
      label: "素材格式",
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        mode: "tags",
        placeholder: "输入或选择宽高比",
        options: ASPECT_PRESET_OPTIONS.map((value) => ({ label: value, value })),
      },
      fieldName: "aspectXy",
      label: "宽高比",
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        mode: "tags",
        placeholder: "输入或选择画面比例",
        options: ASPECT_PRESET_OPTIONS.map((value) => ({ label: value, value })),
      },
      fieldName: "aspectRatio",
      label: "画面比例",
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        mode: "tags",
        placeholder: "输入文件MD5，回车添加",
      },
      fieldName: "fileMd5",
      label: "文件MD5",
    },
    {
      component: "RangePicker",
      componentProps: {
        allowClear: true,
        format: "YYYY-MM-DD",
        valueFormat: "YYYY-MM-DD",
      },
      fieldName: "timeRange",
      label: "上传时间",
    },
  ],
};

const [FilterForm, filterFormApi] = useVbenForm(filterFormOptions);

/** 全选当前页 */
function handleSelectAllCurrentPage() {
  const files = albumFilesRef.value?.currentPageFiles ?? [];
  if (files.length === 0) return;
  const fileIds = new Set(files.map((f) => f.id).filter(Boolean));
  const allSelected = files.every(
    (f) => Boolean(f.id) && selectedMaterialIds.value.includes(f.id as string)
  );
  if (allSelected) {
    // 取消当前页全选
    selectedMaterials.value = selectedMaterials.value.filter(
      (m) => !fileIds.has(m.id)
    );
  } else {
    // 当前页全选
    const existingIds = new Set(selectedMaterialIds.value);
    for (const m of files) {
      if (m.id && !existingIds.has(m.id)) {
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
  const res = (await materialLibraryApi.fetchDirectoryTreeList()) as unknown as any[];
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
  connectedComponent: NewFolder
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
  connectedComponent: UploadMaterials
});

function upMaterial() {
  drawerApi.open();
}

// ==================== 推送素材 ====================
const [PushMaterialDrawerModal, pushMaterialDrawerApi] = useVbenDrawer({
  connectedComponent: PushMaterialDrawer
});

function openPushMaterialDrawer() {
  if (selectedMaterials.value.length === 0) {
    message.warning($t("page.marketing.asset.pushDrawer.selectMaterialFirst"));
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
  targetId: number | string,
  path: any[] = []
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
  }
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
      type: "delete",
      values: {}
    };
    await materialLibraryApi.fetchDelFolder(params);
    await message.success("删除成功");
    await requestTreeNode();
  } catch (error) {
    await message.error("删除失败");
    console.error("删除文件夹失败:", error);
  }
}

const selectedCount = computed(() => selectedMaterials.value.length);
</script>

<template>
  <Page auto-content-height>
    <div class="material-page">
      <!-- 素材筛选：按内容高度固定，不参与伸缩 -->
      <Card class="material-filter">
        <FilterForm />
      </Card>

      <!-- 目录 + 素材：占满剩余高度，各自内部滚动 -->
      <div class="material-body">
        <!-- 左侧：素材目录 -->
        <Card class="material-tree" :bordered="true">
          <div class="mb-3 flex shrink-0 items-center justify-between">
            <div class="flex items-center gap-2">
              <FolderFilled class="text-[#f5a623]" />
              <span class="text-[15px] font-semibold text-gray-800">素材目录</span>
              <Badge :count="treeTotal" :show-zero="true" :overflow-count="999" color="#006be6" />
            </div>
            <Button
              type="text"
              size="small"
              class="!text-[#006be6]"
              @click="newBuilt()"
            >
              <template #icon>
                <FolderAddOutlined />
              </template>
              新建
            </Button>
          </div>

          <Input
            v-model:value="keyword"
            allow-clear
            size="middle"
            class="!mb-2 shrink-0"
            placeholder="搜索目录"
          >
            <template #prefix>
              <SearchOutlined class="text-gray-400" />
            </template>
          </Input>

          <div class="tree-scroll">
            <DirectoryTree
              v-model:selected-keys="selectedKeys"
              v-model:expanded-keys="expandedKeys"
              :tree-data="filteredTree"
              :field-names="{
                title: 'name',
                key: 'id',
                children: 'children',
              }"
              :show-icon="false"
              block-node
              @select="itemFile"
            >
              <template #title="{ data }">
                <div class="dir-node">
                  <FolderFilled class="dir-node__icon" />
                  <span class="dir-node__name">{{ data.name }}</span>
                  <Dropdown
                    trigger="click"
                    placement="bottomRight"
                    :overlay-style="{ minWidth: '96px' }"
                  >
                    <EllipsisOutlined class="dir-node__menu" @click.stop />
                    <template #overlay>
                      <Menu>
                        <MenuItem key="edit" @click="newBuilt(data)">
                          <EditOutlined class="mr-1" />
                          编辑
                        </MenuItem>
                        <MenuItem key="delete" @click="deleteFolder(data)">
                          <DeleteOutlined class="mr-1 text-red-500" />
                          删除
                        </MenuItem>
                      </Menu>
                    </template>
                  </Dropdown>
                </div>
              </template>
            </DirectoryTree>
          </div>
        </Card>

        <!-- 右侧：工具栏 + 素材内容 -->
        <Card class="material-main">
          <div class="mb-4 shrink-0">
            <Space wrap :size="8">
              <Button type="primary" @click="upMaterial">
                <template #icon>
                  <UploadOutlined />
                </template>
                上传素材
              </Button>
              <Button @click="newBuilt()">
                <template #icon>
                  <FolderAddOutlined />
                </template>
                新建文件夹
              </Button>

              <Divider type="vertical" />

              <Button
                type="primary"
                ghost
                :disabled="selectedCount === 0"
                @click="openPushMaterialDrawer"
              >
                <template #icon>
                  <SendOutlined />
                </template>
                推送素材{{ selectedCount > 0 ? `（${selectedCount}）` : "" }}
              </Button>
              <Button @click="openPushTaskListDrawer">
                <template #icon>
                  <HistoryOutlined />
                </template>
                {{ $t("page.marketing.asset.pushTaskRecord") }}
              </Button>

              <Divider type="vertical" />

              <Button @click="handleSelectAllCurrentPage">
                <template #icon>
                  <CheckSquareOutlined />
                </template>
                {{ $t("page.marketing.asset.pushDrawer.selectAllCurrentPage") }}
              </Button>
              <Button danger :disabled="selectedCount === 0" @click="handleClearSelection">
                <template #icon>
                  <ClearOutlined />
                </template>
                {{ $t("page.marketing.asset.pushDrawer.clearSelection") }}
              </Button>
            </Space>
          </div>

          <AlbumFiles
            ref="albumFilesRef"
            @open-file="newBuilt"
            @breadcrumb-click="handleBreadcrumbJump"
            @toggle-material-select="handleToggleMaterialSelect"
            :tree-item="treeItem ?? []"
            :selected-material-ids="selectedMaterialIds"
            :filter-params="filterParams"
          />
        </Card>
      </div>
    </div>

    <NewFolderModal @tree-node="requestTreeNode" :tree-data="treeData" :id-edit="idEditStr" />
    <UploadMaterialsModal @tree-node="requestTreeNode" :tree-data="treeData" />
    <PushMaterialDrawerModal
      @closed="selectedMaterials = []"
      :materials="selectedMaterials"
    />
    <PushTaskListDrawerModal />
  </Page>
</template>

<style scoped lang="scss">
/* 整页锁高：页面自然填满内容区，素材在卡片内部滚动，不再撑出页面滚动条 */
.material-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

/* 筛选区按内容高度固定，不参与伸缩 */
.material-filter {
  flex: none;
}

/* 目录 + 素材：占满筛选区之外的剩余高度 */
.material-body {
  display: flex;
  flex: 1;
  gap: 16px;
  min-height: 0;
}

/* 左：目录树，按原 24 栅格中 7 份的占比，树自身滚动 */
.material-tree {
  display: flex;
  flex: none;
  flex-direction: column;
  width: 29%;
  min-width: 240px;
  overflow: hidden;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
}

.tree-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

/* 右：素材区，吃掉剩余宽度，网格在内部滚动 */
.material-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
}

/* 窄屏回退：恢复上下堆叠，并交回页面整体滚动 */
@media (max-width: 1199px) {
  .material-page {
    height: auto;
  }

  .material-body {
    flex-direction: column;
  }

  .material-tree {
    width: 100%;
    max-height: 320px;
  }

  .material-main {
    min-height: 420px;
  }
}

:deep(.dir-node) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding-right: 6px;

  .dir-node__icon {
    flex: none;
    color: #f5a623;
  }

  .dir-node__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .dir-node__menu {
    flex: none;
    padding: 2px 4px;
    font-size: 14px;
    color: #a0aab6;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .dir-node__menu {
    opacity: 1;
  }
}
</style>
