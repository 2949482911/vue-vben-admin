
<script setup lang="ts">
import { Dropdown, Menu, MenuItem, Pagination } from "ant-design-vue";
import { uploadEditApi } from '#/api/core';
import { reactive, watch } from "vue";
import type { FolderItem } from '#/api/models';
import type { TreeProps } from 'ant-design-vue';

const props = defineProps<{
  treeData: FolderItem[] | TreeProps[];
}
>()

watch(
  () => props.treeData,
  (newVal) => {
    // 当 props.treeData 有数据时才调用接口
    if (newVal && newVal.length) {
      fileList();
    }
  },
  { immediate: true } // 页面加载时立即触发一次
);

const pages = reactive({
  pageSize:10,
  current:1,
  total:0
})
const onShowSizeChange = (current: number, pageSize: number) => {
  pages.current = current
  pages.pageSize = pageSize
};

async function fileList(){
  const firstFolder = (props.treeData as FolderItem[])[0];
  if (!firstFolder) return;
  try{
    const res = await uploadEditApi.fetchMaterialList({
      name: firstFolder.name,
      albumId: firstFolder.id,
      pageSize: pages.pageSize,
      current: pages.current,
    })
    pages.total = res.total
    console.log(res,'resresresres');
  }catch(err){
    console.log(err);
  }
}

const emit = defineEmits(['openFile']);

interface MaterialItem {
  id: number;
  type: 'folder' | 'file';
  title: string;
  count?: number;
  cover?: string;
  size?: string;
  status?: string;
}

/**
 * 改这个数组即可验证三种情况
 * 1. 全 folder
 * 2. 全 file
 * 3. folder + file 混合（当前就是）
 */
const list: MaterialItem[] = [
  { id: 1, type: 'folder', title: '腾讯', count: 11 },
  { id: 2, type: 'folder', title: '巨量', count: 40 },
  { id: 3, type: 'folder', title: '巨量', count: 40 },
  { id: 4, type: 'folder', title: '巨量', count: 40 },
  { id: 5, type: 'folder', title: '巨量', count: 40 },
  { id: 6, type: 'folder', title: '巨量', count: 40 },
  { id: 7, type: 'folder', title: '巨量', count: 40 },
  { id: 8, type: 'folder', title: '巨量', count: 40 },
  {
   id: 9,
   type: 'file',
   title: 'R-C (1)',
    cover: 'https://picsum.photos/400/225?1',
    size: '1920×1080',
    status: '2026-01-12 10:35:58',
  },
  {
    id: 10,
    type: 'file',
    title: 'R-C (2)',
    cover: 'https://picsum.photos/400/225?2',
    size: '1920×1080',
    status: '2026-01-12 10:35:58',
  },
];

function editFile(rowVal:any){
  emit('openFile', rowVal)
}

</script>

<template>
  <div class="material-page">
    <div class="material">
      全部专辑 / demo侧手i1111 / 金智
    </div>
    <div class="material-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="material-item"
        :class="item.type"
      >
        <!-- 文件夹 -->
        <template v-if="item.type === 'folder'">
          <div class="folder-cover">
            <img
              src="https://cdn-icons-png.flaticon.com/512/716/716784.png"
              alt="folder"
            />
          </div>
          <div class="folder-info">
            <div class="title">{{ item.title }}</div>
            <div class="main-text">
              <div class="count">素材 {{ item.count }}</div>
              <!-- 三个点 -->
              <div class="more-btn">
              <Dropdown placement="bottom">
                <a href="javascript:;">•••</a>
                <template #overlay>
                  <Menu>
                    <MenuItem>
                      <a href="javascript:;" @click="editFile(item)">编辑</a>
                    </MenuItem>
                    <!-- <MenuItem>
                      <a href="javascript:;">删除</a>
                    </MenuItem> -->
                  </Menu>
                </template>
              </Dropdown>

              </div>
            </div>
          </div>
        </template>
  
        <!-- 文件 -->
        <template v-else>
          <div class="file-cover">
            <img :src="item.cover" alt="file" />
            <span class="size">{{ item.size }}</span>
          </div>
          <div class="file-info">
            <div class="title">{{ item.title }}</div>
            <div class="status">上传时间：{{ item.status }}</div>
          </div>
        </template>
      </div>
    </div>
    <Pagination
      class="pagination"
      show-size-changer
      v-model:current="pages.current"
      v-model:pageSize="pages.pageSize"
      :total="pages.total"
      :show-total="total => `共 ${total} 条`"
      @showSizeChange="onShowSizeChange"
    />
  </div>
</template>

<style scoped>
.material-page {
  display: flex;
  flex-direction: column;
  height: 97%;            /* 或 calc(100vh - xxx) */
  overflow: hidden;        /* 防止整体被撑破 */
}

.material{
  flex-shrink: 0;
  padding: 10px 0;
  margin-top: 10px;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}

/* 容器：自动换行 */
.material-list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 16px;
  align-content: flex-start;
  align-items: flex-start;
  margin: 10px 0;
  overflow-y: auto;
}

/* 公共卡片样式 */
.material-item {
  cursor: pointer;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  transition: all 0.2s;
}

.material-item:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
}

/* ================= 文件夹 ================= */
.material-item.folder {
  width: 220px;
  padding: 12px;
}

.folder-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: #f5f7fa;
}

.folder-cover img {
  width: 48px;
  height: 48px;
}

.folder-info {
  margin-top: 8px;
}

.folder-info .title {
  font-size: 14px;
  font-weight: 500;
}

.folder-info .main-text{
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.folder-info .count {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

/* ================= 文件 ================= */
.material-item.file {
  width: 220px;
}

.file-cover {
  position: relative;
  height: 170px;
  background: #000;
}

.file-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-cover .size {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 2px 6px;
  font-size: 12px;
  color: #fff;
  background: rgb(0 0 0 / 60%);
  border-radius: 2px;
}

.file-info {
  padding: 8px 12px;
}

.file-info .title {
  font-size: 14px;
  font-weight: 500;
}

.file-info .status {
  margin-top: 4px;
  font-size: 12px;
}

.pagination{
  padding: 5px 0 0;
  border-top: 1px solid #ccc;
}
</style>
