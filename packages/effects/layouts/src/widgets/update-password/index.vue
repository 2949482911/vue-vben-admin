<script lang="ts" setup>
import {useVbenForm} from '@vben-core/form-ui';
import {useVbenModal} from '@vben-core/popup-ui';
import { $t } from '@vben/locales';
defineOptions({
  name: 'UpdatePasswordModal',
});
const emit = defineEmits<{ logout: [], updatePassword }>();


const [Form, formApi] = useVbenForm({
  handleSubmit: async (values: Record<string, any>) => {
    emit('update-password', values);
  },
  schema: [
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'oldPassword',
      label: `${$t('common.oldPassword')}`,
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'newPassword',
      label: `${$t('common.newPassword')}`,
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'confirmPassword',
      label: `${$t('common.confirmPassword')}`,
    },
  ],
  showDefaultActions: false,
});

function onSubmit(values: Record<string, any>) {
  console.log(values)
}

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
    await formApi.resetForm()
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values } = modalApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }
    }
  },
});
</script>
<template>
  <Modal>
    <Form />
  </Modal>
</template>
