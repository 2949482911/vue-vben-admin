<script lang="ts" setup name="CharacterDrawer">
/**
 * 资产 — 角色 新增/编辑（useVbenDrawer + useVbenForm）
 */
import type { CharacterItem } from '#/api/models/ai_asset';

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

function formatAnchor(anchor?: null | Record<string, any>): string {
  return Object.entries(anchor ?? {})
    .map(([k, v]) => `${k}:${v}`)
    .join(', ');
}

function parseAnchor(text?: string): Record<string, any> {
  const out: Record<string, any> = {};
  for (const pair of (text ?? '').split(',')) {
    const [k, v] = pair.split(':');
    if (k?.trim() && v?.trim()) {
      out[k.trim()] = v.trim();
    }
  }
  return out;
}

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    const anchor = parseAnchor(values.consistencyAnchor);
    await aiAssetApi.saveCharacter({
      avatarUrl: values.avatarUrl || undefined,
      consistencyAnchor: Object.keys(anchor).length > 0 ? anchor : undefined,
      id: values.id || undefined,
      name: values.name,
      prompt: values.prompt || undefined,
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
      componentProps: { placeholder: '如 小星（女主）' },
      fieldName: 'name',
      label: '角色名称',
      rules: 'required',
    },
    {
      component: 'Input',
      dependencies: { show: false, triggerFields: ['*'] },
      fieldName: 'avatarUrl',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '25 岁亚洲女性，齐肩黑发…', rows: 3 },
      fieldName: 'prompt',
      label: '提示词',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '发型:齐肩黑发, 服装:浅蓝衬衫', rows: 2 },
      fieldName: 'consistencyAnchor',
      label: '一致性锚（键:值，逗号分隔）',
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
    const row = (drawerApi.getData() as CharacterItem) ?? {};
    previewUrl.value = '';
    if (row.id) {
      isUpdate.value = true;
      previewUrl.value = row.avatarUrl ?? '';
      formApi.setValues({
        ...row,
        consistencyAnchor: formatAnchor(row.consistencyAnchor),
      } as Record<string, any>);
    } else {
      isUpdate.value = false;
    }
  },
});

async function beforeUpload(file: File) {
  try {
    const url = await upload(file);
    previewUrl.value = url;
    await formApi.setFieldValue('avatarUrl', url);
    message.success('头像已上传');
  } catch {
    message.error('上传失败');
  }
  return false;
}

const title = computed(() => (isUpdate.value ? '编辑角色' : '新增角色'));
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
        <Button>上传头像（OSS 直传）</Button>
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
