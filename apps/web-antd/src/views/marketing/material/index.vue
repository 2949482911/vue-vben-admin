<script setup lang="ts">
import { Row, Col, DirectoryTree, Button } from "ant-design-vue";
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { nextTick, onMounted, ref } from "vue";
import NewFolder from "./newFolder.vue";
import UploadMaterials from "./uploadMaterials.vue";
import AlbumFiles from "./albumFiles.vue";
import { materialLibraryApi } from '#/api/core';
import type { TreeProps } from 'ant-design-vue';
import type { Key } from "ant-design-vue/es/vc-tree-select/interface";
import type { FolderItem } from "#/api/models";
import type { MaterialLibraryFolderType } from "./materialType";

// 树的数据
const treeData = ref<TreeProps['treeData']>([]);
const expandedKeys = ref<Key[]>([]);

const selectedKeys = ref<string[]>([]);

onMounted(async()=>{
  await requestTreeNode()
})

async function requestTreeNode(){
  const res = await materialLibraryApi.fetchDirectoryTreeList()
  treeData.value = res
  if (res && res.length > 0) {
    const firstNode = res[0];
    
    // 1. 设置路径数组（供子组件面包屑使用）
    treeItem.value = [firstNode];
    
    // 2. 关键：设置选中状态的高亮 key
    // 注意：Tree 组件的 key 通常是 string，如果接口返回的是 number，建议 String() 转换一下
    selectedKeys.value = [firstNode.id];
    
    // 3. 可选：如果你希望默认展开第一个节点
    expandedKeys.value = [firstNode.id];
  }
}

//--------新建文件夹弹框------------
const [NewFolderModal, newFolderApi] = useVbenModal({
  connectedComponent: NewFolder,
});

const idEditStr = ref<MaterialLibraryFolderType|null>(null)
async function newBuilt(row?:MaterialLibraryFolderType){
  if (row) {
    idEditStr.value = { ...row }; // 使用解构防止引用污染
  } else {
    idEditStr.value = null; 
  }
  
  await nextTick();
  newFolderApi.open();
}

//--------上传素材弹框------------
const [UploadMaterialsModal, drawerApi] = useVbenDrawer({
  connectedComponent: UploadMaterials,
});

function upMaterial(){
  drawerApi.open()
}

function findPathNodes(tree: any[], targetId: string | number, path: any[] = []): any[] | null {
  for (const node of tree) {
    // 记录当前路径
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

//树结点的选择
const treeItem = ref<FolderItem[]>()
function itemFile(selectedKeys: Key[], info: any) {
  if (info.selected) {
    const nodeId = info.node.key; // 或者 info.node.id
    const fullPath = findPathNodes(treeData.value || [], nodeId);
    if (fullPath) {
      treeItem.value = fullPath;
    }
  }
}

// 处理面包屑点击回跳
function handleBreadcrumbJump(item: FolderItem) {
  // 同步左侧树的高亮
  selectedKeys.value = [item.id as string];
  
  // 重新计算路径（确保拼接完整）
  const fullPath = findPathNodes(treeData.value || [], item.id);
  if (fullPath) {
    treeItem.value = fullPath;
  }
}

</script>

<template>
  <div class="material">
    <Page auto-content-height>
      <Row class="materialRow" :gutter="{ xs:8, sm:16, md:16}">
        <Col class="leftCol" :span="6">
          <div class="materialLeft">
            <div style="margin-bottom: 8px;font-size: 17px;text-align: center;">全部专辑</div>
            <div class="tree">
              <DirectoryTree
                v-model:selectedKeys="selectedKeys"
                v-model:expandedKeys="expandedKeys"
                :tree-data="treeData"
                :field-names="{
                  title: 'name',
                  key: 'id',
                  children: 'children'
                }"
                @select="itemFile"
              >
              </DirectoryTree>
            </div>
          </div>
        </Col>
        <Col class="rightCol" :span="18">
          <div class="materialRight">
            <div>
              <Button type="primary" @click="upMaterial">上传素材</Button>
              <Button style="margin: 0 0 0 5px;" @click="newBuilt()">新建文件夹</Button>
            </div>
            <AlbumFiles @open-file="newBuilt" @breadcrumb-click="handleBreadcrumbJump" :treeItem="treeItem ?? []"/>
          </div>
        </Col>
      </Row>
    </Page>
    <NewFolderModal @treeNode="requestTreeNode" :treeData="treeData" :idEdit="idEditStr"/>
    <UploadMaterialsModal @treeNode="requestTreeNode" :treeData="treeData"/>
  </div>
</template>

<style scoped lang="scss">
.materialRow {
  height: 100%;
}

.leftCol,
.rightCol {
  display: flex;
  height: 100%;
}

.materialLeft,
.materialRight {
  flex: 1;
  padding: 10px;
  background: white;
  // background: pink;
  border-radius: calc(var(--radius) - 2px)
}

.materialLeft{
  display: flex;          
  flex-direction: column; 
  padding-bottom: 13px;
  overflow: hidden;       
}

.tree{
  overflow: hidden auto;       
}

:deep(.ant-tree){
  border-radius: 0
}

// .maskDebris{
//   padding: 10px 0;
// }

</style>
