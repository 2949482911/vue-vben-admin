<script setup lang="ts" name="AuthAccount">
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { $t } from '@vben/locales';
import { Button, message, type UploadFile } from 'ant-design-vue';
import { ref } from 'vue';
import {advertiserApi} from "#/api";
const emit = defineEmits(['pageReload']);
// 用于存储原始文件（真正要上传的文件）
const selectedFile = ref<File | null>(null);
// 用于绑定 Upload 组件的文件列表（仅用于 UI 展示）
const fileList = ref<any[]>([]);
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: { class: 'w-full' },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.select')}`,
        showSearch: true,
        options: [
          {
            label: '华为商店',
            value: 'huawei_store'
          },
          {
            label: 'OPPO',
            value: 'oppo'
          }
        ],
      },
      rules: 'required',
      fieldName: 'platform',
      label: '平台',
    },
    {
      fieldName: 'files',
      label: '导入文件',
      component: 'Upload',
      rules: 'required',
      componentProps: {
        // 更多属性见：https://ant.design/components/upload-cn
        accept: '.xlsx,.csv',
        disabled: false,
        maxCount: 1,
        // 单位：MB
        maxSize: 2,
        multiple: false,
        showUploadList: true,
        fileList: fileList.value, // 绑定我们自己的文件列表
        beforeUpload: (file: File) => {
          console.log('beforeupload',file)
          // 验证文件类型
          const isExcel = file.type.includes('spreadsheetml.sheet') 
                       || file.type === 'application/vnd.ms-excel'
                       || file.name.endsWith('.xlsx') 
                       || file.name.endsWith('.xls');
          if (!isExcel) {
            message.error('只能上传 Excel 文件');
            return false;
          }

          // 保存原始文件
          selectedFile.value = file;

          // 手动构建文件列表项（用于显示）
          const fileItem = {
            uid: file.uid,
            name: file.name,
            status: 'done', // 显示为上传成功样式，实际未上传
            url: '',
            originFileObj: file, // 保留原始文件引用
          };
          fileList.value = [fileItem]; // 更新列表

          // 返回 false 阻止自动上传
          return false;
        },
        onRemove: () => {
          // 移除文件时清空状态
          selectedFile.value = null;
          fileList.value = [];
        },
      },
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 对话框打开
    }
  },
});

// 取消按钮：重置表单并关闭对话框
const handleCancel = async () => {
  submitting.value = false;
  await formApi.resetForm();
  await modalApi.close();
};
const submitting = ref<Boolean>(false)
const handleConfirm = async () => {
  // 1. 表单验证
  try {
    await formApi.validate();
  } catch {
    return; 
  }
  submitting.value = true;
  const values = await formApi.getValues();
  const platform = values.platform;
  const file = selectedFile.value;
  if (!file) {
    message.error('请选择文件');
    return;
  }
  const formData = new FormData();
  formData.append('file', file); 
  try {
   const res = await advertiserApi.fetchImportData(formData, platform );
   if(res.errors.length === 0) {
    const successCount = res.successCount
    const failCount = res.failCount
      message.success(`成功导入数据${successCount}条，导入失败${failCount}条`);
   } else {
      message.error(`导入失败,${res.errors[0].errorMsg}`);
   }
    await modalApi.close(); 
    emit('pageReload');
  } catch (error: any) {
    message.error(error.message || '导入失败');
  } finally {
    submitting.value = false;
  }
};
const downloadTemplate = async () => {
  const formValue = await formApi.getValues();
  console.log(formApi)
  const platform = formValue.platform;
  if (!platform) {
    message.warning('请先选择平台');
    return;
  }
  const res = await advertiserApi.fetchDownloadTemplate({ platform });
  // 假设 res.url 是下载地址
  const downloadUrl = res; // 根据实际响应结构调整
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `模版下载_${platform}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div>
    <Modal title="导入数据">
      <Form />
      <!-- 自定义底部按钮区域 -->
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="handleCancel">{{ $t('common.cancel') }}</Button>
          <Button type="primary" ghost @click="downloadTemplate" :disabled="submitting">下载模板</Button>
          <Button type="primary" @click="handleConfirm" :loading="submitting">{{ $t('common.confirm') }}</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style lang="scss" scoped></style>
