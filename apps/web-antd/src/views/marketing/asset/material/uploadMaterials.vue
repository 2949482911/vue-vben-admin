<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { UploadDragger, TreeSelect, Image, message, Button, Upload, Radio } from 'ant-design-vue';
import { ref } from 'vue';
import { SvgUploadIcon } from '@vben/icons';
import type { FolderItem } from '#/api/models';
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { useOssClient } from './useOssClient';
import { getFileMeta } from '#/utils/fileMeta';
import { uploadToOss } from '#/utils/uploadToOss';
import { uploadEditApi } from '#/api/core';

const props = defineProps<{
  treeData: FolderItem[];
}>();

/** ================== 表单 & 文件 ================== */
const nameId = ref<string>('');
const fileList = ref<any[]>([]);

// 新增：串行上传队列控制
const pendingFiles = ref<File[]>([]);
const isUploading = ref(false);
// 新增：控制当前是“文件模式”还是“文件夹模式”，默认 false (文件模式)
const isDirectoryMode = ref<boolean>(false);

const emit = defineEmits<{
  (e: 'treeNode'): void
}>();

/** ================== Drawer ================== */
const [Drawer, drawerApi] = useVbenDrawer({
  // 当抽屉打开状态改变时触发
  async onOpenChange(isOpen) {
    if (!isOpen) {
      await drawerApi.close();
      await resetAll()
    }
  },
  async onConfirm() {
    await drawerApi.close();
    emit('treeNode');
  },
});

/** ================== Form ================== */
const [Form,formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  commonConfig: {
    componentProps: { class: 'w-full' },
  },
  schema: [
    {
      component: 'Select',
      fieldName: 'name',
      label: '名字',
      rules: 'required',
    },
    // {
    //   component: 'Textarea',
    //   fieldName: 'remark',
    //   label: '备注',
    // },
    {
      fieldName: 'files',
      label: '附件上传',
      component: 'UploadDragger',
      rules: 'required',
    }
  ]
});

/** ================== 表格 ================== */
const gridData = ref<any[]>([]);

const gridOptions: VxeGridProps = {
  height: '100%',
  data: gridData.value,
  checkboxConfig: { highlight: true },
  columns: [
    { title: '序号', type: 'seq', width: 60 },
    { field: 'category', title: '素材名' },
    { field: 'status', title: '上传状态', width: 100 },
  ],
  pagerConfig: { enabled: false },
};

/** ================== 批量串行上传逻辑 ================== */

// 1. 拦截文件加入队列
function handleBeforeUpload(file: any) {
  if (!nameId.value) {
    if (pendingFiles.value.length === 0 && !isUploading.value) {
      message.error("请先选择上传文件夹");
    }
    return Upload.LIST_IGNORE;
  }

  const rawFile: File = file.originFileObj ?? file;
  // 过滤幽灵文件夹
  if (rawFile.size === 0 && !rawFile.name.includes('.')) {
    return Upload.LIST_IGNORE;
  }

  // 防止同一批次重复拖拽
  const isExist = gridData.value.some(item => item.category === rawFile.name);
  if (isExist) {
    return Upload.LIST_IGNORE;
  }

  // 1：拖入瞬间立刻加入表格，状态标记为“排队中...”
  gridData.value.push({
    fileId: rawFile.uid || `${Date.now()}_${Math.random()}`, // 增加唯一标识
    category: rawFile.name,
    status: '排队中...',
  });
  
  // 2：VxeGrid 刷新数据，解决可能存在的响应式丢失问题
  gridApi.setGridOptions({ data: gridData.value });

  // 加入执行队列并触发处理
  pendingFiles.value.push(rawFile);
  processQueue();
  return Upload.LIST_IGNORE; 
}

