<script lang="ts" setup name="MainBodyBatchOperation">
import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { computed, ref } from 'vue';

import { useVbenForm } from '#/adapter/form';
import type { MainBodyItem } from '#/api/models';
import { mainBodyApi, mainBodyComboApi, userApi } from '#/api';
import { BatchOptionsType } from '#/views/system/sysenums';

const emit = defineEmits(['pageReload']);

type TitleKey = 'sale' | 'combo';

const selectedRows = ref<MainBodyItem[]>([]);
const modalType = ref<TitleKey>('sale');
const sellName = ref('');
const comboName = ref('');

const title = computed(() =>
  modalType.value === 'combo'
    ? $t('system.mainbody.batch.setCombo')
    : $t('system.mainbody.batch.setSale'),
);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal) => {
    const targetIds = selectedRows.value
      .map((item) => item.id)
      .filter((id): id is string => !!id);

    let type = '';
    let values = {};
    if (modalType.value === 'combo') {
      type = BatchOptionsType.UpdateMainBodyCombo;
      values = {
        combo_id: formVal.comboId,
        combo_name: comboName.value,
      };
    } else {
      type = BatchOptionsType.UpdateMainBodySale;
      values = {
        sell_id: formVal.sellId,
        sell_name: sellName.value,
      };
    }

    await mainBodyApi.fetchBatchOptions({ targetIds, type, values });
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'modalType',
      label: '操作类型',
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      component: 'ApiSelect',
      componentProps: {
        showSearch: true,
        placeholder: `${$t('common.input')}`,
        filterOption: (inputValue: string, option: { label: string }) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase()),
        params: {
          page: 1,
          pageSize: 1000,
        },
        valueField: 'id',
        labelField: 'nickname',
        resultField: 'items',
        api: async (params: any) => {
          return await userApi.fetchUserList(params);
        },
        onSelect: (_value: any, option: any) => {
          sellName.value = option?.label ?? '';
        },
      },
      fieldName: 'sellId',
      label: `${$t('system.mainbody.sale')}`,
      rules: 'required',
      dependencies: {
        show: () => modalType.value === 'sale',
        triggerFields: ['modalType'],
      },
    },
    {
      component: 'ApiSelect',
      componentProps: {
        showSearch: true,
        placeholder: `${$t('common.input')}`,
        filterOption: (inputValue: string, option: { label: string }) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase()),
        params: {
          page: 1,
          pageSize: 1000,
        },
        valueField: 'id',
        labelField: 'name',
        resultField: 'items',
        api: async (params: any) => {
          return await mainBodyComboApi.fetchMainBodyComboList(params);
        },
        onSelect: (_value: any, option: any) => {
          comboName.value = option?.label ?? '';
        },
      },
      fieldName: 'comboId',
      label: `${$t('system.mainbody.combo.comboName')}`,
      rules: 'required',
      dependencies: {
        show: () => modalType.value === 'combo',
        triggerFields: ['modalType'],
      },
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  centered: true,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData() as
        | { selectedRows: MainBodyItem[]; modalType?: TitleKey }
        | undefined;
      selectedRows.value = data?.selectedRows ?? [];
      modalType.value = data?.modalType ?? 'sale';
      sellName.value = '';
      comboName.value = '';
    } else {
      await formApi.resetForm();
    }
  },
  async onCancel() {
    await formApi.resetForm();
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    emit('pageReload');
    await modalApi.close();
  },
});
</script>

<template>
  <Modal class="w-[400px]" :title="title">
    <Form :key="modalType" />
  </Modal>
</template>
