<script setup lang="ts" name="VivoAdgroupDrawer">
import { ref } from "vue";
import { useVbenDrawer } from "@vben/common-ui";
import { useVbenForm } from "#/adapter/form";

const { formFields } = defineProps({
  formFields: {
    type: Array,
    default: () => []
  }
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    // labelClass: 'w-[200px]',
    // formItemClass: 'w-[600px]',
    componentProps: {
      // class: "w-[600px]"
    }
  },
});

const localAdvertiserQualification = ref<Map<string, any>>(new Map());
const localChannelPackage = ref<Map<string, any>>(new Map());

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[30vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const data = drawerApi.getData();
      formApi.setState({
        schema: formFields
      });

      // 回显表单数据
      if (data && data.adgroupData) {
        // 排除 advertiseQualificationId（adgroupData 中为字符串，会覆盖资质 Map）
        const { advertiseQualificationId, ...restAdgroupData } = data.adgroupData;
        await formApi.setValues(restAdgroupData);
        localAdvertiserQualification.value = data.localAdQualification || new Map();
        localChannelPackage.value = data.localChannelPackage || new Map();

        // 资质数据始终使用父组件传入的 advertiserQualification Map 回显
        if (data.localAdQualification instanceof Map) {
          await formApi.setFieldValue('advertiseQualificationId', data.localAdQualification);
        }
      }
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    // 从表单字段读取资质 Map（VivoAdPlacementQualification 通过 v-model 写入）
    const formQualification = currentValues.advertiseQualificationId;
    if (formQualification instanceof Map && formQualification.size > 0) {
      localAdvertiserQualification.value = formQualification;
    }

    const adgroupData = {
      ...currentValues,
      _isConfirmed: true
    };

    drawerApi.setData({
      finalParams: adgroupData,
      localAdvertiserQualification: localAdvertiserQualification.value,
      localChannelPackage: localChannelPackage.value
    });
    await drawerApi.close();
  },
  onClosed() {
    formApi.resetForm();
    drawerApi.close();
  },
  onCancel() {
    formApi.resetForm();
    drawerApi.close();
  }
});

</script>

<template>
  <div>
    <Drawer title="编辑广告组信息">
      <Form></Form>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
.switch-item {
  width: auto !important;
  flex: none !important;
  :deep(.ant-form-item-control-input) {
    width: auto !important;
    max-width: 60px !important;
  }
}
</style>
