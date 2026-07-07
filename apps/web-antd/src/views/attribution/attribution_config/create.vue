<script setup lang="ts" name="CreateAttributionConfig">
import { Page, useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { computed, ref } from "vue";

import type {
  CreateAttributionConfigRequest,
  UpdateAttributionConfigRequest
} from "#/api/models/attribution";
import { attributionConfigApi } from "#/api/core/attribution";
import { useVbenForm } from "#/adapter/form";
import { trimObject } from "#/utils/trim";
import { ATTRIBUTION_MODEL_OPTIONS } from "./enums";

const emit = defineEmits(["pageReload"]);

const isUpdate = ref(false);

const title = computed(() =>
  isUpdate.value ? `${$t("common.edit")}` : `${$t("common.create")}`
);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: "w-full"
    }
  },
  layout: "horizontal",
  handleSubmit: async (values) => {
    const params = trimObject(values as Record<string, any>) as
      | CreateAttributionConfigRequest
      | UpdateAttributionConfigRequest;

    await (isUpdate.value
      ? attributionConfigApi.fetchUpdateAttributionConfigRequest(
        params as UpdateAttributionConfigRequest
      )
      : attributionConfigApi.fetchCreateAttributionConfigRequest(params));
  },
  schema: [
    {
      component: "Input",
      fieldName: "id",
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },
    {
      component: "Input",
      componentProps: { placeholder: `${$t("common.input")}` },
      fieldName: "name",
      rules: "required",
      label: `${$t("attribution.attributionConfig.name")}`
    },
    {
      component: "Select",
      componentProps: {
        placeholder: `${$t("common.choice")}`,
        options: ATTRIBUTION_MODEL_OPTIONS
      },
      fieldName: "attributionModel",
      rules: "required",
      label: `${$t("attribution.attributionConfig.attributionModel")}`
    },
    {
      component: "InputNumber",
      componentProps: { placeholder: `${$t("common.input")}`, min: 0 },
      fieldName: "clickLookbackWindow",
      label: `${$t("attribution.attributionConfig.clickLookbackWindow")}`,
      defaultValue: 30
    },
    {
      component: "InputNumber",
      componentProps: { placeholder: `${$t("common.input")}`, min: 0 },
      fieldName: "exposureLookbackWindow",
      label: `${$t("attribution.attributionConfig.exposureLookbackWindow")}`,
      defaultValue: 30
    },
    {
      component: "InputNumber",
      componentProps: { placeholder: `${$t("common.input")}`, min: 0 },
      fieldName: "ipLookbackWindow",
      label: `${$t("attribution.attributionConfig.ipLookbackWindow")}`,
      defaultValue: 30
    },
    {
      component: "Textarea",
      componentProps: { placeholder: `${$t("common.input")}`, rows: 4 },
      fieldName: "idMatchPriority",
      label: `${$t("attribution.attributionConfig.idMatchPriority")}`
    },
    {
      component: "InputNumber",
      componentProps: { placeholder: `${$t("common.input")}`, min: 0 },
      fieldName: "callbackWindow",
      label: `${$t("attribution.attributionConfig.callbackWindow")}`,
      defaultValue: 30
    },
    {
      component: "Switch",
      fieldName: "isDefault",
      label: `${$t("attribution.attributionConfig.isDefault")}`,
      formItemClass: "w-[150px]"
    },
    {
      component: "Textarea",
      componentProps: { placeholder: `${$t("common.input")}`, rows: 3 },
      fieldName: "description",
      label: `${$t("attribution.attributionConfig.description")}`
    }
  ]
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  async onCancel() {
    await formApi.resetForm();
    isUpdate.value = false;
    await drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) return;

    await formApi.submitForm();
    isUpdate.value = false;
    emit("pageReload");
    await formApi.resetForm();
    await drawerApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data =
        drawerApi.getData<
          CreateAttributionConfigRequest | UpdateAttributionConfigRequest
        >();
      if (data?.id) {
        isUpdate.value = true;
        formApi.setValues(data);
      } else {
        isUpdate.value = false;
        formApi.resetForm();
      }
    } else {
      isUpdate.value = false;
    }
  }
});
</script>

<template>
  <Page>
    <Drawer :title="title">
      <Form />
    </Drawer>
  </Page>
</template>
