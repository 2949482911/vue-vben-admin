<script lang="ts" setup name="CreateProcess">
import {ref} from 'vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import type {CreateRoleRequest} from "#/api/models";
// import ProcessDesign from "#/views/bpm/process/compents/processDesign.vue";
import ProcessDesign from "./logicflow/processDesign.vue";

const emit = defineEmits(['pageReload']);

const notice = ref<CreateRoleRequest>({});
const isUpdate = ref<Boolean>(false);


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
    isUpdate.value = false;
  },
  async onConfirm() {
    await formApi.submitForm();
    isUpdate.value = false;
    emit("pageReload");
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      notice.value = modalApi.getData<Record<string, any>>();
      if (notice.value.id) {
        isUpdate.value = true;
        handleSetFormValue(notice.value);
      } else {
        isUpdate.value = false;
      }
    }
  },
});


function handleSetFormValue(row) {
  formApi.setValues(row);
}


const title: string = notice.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <ProcessDesign/>
  </Modal>
</template>
