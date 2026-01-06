<script setup lang="ts" name="CreateAdvertiserModal">
import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {ref} from 'vue';
import {useVbenForm} from "#/adapter/form";
import type {AdvertiserItem} from "#/api/models";
import {advertiserApi, projectApi} from "#/api";

const emit = defineEmits(['pageReload']);

//父组件传过来的advertiserId
const selectedRows = ref<AdvertiserItem[]>([]);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal) => {
    await (advertiserApi.fetchBatchOptions({
        targetIds: selectedRows.value.map(item => item.id),
        type: "update_advertiser_project",
        values:{
          projectId: formVal.projectId,
        }
      }))
  },
  schema: [
    {
      component: "ApiSelect",
      componentProps: {
        showSearch: true,
        placeholder: `${$t('common.input')}`,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          size: 1000,
        },
        valueField: 'id',
        labelField: 'name',
        resultField: "items",
        api: async (params: any) => {
          return await projectApi.fetchProjectList(params);
        }
      },
      fieldName: 'projectId',
      label: `${$t('marketing.advertiser.columns.projectId')}`,
    }
  ],
});


const [Modal, modalApi] = useVbenModal({
  centered: true,
  fullscreenButton: false,
  closeOnPressEscape: false,
  contentClass:'modalStyle',
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData<AdvertiserItem[]>();
      selectedRows.value = data;
    }
  },
  async onCancel() {
    await formApi.resetForm();
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return
    }
    await formApi.submitForm();
    emit('pageReload');
    await modalApi.close();
  },
});



</script>

<template>
  <div>
    <Page>
      <Modal class="w-[400px]" title="批量操作修改项目">
        <Form/>
      </Modal>
    </Page>
  </div>
</template>

<style scoped lang="scss">
:global(.z-popup .modalStyle) {
  min-height: 50px !important;
}
</style>