// 3. 单个文件上传核心逻辑
async function doUpload(rawFile: File) {
  const isVideo = rawFile.type.startsWith('video/');

  // 从表格中精准找到当前这个文件，更新状态为“上传中...”
  const currentRecord = gridData.value.find(item => item.category === rawFile.name && item.status === '排队中...');
  if (currentRecord) {
    currentRecord.status = '上传中...';
    // 每次状态改变都最好同步一下 Grid
    gridApi.setGridOptions({ data: gridData.value }); 
  }

  try {
    const meta = await getFileMeta(rawFile);
    const ext = rawFile.name.substring(rawFile.name.lastIndexOf('.'));
    const ossKey = `${meta.fileMd5}${ext}`;

    const client = await useOssClient();
    const result = await uploadToOss(client, rawFile, ossKey);

    const payload = {
      name: rawFile.name,
      albumId: nameId.value,
      fileMd5: meta.fileMd5,
      fileSize: meta.fileSize,
      width: meta.width,
      height: meta.height,
      fileUrl: result.url,
      thumbnailUrl: isVideo 
        ? `${result.url}?x-oss-process=video/snapshot,t_1000,f_jpg,w_200` 
        : result.url,
    };

    await uploadEditApi.fetchUploadMaterials(payload);

    if (currentRecord) {
      currentRecord.status = '已上传';
      gridApi.setGridOptions({ data: gridData.value });
    }
  } catch (err: any) {
    console.error(`文件 ${rawFile.name} 上传失败:`, err);
    if (currentRecord) {
      console.log('currentRecord',currentRecord)
      currentRecord.status = err?.message?.includes('已上传') ? '文件已存在' : '上传失败';
      gridApi.setGridOptions({ data: gridData.value });
    }
  }
}

// 2. 队列消费机 (严格挨个执行)
async function processQueue() {
  if (isUploading.value) return; // 如果正在处理，则不再重复开启循环
  isUploading.value = true;

  while (pendingFiles.value.length > 0) {
    const currentFile = pendingFiles.value.shift();
    if (currentFile) {
      await doUpload(currentFile);
    }
  }
  isUploading.value = false;
}

function delFile(index: number){
  gridData.value.splice(index, 1);
}

/** ================== 重置逻辑 ================== */
function resetAll() {
  formApi.resetForm();
  nameId.value = '';
  fileList.value = [];
  gridData.value = [];
  
  // 重置队列
  pendingFiles.value = [];
  isUploading.value = false;

  gridApi.setGridOptions({ data: [] });
}

/** ================== Grid ================== */
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="上传素材">
      <Form>
        <template #name>
          <TreeSelect
            :treeData="props.treeData"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            v-model:value="nameId"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择文件夹"
            allow-clear
          >
          </TreeSelect>
        </template>
        <template #files="slotProps">
          <div class="selectBtns">
            <Radio.Group v-model:value="isDirectoryMode" button-style="solid" size="small">
              <Radio.Button class="singleBtn" :value="false">上传单个/多个文件</Radio.Button>
              <Radio.Button class="directoryBtn" :value="true">上传整个文件夹</Radio.Button>
            </Radio.Group>
          </div>
          <UploadDragger
            v-bind="slotProps"
            v-model:fileList="fileList"
            multiple
            :directory="isDirectoryMode"  
            :before-upload="handleBeforeUpload"
            :showUploadList="false"
            >
            <p class="pIcon">
              <SvgUploadIcon class="iconClass" />
            </p>
            <p class="ant-upload-text">
              {{ isDirectoryMode ? '点击选择文件夹，或拖拽文件夹到此处' : '点击选择文件（支持多选），或拖拽文件到此处' }}
            </p>
          </UploadDragger>
        </template>
      </Form>
      <Grid style="height:58%">
        <!-- <template  #action="{ row, rowIndex }">
          <Button type="link" danger @click="delFile(rowIndex)">删除</Button>
        </template> -->
        <!-- 缩略图 -->
        <!-- <template #imageUrl2="{ row }">
          <Image :src="row.imageUrl2" height="30" width="30" />
        </template> -->
      </Grid>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
.pIcon{
  display: flex;
  align-items: center;
  justify-content: center;
}

.iconClass{
  font-size: 60px;
}
.selectBtns {
  text-align: center;
  .singleBtn {
    margin-bottom: 10px;
  }
}
:deep(.vxe-cell--col-resizable){
  right: -3px !important;
}
</style>
