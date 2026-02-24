
<script setup lang="ts">
import { Dropdown, Menu, MenuItem, Pagination } from "ant-design-vue";
import { uploadEditApi } from '#/api/core';
import { reactive, ref, watch } from "vue";
import type { FolderItem } from '#/api/models';
import type { MaterialLibraryFolderType } from "./materialType";

const props = defineProps<{
  treeItem: FolderItem[]
}
>()

watch(
  () => props.treeItem,
  (newVal) => {
    // 当 props.treeItem 有数据时才调用接口
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
// 分页页码改变时的回调
const handlePageChange = (page: number, pageSize: number) => {
  pages.current = page;
  pages.pageSize = pageSize;
  fileList(); // 重新拉取数据
};

const list = ref<any[]>()
async function fileList() {
  // 增加更严谨的判断：确保 treeItem 有值且最后一项不为空
  if (!props.treeItem || props.treeItem.length === 0) return;
  
  const currentFolder = props.treeItem[props.treeItem.length - 1];
  
  // 关键：如果最后一项是 undefined，直接拦截
  if (!currentFolder || !currentFolder.id) {
    console.warn('当前路径节点无效:', currentFolder);
    return;
  }

  try {
    const res = await uploadEditApi.fetchMaterialList({
      albumId: currentFolder.id, // 现在这里不会报 undefined 错误了
      pageSize: pages.pageSize,
      page: pages.current,
    });
    list.value = [];
    pages.total = res.total;
    list.value = res.items;
  } catch (err) {
    console.error(err);
  }
}

// 当点击列表里的文件夹卡片时
function handleFolderClick(item: any) {
  if (item.type === 1) { // 假设 1 是文件夹
    // 触发父组件的 breadcrumbClick 事件，让父组件去更新选中项和路径
    emit('breadcrumbClick', item);
  }
}

const emit = defineEmits<{
  (e: 'openFile', rowVal: MaterialLibraryFolderType): void;
  (e: 'breadcrumbClick', item: FolderItem): void;
}>();

function editFile(rowVal:MaterialLibraryFolderType){
  emit('openFile', rowVal)
}

// 点击面包屑跳转
function handleBreadcrumbClick(item: FolderItem) {
  // --- 完善防御逻辑 ---
  if (!props.treeItem || props.treeItem.length === 0) return;
  
  // 获取当前最后一项（即当前展示的目录）
  const currentFolder = props.treeItem[props.treeItem.length - 1];
  
  // 如果点击的是当前已选中的目录，直接返回，不触发 emit
  if (item.id === currentFolder?.id) {
    return;
  }
  // 通常是触发一个事件，让父组件切换选中的文件夹 ID
  emit('breadcrumbClick', item); 
}

</script>

<template>
  <div class="material-page">
    <div class="material">
      <template v-for="(item, index) in props.treeItem" :key="item?.id || index">
        <span v-if="item"> <span 
            class="breadcrumb-item" 
            @click="handleBreadcrumbClick(item)"
          >
            {{ item.name }}
          </span>
          <span v-if="index < props.treeItem.length - 1" class="separator"> / </span>
        </span>
      </template>
    </div>
    <div class="material-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="material-item"
        :class="item.type"
      >
        <!-- 文件夹 -->
        <template v-if="item.type === 1">
          <div class="folder-content" @click="handleFolderClick(item)">
            <div class="folder-cover">
              <img
                src="https://cdn-icons-png.flaticon.com/512/716/716784.png"
                alt="folder"
              />
            </div>
            <div class="folder-info">
              <div class="title" :title="item.name">{{ item.name }}</div>
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
        </div>
        </template>
  
        <!-- 文件 -->
        <template v-else>
          <div class="file-cover">
            <img :src="item.fileUrl" alt="file" />
            <!-- <span class="size">{{ item.size }}</span> -->
          </div>
          <div class="file-info">
            <div class="title" :title="item.name">{{ item.name }}</div>
            <div class="status">上传时间：{{ item.updateTime }}</div>
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
      @change="handlePageChange"
    />
  </div>
</template>

<style scoped>
.material-page {
  display: flex;
  flex-direction: column;
  height: 98%;            
  overflow: hidden;        
}

.material {
  flex-shrink: 0;
  padding: 10px 15px; /* 稍微增加内边距 */
  margin-top: 10px;
  font-size: 14px;
  color: #666;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}

.breadcrumb-item {
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #1890ff; /* 悬浮时变蓝色，提示可点击 */
}

.separator {
  margin: 0 8px;
  color: #ccc;
  cursor: default;
}

/* 最后一个面包屑高亮或不可点击（表示当前位置） */
.material > span:last-child .breadcrumb-item {
  font-weight: bold;
  color: #333;
  cursor: default;
}

.material > span:last-child .breadcrumb-item:hover {
  text-decoration: none;
}

/* 容器：自动换行 */
.material-list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 16px;
  align-content: flex-start;
  align-items: flex-start;
  min-height: 0;
  margin: 10px 0;
  overflow-y: auto;
}

/* 公共卡片样式 */
.material-item {
  flex-shrink: 0; /* 确保在空间不足时不会缩小 */
  width: 220px;
  min-width: 220px;
  max-width: 220px;
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
  padding: 8px 12px;
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

.title {              
  display: block;  

  /* 确保它占据父容器的宽度 */
  width: 100%;      

  /* 隐藏超出部分 */
  overflow: hidden;         

  /* 溢出部分用省略号代替 */
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 500;

  /* 强制单行显示 */
  white-space: nowrap;
}

/* ================= 文件 ================= */
.material-item.file {
   /* padding: 12px; */
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

.folder-cover, .file-cover {
  height: 140px; /* 统一封面高度 */
  overflow: hidden;
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
  flex-shrink: 0;
  padding: 5px 0 0;
  border-top: 1px solid #ccc;
}
</style>
