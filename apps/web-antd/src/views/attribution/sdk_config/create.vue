<script setup lang="ts" name="CreateSdkConfig">
import { Page, useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { computed, ref } from "vue";

import type {
  AttributionConfigItem,
  CreateSdkAppRequest,
  EventConfigItem,
  UpdateSdkAppRequest,
  UpdateTrackingLinkRequest
} from "#/api/models/attribution";
import { attributionConfigApi, eventConfigApi, sdkConfigApi } from "#/api/core/attribution";
import { useVbenForm } from "#/adapter/form";
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { trimObject } from "#/utils/trim";

import type { ProjectItem } from "#/api/models";
import type { TransferItem } from "ant-design-vue/es/transfer";
import { Button, Input, Transfer, Select } from "ant-design-vue";
import { PLATFORM } from "#/constants/locales";

const emit = defineEmits(["pageReload"]);

const isUpdate = ref(false);
const projectOptions = ref<{ label: string; value: string }[]>([]);
const configOptions = ref<{ label: string; value: string }[]>([]);

/** Transfer 数据 */
const transferDataSource = ref<TransferItem[]>([]);
const transferTargetKeys = ref<string[]>([]);

/** 监测链接 */
const trackingLinks = ref<UpdateTrackingLinkRequest[]>([]);

/** 加载项目列表 */
async function loadProjects() {
  const res = await sdkConfigApi.fetchAvailableProjects();
  projectOptions.value = (res || []).map((item: ProjectItem) => ({
    label: `${item.name}(${item.id})`,
    value: String(item.id)
  }));
}

/** 加载归因配置列表 */
async function loadConfigs() {
  const res = await attributionConfigApi.fetchConfigList({
    page: 1,
    pageSize: 9999
  });
  const items = (res as any)?.items || res || [];
  configOptions.value = items.map((item: AttributionConfigItem) => ({
    label: item.name,
    value: String(item.id)
  }));
}

/** 加载事件列表供 Transfer 使用 */
async function loadEvents() {
  const res = await eventConfigApi.fetchGetEventConfigList({
    page: 1,
    pageSize: 9999
  });
  const items = (res as any)?.items || res || [];
  transferDataSource.value = items.map((item: EventConfigItem) => ({
    key: String(item.id),
    title: item.eventDisplayName || item.eventName,
    description: `${item.eventType} | ${item.eventCategory}`
  }));
}

function onTransferChange(_targetKeys: string[]) {
  transferTargetKeys.value = _targetKeys;
}

/** 新增监测链接行 */
function addTrackingLink() {
  trackingLinks.value.push({
    name: "",
    channel: "base_channel",
    platform: "vivo",
    extraParams: "",
    callbackUrl: "",
    remark: "",
    id: "",
    sdkAppConfigId: ""
  });
  trackingGridApi.setGridOptions({ data: [...trackingLinks.value] });
}

/** 删除监测链接行 */
function removeTrackingLink(index: number) {
  trackingLinks.value.splice(index, 1);
  trackingGridApi.setGridOptions({ data: [...trackingLinks.value] });
}

/** 更新监测链接字段 */
function updateTrackingField(index: number, field: string, value: string) {
  //@ts-ignore
  trackingLinks.value[index] = { ...trackingLinks.value[index], [field]: value };
  // 刷新 Grid 显示
  trackingGridApi.setGridOptions({ data: [...trackingLinks.value] });
}

const trackingGridOptions: VxeGridProps<UpdateTrackingLinkRequest> = {
  border: true,
  height: "auto",
  rowConfig: { keyField: "id" },
  pagerConfig: { enabled: false },
  columns: [
    { type: "seq", width: 46 },
    {
      field: "name",
      width: "auto",
      title: `${$t("attribution.sdkConfig.trackingName")}`,
      slots: { default: "name" }
    },
    {
      field: "channel",
      title: `${$t("attribution.sdkConfig.trackingChannel")}`,
      width: "auto",
      slots: { default: "channel" }
    },
    {
      field: "platform",
      title: `${$t("attribution.sdkConfig.trackingPlatform")}`,
      width: "auto",
      slots: { default: "platform" }
    },
    {
      field: "callbackUrl",
      title: `${$t("attribution.sdkConfig.trackingCallbackUrl")}`,
      width: "auto",
      slots: { default: "callbackUrl" }
    },
    {
      field: "extraParams",
      title: `${$t("attribution.sdkConfig.trackingExtraParams")}`,
      width: "auto",
      slots: { default: "extraParams" }
    },
    {
      field: "remark",
      title: `${$t("attribution.sdkConfig.trackingRemark")}`,
      width: "auto",
      slots: { default: "remark" }
    },
    {
      title: `${$t("common.options")}`,
      width: 80,
      slots: { default: "action" }
    }
  ]
};

const [Grid, trackingGridApi] = useVbenVxeGrid({
  gridOptions: trackingGridOptions
});

const title = computed(() =>
  isUpdate.value ? `${$t("common.edit")}` : `${$t("common.create")}`
);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: { componentProps: { class: "w-full" } },
  layout: "horizontal",
  handleSubmit: async (values) => {
    const formVal = values as Record<string, any>;
    formVal.enabledEventIds = transferTargetKeys.value.filter(Boolean);
    formVal.trackingLinks = trackingLinks.value;

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
      dependencies: { show: false, triggerFields: ["*"] }
    },
    {
      component: "Select",
      componentProps: {
        placeholder: `${$t("common.choice")}`,
        options: projectOptions
      },
      fieldName: "projectId",
      rules: "required",
      label: `${$t("attribution.sdkConfig.projectId")}`
    },
    {
      component: "Select",
      componentProps: {
        placeholder: `${$t("common.choice")}`,
        options: configOptions
      },
      fieldName: "attributionConfigId",
      rules: "required",
      label: `${$t("attribution.sdkConfig.attributionConfigId")}`
    }
  ]
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  async onCancel() {
    await formApi.resetForm();
    transferTargetKeys.value = [];
    trackingLinks.value = [];
    trackingGridApi.setGridOptions({ data: [] });
    isUpdate.value = false;
    await drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) return;

    await formApi.submitForm();
    transferTargetKeys.value = [];
    trackingLinks.value = [];
    trackingGridApi.setGridOptions({ data: [] });
    isUpdate.value = false;
    emit("pageReload");
    await formApi.resetForm();
    await drawerApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      await Promise.all([loadProjects(), loadConfigs(), loadEvents()]);

      const data = drawerApi.getData<
        CreateSdkAppRequest | UpdateSdkAppRequest | any
      >();
      if (data?.id) {
        isUpdate.value = true;
        await formApi.setValues(data);
        if (data.enabledEventIds?.length) {
          transferTargetKeys.value = data.enabledEventIds.map(String);
        }
        // 回显已有的监测链接
        trackingLinks.value = (data.trackingLinkItems || []).map(
          (item: any) => ({
            id: item.id,
            name: item.name || "",
            channel: item.channel || "",
            platform: (item as any).platform || "",
            extraParams: (item as any).extraParams || "",
            callbackUrl: (item as any).callbackUrl || "",
            remark: (item as any).remark || ""
          })
        );
        trackingGridApi.setGridOptions({ data: [...trackingLinks.value] });
      } else {
        isUpdate.value = false;
        transferTargetKeys.value = [];
        trackingLinks.value = [];
        trackingGridApi.setGridOptions({ data: [] });
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
    <Drawer :title="title" class="w-[900px]">
      <Form />
      <div class="mt-4">
        <div class="mb-2 text-sm font-medium">
          {{ $t("attribution.sdkConfig.enabledEventIds") }}
        </div>
        <Transfer
          v-model:target-keys="transferTargetKeys"
          :data-source="transferDataSource"
          :render="(item: TransferItem) => item.title || ''"
          :titles="[$t('attribution.sdkConfig.available'), $t('attribution.sdkConfig.selected')]"
          class="w-full"
          show-search
          @change="onTransferChange"
        />
      </div>

      <!-- 监测链接 -->
      <div class="mt-6">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium">
            {{ $t("attribution.sdkConfig.trackingLinks") }}
          </span>
          <Button type="primary" size="small" @click="addTrackingLink">
            {{ $t("common.create") }}
          </Button>
        </div>
        <Grid>
          <template #name="{ row, rowIndex }">
            <Input
              :value="row.name"
              size="small"
              @change="(e: any) => updateTrackingField(rowIndex, 'name', e.target.value)"
            />
          </template>
          <template #channel="{ row, rowIndex }">
            <Input
              :value="row.channel"
              size="small"
              @change="(e: any) => updateTrackingField(rowIndex, 'channel', e.target.value)"
            />
          </template>
          <template #platform="{ row, rowIndex }">
            <Select
              :value="row.platform"
              :options="PLATFORM"
              size="small"
              @change="(e: any) => updateTrackingField(rowIndex, 'platform', e.target.value)"
            />
          </template>
          <template #callbackUrl="{ row, rowIndex }">
            <Input
              :value="row.callbackUrl"
              size="small"
              @change="(e: any) => updateTrackingField(rowIndex, 'callbackUrl', e.target.value)"
            />
          </template>
          <template #extraParams="{ row, rowIndex }">
            <Input
              :value="row.extraParams"
              size="small"
              @change="(e: any) => updateTrackingField(rowIndex, 'extraParams', e.target.value)"
            />
          </template>
          <template #remark="{ row, rowIndex }">
            <Input
              :value="row.remark"
              size="small"
              @change="(e: any) => updateTrackingField(rowIndex, 'remark', e.target.value)"
            />
          </template>
          <template #action="{ rowIndex }">
            <Button
              type="link"
              danger
              size="small"
              @click="removeTrackingLink(rowIndex)"
            >
              {{ $t("common.delete") }}
            </Button>
          </template>
        </Grid>
      </div>
    </Drawer>
  </Page>
</template>
