<script setup lang="ts" name="OppoPromotionDrawer">
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
      const promotion = drawerApi.getData();
      formApi.setState({ schema: formFields });
      await nextTick();

      // config 平铺
      const cfg = promotion.config || {};

      const flattenedData = {
        ...promotion,

        // config 平铺
        config_videoMaxCount: cfg.videoMaxCount ?? 0,
        config_imageMaxCount: cfg.imageMaxCount ?? 0,
        config_materialNormId: cfg.materialNormId ?? 0,
        config_placeType: cfg.placeType ?? 0,
        config_strongReminder: cfg.strongReminder ?? 0,
        config_virtualPositionId: cfg.virtualPositionId || '',
      };

      await formApi.setValues(flattenedData);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    const promotion = {
      ...currentValues,

      // config 还原
      config: {
        videoMaxCount: currentValues.config_videoMaxCount ?? 0,
        imageMaxCount: currentValues.config_imageMaxCount ?? 0,
        materialNormId: currentValues.config_materialNormId ?? 0,
        placeType: currentValues.config_placeType ?? 0,
        strongReminder: currentValues.config_strongReminder ?? 0,
        virtualPositionId: currentValues.config_virtualPositionId || '',
      },
    };

    drawerApi.setData(promotion);
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
    <Drawer title="广告配置">
      <Form></Form>
    </Drawer>
  </div>
</template>
