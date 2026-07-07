<script setup lang="ts" name="CreateSdkConfig">
import { Page, useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { computed, ref } from "vue";

import type {
  AttributionConfigItem,
  CreateSdkAppRequest, EventConfigItem,
  UpdateSdkAppRequest
} from "#/api/models/attribution";
import {
  attributionConfigApi,
  eventConfigApi,
  sdkConfigApi,
} from "#/api/core/attribution";
import { useVbenForm } from "#/adapter/form";
import { trimObject } from "#/utils/trim";

import type { ProjectItem } from "#/api/models";
import type { TransferItem } from "ant-design-vue/es/transfer";
import { Transfer } from "ant-design-vue";

const emit = defineEmits(["pageReload"]);

const isUpdate = ref(false);
const projectOptions = ref<{ label: string; value: string }[]>([]);
const configOptions = ref<{ label: string; value: string }[]>([]);

/** Transfer 数据 */
const transferDataSource = ref<TransferItem[]>([]);
const transferTargetKeys = ref<string[]>([]);

/** 加载项目列表 */
async function loadProjects() {
  const res = await sdkConfigApi.fetchAvailableProjects();
  projectOptions.value = (res || []).map((item: ProjectItem) => ({
    label: `${item.name}(${item.id})`,
    value: String(item.id),
  }));
}

/** 加载归因配置列表 */
async function loadConfigs() {
  //@ts-ignore
  const { items } = await attributionConfigApi.fetchConfigList({
    page: 1, pageSize: 9999,
  });
  configOptions.value = (items || []).map((item: AttributionConfigItem) => ({
    label: item.name,
    value: String(item.id),
  }));
}

/** 加载事件列表供 Transfer 使用 */
async function loadEvents() {
  //@ts-ignore
  const {items} = await eventConfigApi.fetchGetEventConfigList({ page: 1, pageSize: 9999 });
  transferDataSource.value = (items || []).map((item: EventConfigItem) => ({
    key: String(item.id),
    title: item.eventDisplayName || item.eventName,
    description: `${item.eventType} | ${item.eventCategory}`,
  }));
}

function onTransferChange(_targetKeys: string[]) {
  transferTargetKeys.value = _targetKeys;
}

const title = computed(() =>
  isUpdate.value ? `${$t("common.edit")}` : `${$t("common.create")}`,
);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: "w-full",
    },
  },
  layout: "horizontal",
  handleSubmit: async (values) => {
    const formVal = values as Record<string, any>;
    // enabledEventIds: Transfer string keys → string array
    formVal.enabledEventIds = transferTargetKeys.value.filter(Boolean);
    const params = trimObject(formVal) as
      | CreateSdkAppRequest
      | UpdateSdkAppRequest;
    await (isUpdate.value
      ? sdkConfigApi.fetchUpdateSdkAppRequest(params as UpdateSdkAppRequest)
      : sdkConfigApi.fetchCreateSdkAppRequest(params));
  },
  schema: [
    {
      component: "Input",
      fieldName: "id",
      dependencies: {
        show: false,
        triggerFields: ["*"],
      },
    },
    {
      component: "Select",
      componentProps: {
        placeholder: `${$t("common.choice")}`,
        options: projectOptions,
      },
      fieldName: "projectId",
      rules: "required",
      label: `${$t("attribution.sdkConfig.projectId")}`,
    },
    {
      component: "Select",
      componentProps: {
        placeholder: `${$t("common.choice")}`,
        options: configOptions,
      },
      fieldName: "attributionConfigId",
      rules: "required",
      label: `${$t("attribution.sdkConfig.attributionConfigId")}`,
    },
  ],
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
      // 加载选项数据
      await Promise.all([loadProjects(), loadConfigs(), loadEvents()]);

      const data = drawerApi.getData<
        CreateSdkAppRequest | UpdateSdkAppRequest
      >();
      if (data?.id) {
        isUpdate.value = true;
        await formApi.setValues(data);
        // 回显 Transfer：enabledEventIds → string keys
        if (data.enabledEventIds?.length) {
          transferTargetKeys.value = data.enabledEventIds.map(String);
        }
      } else {
        isUpdate.value = false;
        transferTargetKeys.value = [];
        await formApi.resetForm();
      }
    } else {
      isUpdate.value = false;
    }
  },
});
</script>

<template>
  <Page>
    <Drawer :title="title" class="w-[700px]">
      <Form />
      <div class="mt-4">
        <div class="mb-2 text-sm font-medium">
          {{ $t("attribution.sdkConfig.enabledEventIds") }}
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
