<script lang="ts" setup name="CreateNotice">
import type { CreateNoticeRequest } from '#/api/models';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useVbenForm } from '#/adapter/form';
import { noticeApi } from '#/api';

const emit = defineEmits(['pageReload']);

const isUpdate = ref(false);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: async (formVal) => {
    const params = formVal as CreateNoticeRequest;
    await (isUpdate.value
      ? noticeApi.fetchUpdateNotice(params)
      : noticeApi.fetchCreateNotice(params));
    await drawerApi.close();
  },
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 60,
        placeholder: $t('system.notice.create.titleLabel'),
        showCount: true,
      },
      fieldName: 'title',
      label: $t('system.notice.columns.title'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: [
          { label: $t('system.notice.level.info'), value: 'info' },
          { label: $t('system.notice.level.warm'), value: 'warm' },
          { label: $t('system.notice.level.error'), value: 'error' },
        ],
      },
      defaultValue: 'info',
      fieldName: 'level',
      label: $t('system.notice.columns.level'),
      rules: 'selectRequired',
    },
    {
      component: 'RichEditor',
      componentProps: {
        minHeight: 320,
      },
      fieldName: 'content',
      label: $t('system.notice.columns.content'),
      rules: 'required',
    },
  ],
});

const title = computed(() =>
  isUpdate.value
    ? $t('system.notice.create.editTitle')
    : $t('system.notice.create.createTitle'),
);

/**
 * 重置为默认值；编辑态再回填数据
 * 先 reset 再 setValues，避免上一次打开的标题/正文残留
 */
async function resetForm(notice: Record<string, any> = {}) {
  await formApi.reset();
  if (notice.id) {
    await formApi.setValues(notice);
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  class: 'w-[60%]',
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    emit('pageReload');
  },
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    const notice = (drawerApi.getData() ?? {}) as Record<string, any>;
    isUpdate.value = Boolean(notice.id);
    resetForm(notice);
  },
  // 关闭动画结束后再清空，避免关抽屉过程中表单内容闪动
  async onClosed() {
    isUpdate.value = false;
    await resetForm();
  },
});
</script>
<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
