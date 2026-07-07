<script setup lang="ts" name="CreateAttribute">
import { Page, useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { computed, ref } from "vue";

import type {
  CreateEventAttributeRequest,
  UpdateEventAttributeRequest
} from "#/api/models/attribution";
import { eventAttributeApi } from "#/api/core/attribution";
import { useVbenForm } from "#/adapter/form";
import { trimObject } from "#/utils/trim";
import {
  ATTRIBUTE_CATEGORY_OPTIONS,
  ATTRIBUTE_TYPE_OPTIONS
} from "#/views/attribution/properties/enums";

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
      | CreateEventAttributeRequest
      | UpdateEventAttributeRequest;

    await (isUpdate.value
      ? eventAttributeApi.fetchUpdateEventConfigRequest(
        //@ts-ignore
        params as UpdateEventAttributeRequest
      )
      : eventAttributeApi.fetchCreateEventAttributeRequest(params));
  },
  schema: [
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      fieldName: "id",
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      fieldName: "name",
      rules: "required",
      label: `${$t("attribution.properties.name")}`
    },
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      fieldName: "displayName",
      rules: "required",
      label: `${$t("attribution.properties.displayName")}`
    },
    {
      component: "Select",
      componentProps: {
        placeholder: `${$t("common.choice")}`,
        options: ATTRIBUTE_TYPE_OPTIONS
      },
      fieldName: "type",
      rules: "required",
      label: `${$t("attribution.properties.type")}`
    },
    {
      component: "Select",
      componentProps: {
        placeholder: `${$t("common.choice")}`,
        options: ATTRIBUTE_CATEGORY_OPTIONS
      },
      fieldName: "category",
      rules: "required",
      label: `${$t("attribution.properties.category")}`
    },
    {
      component: "Switch",
      fieldName: "isRequired",
      label: `${$t("attribution.properties.isRequired")}`,
      formItemClass: "w-[150px]"

    },
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      fieldName: "defaultValue",
      label: `${$t("attribution.properties.defaultValue")}`
    },
    {
      component: "Input",
      componentProps: {
        placeholder: `${$t("common.input")}`
      },
      fieldName: "validationRegex",
      label: `${$t("attribution.properties.validationRegex")}`
    },
    {
      component: "Switch",
      fieldName: "isSystem",
      label: `${$t("attribution.properties.isSystem")}`,
      formItemClass: "w-[150px]"
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
        drawerApi.getData<CreateEventAttributeRequest | UpdateEventAttributeRequest>();
      //@ts-ignore
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
