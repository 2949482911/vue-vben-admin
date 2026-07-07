<script setup lang="ts" name="CreateEvent">
import { Page, useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { computed, ref } from "vue";
import { useAccess } from "@vben/access";
import type {
  CreateEventConfigRequest,
  EventAttributeItem,
  UpdateEventConfigRequest
} from "#/api/models/attribution";
import { eventAttributeApi, eventConfigApi } from "#/api/core/attribution";
import { useVbenForm } from "#/adapter/form";
import { trimObject } from "#/utils/trim";

import { Transfer } from "ant-design-vue";
import type { TransferDirection, TransferItem } from "ant-design-vue/es/transfer";
import { EVENT_CATEGORY_OPTIONS, EVENT_TYPE_OPTIONS } from "./enums";

const { hasAccessByRoles } = useAccess();

const emit = defineEmits(["pageReload"]);

const isUpdate = ref(false);

const title = computed(() =>
  isUpdate.value ? `${$t("common.edit")}` : `${$t("common.create")}`
);

/** Transfer 数据 */
const transferDataSource = ref<TransferItem[]>([]);
const transferTargetKeys = ref<string[]>([]);

/** 加载全部属性列表供 Transfer 使用 */
async function loadAttributes() {
  const { items } = await eventAttributeApi.fetchAttributeList({
    category: "",
    displayName: "",
    name: "",
    type: "",
    page: 1, pageSize: 9999
  });
  transferDataSource.value = (items || []).map((item: EventAttributeItem) => ({
    key: item.id,
    title: item.displayName || item.name,
    description: `${item.type} | ${item.category}`
  }));
}

/** Transfer 变更时同步 target keys */
function onTransferChange(_targetKeys: string[], _direction: TransferDirection, _moveKeys: string[]) {
  transferTargetKeys.value = _targetKeys;
}


const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: "w-full"
    }
  },
  layout: "horizontal",
  handleSubmit: async (values) => {
    const formVal = values as Record<string, any>;
    // 合并 Transfer 的 targetKeys → attributeIds (number[])
    formVal.attributeIds = transferTargetKeys.value.map(String).filter(Boolean);
    const params = trimObject(formVal) as CreateEventConfigRequest | UpdateEventConfigRequest;
    await (isUpdate.value
      ? eventConfigApi.fetchUpdateEventConfigRequest(params as UpdateEventConfigRequest)
      : eventConfigApi.fetchCreateEventConfigRequest(params));
  },
  schema: [
    {
      component: "Input",
      fieldName: "id",
      dependencies: { show: false, triggerFields: ["*"] }
    },
    {
      component: "Input",
      componentProps: { placeholder: `${$t("common.input")}` },
      fieldName: "eventName",
      rules: "required",
      label: `${$t("attribution.eventConfig.eventName")}`
    },
    {
      component: "Input",
      componentProps: { placeholder: `${$t("common.input")}` },
      fieldName: "eventDisplayName",
      rules: "required",
      label: `${$t("attribution.eventConfig.eventDisplayName")}`
    },
    {
      component: "Select",
      componentProps: { placeholder: `${$t("common.choice")}`, options: EVENT_TYPE_OPTIONS },
      fieldName: "eventType",
      rules: "required",
      label: `${$t("attribution.eventConfig.eventType")}`
    },
    {
      component: "Select",
      componentProps: { placeholder: `${$t("common.choice")}`, options: EVENT_CATEGORY_OPTIONS },
      fieldName: "eventCategory",
      rules: "required",
      label: `${$t("attribution.eventConfig.eventCategory")}`
    },
    {
      component: "Input",
      componentProps: { placeholder: `${$t("common.input")}` },
      fieldName: "eventValueType",
      label: `${$t("attribution.eventConfig.eventValueType")}`,
      dependencies: {
        show: () => {
          return hasAccessByRoles(["1"]);
        },
        triggerFields: ["*"]
      }
    },
    {
      component: "Switch",
      fieldName: "eventValueRequired",
      label: `${$t("attribution.eventConfig.eventValueRequired")}`,
      formItemClass: "w-[150px]",
      dependencies: {
        show: () => {
          return hasAccessByRoles(["1"]);
        },
        triggerFields: ["*"]
      }
    },
    {
      component: "Switch",
      fieldName: "eventCountEnabled",
      label: `${$t("attribution.eventConfig.eventCountEnabled")}`,
      formItemClass: "w-[150px]"
    },
    {
      component: "Switch",
      fieldName: "isCallbackEvent",
      label: `${$t("attribution.eventConfig.isCallbackEvent")}`,
      formItemClass: "w-[150px]"

    },
    {
      component: "Input",
      componentProps: { placeholder: `${$t("common.input")}` },
      fieldName: "callbackEventType",
      label: `${$t("attribution.eventConfig.callbackEventType")}`
    },
    {
      component: "InputNumber",
      componentProps: { placeholder: `${$t("common.input")}`, min: 0 },
      fieldName: "callbackPriority",
      label: `${$t("attribution.eventConfig.callbackPriority")}`
    },
    {
      component: "Switch",
      fieldName: "isAttributionEvent",
      label: `${$t("attribution.eventConfig.isAttributionEvent")}`,
      formItemClass: "w-[150px]"

    },
    {
      component: "InputNumber",
      componentProps: { placeholder: `${$t("common.input")}`, min: 0 },
      fieldName: "attributionWindowOverride",
      label: `${$t("attribution.eventConfig.attributionWindowOverride")}`
    },
    {
      component: "Switch",
      fieldName: "isSystem",
      label: `${$t("attribution.eventConfig.isSystem")}`,
      formItemClass: "w-[150px]",
      dependencies: {
        show: () => {
          return hasAccessByRoles(["1"]);
        },
        triggerFields: ["*"]
      }

    },
    {
      component: "Textarea",
      componentProps: { placeholder: `${$t("common.input")}` },
      fieldName: "description",
      label: "description"
    }
  ]
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  async onCancel() {
    await formApi.resetForm();
    transferTargetKeys.value = [];
    isUpdate.value = false;
    await drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) return;

    await formApi.submitForm();
    transferTargetKeys.value = [];
    isUpdate.value = false;
    emit("pageReload");
    await formApi.resetForm();
    await drawerApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 加载属性列表
      await loadAttributes();

      const data = drawerApi.getData<UpdateEventConfigRequest>();
      if (data?.id) {
        isUpdate.value = true;
        // 回显表单
        await formApi.setValues(data);
        // 回显 Transfer：attributeIds → string keys
        if (data.attributeIds?.length) {
          transferTargetKeys.value = data.attributeIds.map(String);
        }
      } else {
        isUpdate.value = false;
        transferTargetKeys.value = [];
        await formApi.resetForm();
      }
    } else {
      isUpdate.value = false;
    }
  }
});
</script>

<template>
  <Page>
    <Drawer :title="title" class="w-[700px]">
      <Form />
      <div class="mt-4">
        <div class="mb-2 text-sm font-medium">
          {{ $t("attribution.eventConfig.attributeIds") }}
        </div>
        <Transfer
          v-model:target-keys="transferTargetKeys"
          :data-source="transferDataSource"
          :render="(item: TransferItem) => item.title || ''"
          :titles="['可选属性', '已选属性']"
          class="w-full"
          show-search
          @change="onTransferChange"
        />
      </div>
    </Drawer>
  </Page>
</template>
