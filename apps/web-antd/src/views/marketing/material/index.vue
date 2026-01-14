<script setup lang="ts">
import { Row, Col, DirectoryTree, Button } from "ant-design-vue";
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { onMounted, ref } from "vue";
import NewFolder from "./newFolder.vue";
import UploadMaterials from "./uploadMaterials.vue";
import AlbumFiles from "./albumFiles.vue";
import { materialLibraryApi } from '#/api/core';
// import type { FolderItem } from "#/api/models";
import type { TreeProps } from 'ant-design-vue';

// 树的数据
const treeData = ref<TreeProps['treeData']>([]);

const selectedKeys = ref<string[]>([]);

onMounted(async()=>{
  await requestTreeNode()
})

async function requestTreeNode(){
  const res = await materialLibraryApi.fetchDirectoryTreeList()
  treeData.value = res
  console.log(treeData.value,'树结构');

}

//--------新建文件夹弹框------------
const [NewFolderModal, newFolderApi] = useVbenModal({
  connectedComponent: NewFolder,
});

const idEditStr = ref()
async function newBuilt(row:any){
  newFolderApi.open()
  if (row) {
    idEditStr.value = row
  //  await newFolderApi.setValues(row)
    console.log(idEditStr.value,'编辑文件夹打开来的数据');
  }
}

//--------上传素材弹框------------
const [UploadMaterialsModal, drawerApi] = useVbenDrawer({
  connectedComponent: UploadMaterials,
});

function upMaterial(){
  drawerApi.open()
  console.log("点击了上传素材按钮");
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
                :tree-data="treeData"
                :field-names="{
                  title: 'name',
                  key: 'id',
                  children: 'children'
                }"
              >
              </DirectoryTree>
            </div>
          </div>
        </Col>
        <Col class="rightCol" :span="18">
          <div class="materialRight">
            <div>
              <Button type="primary" @click="upMaterial">上传素材</Button>
              <Button style="margin: 0 0 0 5px;" @click="newBuilt">新建文件夹</Button>
            </div>
            <AlbumFiles @open-file="newBuilt" :treeData="treeData ?? []"/>
          </div>
        </Col>
      </Row>
    </Page>
    <NewFolderModal @treeNode="requestTreeNode" :treeData="treeData" :idEdit="idEditStr"/>
    <UploadMaterialsModal :treeData="treeData"/>
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
  background: pink;
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
