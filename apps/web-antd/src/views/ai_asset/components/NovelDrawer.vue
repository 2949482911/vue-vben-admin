<script lang="ts" setup name="NovelDrawer">
/**
 * 资产 — 小说 新增/编辑（useVbenDrawer + useVbenForm）
 *
 * 编辑回显走 `novel/detail`（含正文 content）。
 */
import type { NovelItem } from '#/api/models/ai_asset';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Image, message, Upload } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { aiAssetApi } from '#/api';

import { useAssetUpload } from '../useAssetUpload';

const emit = defineEmits(['success']);
const { upload } = useAssetUpload();

const isUpdate = ref(false);
const previewUrl = ref('');

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    await aiAssetApi.saveNovel({
      content: values.content || undefined,
      coverUrl: values.coverUrl || undefined,
      id: values.id || undefined,
      name: values.name,
      synopsis: values.synopsis || undefined,
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
      componentProps: { placeholder: '如 逆袭人生' },
      fieldName: 'name',
      label: '小说名称',
      rules: 'required',
    },
    {
      component: 'Input',
      dependencies: { show: false, triggerFields: ['*'] },
      fieldName: 'coverUrl',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '一句话简介', rows: 2 },
      fieldName: 'synopsis',
      label: '简介',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '粘贴原著正文（用于生成剧本/分镜）', rows: 8 },
      fieldName: 'content',
      label: '原著正文',
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
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    formApi.resetForm();
    previewUrl.value = '';
    const row = (drawerApi.getData() as NovelItem) ?? {};
    if (row.id) {
      isUpdate.value = true;
      previewUrl.value = row.coverUrl ?? '';
      formApi.setValues(row as Record<string, any>);
      // 正文走详情接口回显
      const detail = await aiAssetApi.fetchNovelDetail(row.id);
      if (detail) {
        formApi.setValues(detail as Record<string, any>);
      }
    } else {
      isUpdate.value = false;
    }
  },
});

async function beforeUpload(file: File) {
  try {
    const url = await upload(file);
    previewUrl.value = url;
    await formApi.setFieldValue('coverUrl', url);
    message.success('封面已上传');
  } catch {
    message.error('上传失败');
  }
  return false;
}

const title = computed(() => (isUpdate.value ? '编辑小说' : '新增小说'));
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
        <Button>上传封面（OSS 直传）</Button>
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
