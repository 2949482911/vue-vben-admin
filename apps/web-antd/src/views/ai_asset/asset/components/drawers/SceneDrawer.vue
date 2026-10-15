<script lang="ts" setup name="SceneDrawer">
/**
 * 资产 — 场景 新增/编辑（useVbenDrawer + useVbenForm）
 */
import type { SceneItem } from '#/api/models/ai_asset';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Image, message, Upload } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { aiAssetApi } from '#/api';

import { useAssetUpload } from '../../../useAssetUpload';

const emit = defineEmits(['success']);
const { upload } = useAssetUpload();

const isUpdate = ref(false);
const previewUrl = ref('');

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    await aiAssetApi.saveScene({
      description: values.description || undefined,
      id: values.id || undefined,
      name: values.name,
      refUrl: values.refUrl || undefined,
    });
    await drawerApi.close();
  },
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      dependencies: { show: false, triggerFields: ['*'] },
      fieldName: 'id',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '如 现代厨房' },
      fieldName: 'name',
      label: '场景名称',
      rules: 'required',
    },
    {
      component: 'Input',
      dependencies: { show: false, triggerFields: ['*'] },
      fieldName: 'refUrl',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '明亮橱柜 + 大理石台面…', rows: 3 },
      fieldName: 'description',
      label: '描述',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    emit('success');
  },
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    formApi.resetForm();
    const row = (drawerApi.getData() as SceneItem) ?? {};
    previewUrl.value = '';
    if (row.id) {
      isUpdate.value = true;
      previewUrl.value = row.refUrl ?? '';
      formApi.setValues(row as Record<string, any>);
    } else {
      isUpdate.value = false;
    }
  },
});

async function beforeUpload(file: File) {
  try {
    const url = await upload(file);
    previewUrl.value = url;
    await formApi.setFieldValue('refUrl', url);
    message.success('参考图已上传');
  } catch {
    message.error('上传失败');
  }
  return false;
}

const title = computed(() => (isUpdate.value ? '编辑场景' : '新增场景'));
</script>

<template>
  <Drawer :title="title">
    <div class="upload-row">
      <Image
        v-if="previewUrl"
        :height="48"
        :preview="false"
        :src="previewUrl"
        :width="48"
      />
      <Upload :before-upload="beforeUpload" :show-upload-list="false">
        <Button>上传参考图（OSS 直传）</Button>
      </Upload>
    </div>
    <Form />
  </Drawer>
</template>

<style scoped lang="scss">
.upload-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
</style>
