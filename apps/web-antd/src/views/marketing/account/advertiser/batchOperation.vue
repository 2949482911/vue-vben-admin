<script setup lang="ts" name="CreateAdvertiserModal">
import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {ref,computed } from 'vue';
import {useVbenForm} from "#/adapter/form";
import type {AdvertiserItem} from "#/api/models";
import {advertiserApi, projectApi,accountLabelApi} from "#/api";

const emit = defineEmits(['pageReload']);

//父组件传过来的advertiserId
const selectedRows = ref<AdvertiserItem[]>([]);
const modalType = ref<string>('edit')
const title = ref<string>('')
  // 核心修改：用 computed 包裹 schema
const dynamicSchema = computed(() => [
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
      // 注意：api 里的 modalType 是在调用时才执行，本身就是响应式的，无需改
      api: async (params: any) => {
        return await (modalType.value === 'edit' ?
          projectApi.fetchProjectList(params) :
          accountLabelApi.fetchGetAccountLabelList(params)
        );
      }
    },
    // 每次 modalType 变化，这里会重新判断
    fieldName: modalType.value === 'edit' ? 'projectId' : 'tagId',
    label: modalType.value === 'edit' ? `${$t('marketing.advertiser.columns.projectId')}` : `${$t('marketing.advertiser.columns.tagName')}`,
  }
]);
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
    if(modalType.value === 'edit') {
      await (advertiserApi.fetchBatchOptions({
        targetIds: selectedRows.value.map(item => item.id),
        type: "update_advertiser_project",
        values:{
          projectId: formVal.projectId,
        }
      }))
    } else if(modalType.value === 'bind') {
      await (advertiserApi.fetchBatchOptions({
        targetIds: selectedRows.value.map(item => item.id),
        type: "update_advertiser_tag",
        values:{
          tag_id: formVal.tagId,
        }
      }))
    }

  },
  schema: dynamicSchema
});


const [Modal, modalApi] = useVbenModal({
  centered: true,
  fullscreenButton: false,
  closeOnPressEscape: false,
  contentClass:'modalStyle',
  async onOpenChange(isOpen: boolean) {    
    if (isOpen) {
      const data = modalApi.getData<AdvertiserItem[]>();
      selectedRows.value = data.selectedRows;
      modalType.value = data.modalType;
      title.value = modalType.value === "edit"? '批量操作修改项目':'批量绑定标签'
      console.log('modalType',modalType.value)
    }
  },
  async onCancel() {
    await formApi.resetForm();
    await modalApi.close();
    modalType.value = 'edit';
    title.value = '';
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
      <Modal class="w-[400px]" :title="title">
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
