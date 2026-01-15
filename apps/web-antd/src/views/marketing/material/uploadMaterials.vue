<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { UploadDragger, TreeSelect, Image, message, Button } from 'ant-design-vue';
import { ref } from 'vue';
import { SvgUploadIcon } from '@vben/icons';
import type { FolderItem } from '#/api/models';
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
// import { uploadCredentialsApi } from '#/api/core';
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

/** ================== Drawer ================== */
const [Drawer, drawerApi] = useVbenDrawer({
});

/** ================== Form ================== */
const [Form] = useVbenForm({
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
    { title: '序号', type: 'seq' },
    { field: 'category', title: '素材名' },
    // { field: 'imageUrl2', title: '素材文件', cellRender: { name: 'CellImage' } },
    // { field: 'remark', title: '素材备注' },
    { field: 'status', title: '上传状态' },
    // {
    //   field: 'action',
    //   fixed: 'right',
    //   slots: { default: 'action' },
    //   title: '操作',
    //   width: 120,
    // },
  ],
  pagerConfig: { enabled: false },
};


/** ================== 自定义上传 ================== */
async function customUpload({ file, onSuccess, onError }: any) {
  const rawFile: File = file.originFileObj ?? file;

  // 1️⃣ 文件元信息
  const meta = await getFileMeta(rawFile);

  // 2️⃣ oss key
  const ext = rawFile.name.substring(rawFile.name.lastIndexOf('.'));
  const ossKey = `${meta.fileMd5}${ext}`;

  if(!nameId.value){
      message.error("请选择上传文件")
      return
  }
  // 3️⃣ 表格状态
  const record = {
    category: rawFile.name,
    status: '上传中',
  };
  const index = gridData.value.length;
  gridData.value.push(record);

  // 4️⃣ 获取 OSS client（重点）
  const client = await useOssClient();

  const result = await uploadToOss(client, rawFile, ossKey);

  // 上传完成后
  // gridData.value[index] = {
  //   ...record,
  //   status: '已上传',
  // };
  // 5️⃣ 调后端接口
  const payload = {
    name: rawFile.name,
    albumId: nameId.value,
    fileMd5: meta.fileMd5,
    fileSize: meta.fileSize,
    width: meta.width,
    height: meta.height,
    fileUrl: result.url,
    thumbnailUrl: result.url,
  };

  // 5️⃣ 调后端接口 + 更新状态
  try {
    await uploadEditApi.fetchUploadMaterials(payload);

    // 正常成功
    gridData.value[index] = {
      ...record,
      status: '已上传',
    };
  } catch (err: any) {
    // 关键：这里才是 code === -1 的情况
    const code = err?.code ?? err?.response?.data?.code;
    // const msg = err?.message ?? err?.response?.data?.message;

    if (code === -1) {
      gridData.value[index] = {
        ...record,
        status: '文件已存在',
      };
    } else {
      gridData.value[index] = {
        ...record,
        status: '上传失败',
      };
    }
    // message.warning(msg || '上传失败');
  }
  onSuccess?.(result);
}

function delFile(index: number){
  gridData.value.splice(index, 1);
}

/** ================== Grid ================== */
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="上传素材">
      <Form>
        <!-- 级联选择器 -->
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
          <UploadDragger
            v-bind="slotProps"
            v-model:fileList="fileList"
            :custom-request="customUpload"
            :showUploadList="false"
            >
            <!-- @change="handleChange" -->
            <p class="pIcon">
              <SvgUploadIcon class="iconClass" />
            </p>
            <p class="ant-upload-text">上传文件</p>
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

:deep(.vxe-cell--col-resizable){
  right: -3px !important;
}
</style>
