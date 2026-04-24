<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { message } from 'ant-design-vue';
import { loadingPageApi } from '#/api';
import { ref } from 'vue';
import type { LandingPageData } from '#/api/models';

const emit = defineEmits(['pageReload']);
const newOrEdit = ref<boolean>(true);
const landingPageItem = ref<LandingPageData>({} as LandingPageData);

const [Modal, modalApi] = useVbenModal({
  async onCancel() {
    landingPageItem.value = {} as LandingPageData;
    await formApi.resetForm();
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    const formValue = await formApi.getValues();

    const formattedData = {
      id: '',
      name: formValue.name,
      platform: formValue.platform,
      config: {
        pageUrl: formValue.pageUrl,
      },
    };
    try {
      if (landingPageItem.value.id && landingPageItem.value.id.trim() !== '') {
        formattedData.id = landingPageItem.value.id;
        await loadingPageApi.fetchUpdateLoadingPage(formattedData);
        message.success('编辑成功！');
      } else {
        await loadingPageApi.fetchCreateLoadingPage(formattedData);
        message.success('添加成功！');
      }
      landingPageItem.value = {} as LandingPageData;
      await formApi.resetForm();
      await modalApi.close();
      emit('pageReload');
    } catch (err) {
      console.log(err);
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      landingPageItem.value = modalApi.getData();
      if (landingPageItem.value.id) {
        newOrEdit.value = false;
        await formApi.setValues({
          id: landingPageItem.value.id,
          name: landingPageItem.value.name,
          platform: landingPageItem.value.platform,
          pageUrl: landingPageItem.value.config.pageUrl,
        });
      } else {
        newOrEdit.value = true;
        landingPageItem.value = {} as LandingPageData;
        await formApi.resetForm();
      }
    }
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '名称',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'vivo',
            value: 'vivo',
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'platform',
      label: '平台',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'pageUrl',
      label: '详情页地址',
      rules: 'required',
    },
  ],
});
</script>
<template>
  <Modal :title="newOrEdit ? '添加落地页' : '编辑落地页'">
    <Form />
  </Modal>
</template>
