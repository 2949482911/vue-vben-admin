<script setup lang="ts" name="OppoAdgroupDrawer">
import { nextTick } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';

const { formFields } = defineProps({
  formFields: {
    type: Array,
    default: () => [],
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[30vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const adgroup = drawerApi.getData();
      formApi.setState({ schema: formFields });
      await nextTick();

      // adsDpaProductDTO 平铺
      const dpa = adgroup.adsDpaProductDTO || {};

      // marketingObjectiveDTO 平铺
      const mkt = adgroup.marketingObjectiveDTO || {};

      const flattenedData = {
        ...adgroup,

        // adsDpaProductDTO 平铺
        adsDpaProductDTO_dpaProductType: dpa.dpaProductType ?? 0,
        adsDpaProductDTO_dpaProductLibraryId: dpa.dpaProductLibraryId ?? 0,
        adsDpaProductDTO_dpaProductIdList: dpa.dpaProductIdList || [],

        // marketingObjectiveDTO 平铺
        marketingObjectiveDTO_dpaProductType: mkt.dpaProductType ?? 3,
        marketingObjectiveDTO_dpaProductLibraryId: mkt.dpaProductLibraryId || '',
        marketingObjectiveDTO_dpaProductIdList: mkt.dpaProductIdList || [],
      };

      await formApi.setValues(flattenedData);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    const adgroup = {
      ...currentValues,

      // adsDpaProductDTO 还原
      adsDpaProductDTO: {
        dpaProductType: currentValues.adsDpaProductDTO_dpaProductType ?? 0,
        dpaProductLibraryId: currentValues.adsDpaProductDTO_dpaProductLibraryId ?? 0,
        dpaProductIdList: currentValues.adsDpaProductDTO_dpaProductIdList || [],
      },

      // marketingObjectiveDTO 还原
      marketingObjectiveDTO: {
        dpaProductType: currentValues.marketingObjectiveDTO_dpaProductType ?? 3,
        dpaProductLibraryId: currentValues.marketingObjectiveDTO_dpaProductLibraryId || '',
        dpaProductIdList: currentValues.marketingObjectiveDTO_dpaProductIdList || [],
      },
    };

    drawerApi.setData(adgroup);
    await drawerApi.close();
  },
  onClosed() {
    formApi.resetForm();
    drawerApi.close();
  },
  onCancel() {
    formApi.resetForm();
    drawerApi.close();
  },
});
</script>

<template>
  <div>
    <Drawer title="广告组配置">
      <Form></Form>
    </Drawer>
  </div>
</template>
