<script lang="ts" setup>
import type { MaterialItem } from "#/api/models/assert";
import type { AdvertiserItem, AdvertiserPageRequest } from "#/api/models/marketing";

import { computed, ref, watch } from "vue";

import { useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { useUserStore } from "@vben/stores";

import { Empty, message, Spin, Transfer } from "ant-design-vue";
import type { TransferItem as AntdTransferItem } from "ant-design-vue/es/transfer";

import { useVbenForm } from "#/adapter/form";
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { advertiserApi, materialPushApi } from "#/api/core";
import { getPlatformLabel } from "#/constants/platform";

// ==================== Props ====================
const props = defineProps<{
  materials?: MaterialItem[];
}>();

// ==================== i18n 前缀 ====================
const T = "page.marketing.asset.pushDrawer";

// ==================== Transfer 数据项 ====================
interface TransferItem {
  key: string;
  title: string;
  description: string;
  platform: string;
  advertiserId: string;
}

// ==================== 推送目标 ====================
/** 推送目标默认值：推送到账户 */
const DEFAULT_PUSH_TARGET = "account";

/**
 * 各平台可选的推送目标：
 * 巨量支持推送到组织，腾讯支持推送到业务单元
 */
const PUSH_TARGET_OPTIONS: Record<string, { label: string; value: string }[]> = {
  bytedance: [
    { label: $t(`${T}.pushToOrganization`), value: "organization" },
    { label: $t(`${T}.pushToAccount`), value: DEFAULT_PUSH_TARGET }
  ],
  tencent: [
    { label: $t(`${T}.pushToAccount`), value: DEFAULT_PUSH_TARGET },
    { label: $t(`${T}.pushToUnit`), value: "unit" }
  ]
};

/** 推送目标对应的账户角色筛选：巨量组织取 bp_admin，腾讯业务单元取 unit，其余不限角色 */
const PUSH_TARGET_ROLE: Record<string, Record<string, string[]>> = {
  bytedance: { organization: ["bp_admin"] },
  tencent: { unit: ["unit"] }
};

// ==================== 用户信息 ====================
const userStore = useUserStore();

function generateDefaultTaskName(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
  const operator = userStore.userInfo?.nickname || userStore.userInfo?.authName || "unknown";
  return `${timestamp}-${operator}`;
}

// ==================== Drawer ====================
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  async onOpenChange(isOpen) {
    if (isOpen) {
      await formApi.setValues({
        taskName: generateDefaultTaskName(),
        platform: undefined
      });
      targetKeys.value = [];
      accountDataSource.value = [];
    } else {
      resetState();
    }
  },
  async onConfirm() {
    await handleSubmit();
  },
  onCancel() {
    resetState();
    drawerApi.close();
  }
});

// ==================== 素材表格 ====================
const gridData = computed(() =>
  (props.materials ?? []).map((m, idx) => ({
    index: idx + 1,
    id: m.id,
    name: m.name,
    type: m.type,
    fileUrl: m.fileUrl
  }))
);

const gridOptions: VxeGridProps = {
  columns: [
    { type: "seq", title: $t(`${T}.seq`), width: 60 },
    { field: "name", title: $t(`${T}.materialName`), minWidth: 180 },
    { field: "id", title: $t(`${T}.materialId`), minWidth: 120 }
  ],
  pagerConfig: { enabled: false },
  data: []
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

watch(
  gridData,
  (data) => {
    gridApi.setGridOptions({ data });
  },
  { immediate: true }
);

// ==================== 表单 ====================
const [Form, formApi] = useVbenForm({
  layout: "vertical",
  showDefaultActions: false,
  commonConfig: {
    componentProps: { class: "w-full" }
  },
  schema: [
    {
      component: "Input",
      fieldName: "taskName",
      label: $t(`${T}.taskName`),
      rules: "required"
    },
    {
      component: "Select",
      fieldName: "platform",
      label: $t(`${T}.targetPlatform`),
      rules: "required",
      componentProps: {
        placeholder: $t(`${T}.selectPlatformPlaceholder`),
        options: [
          { label: $t(`${T}.tencent`), value: "tencent" },
          { label: $t(`${T}.bytedance`), value: "bytedance" },
          { label: $t(`${T}.oppo`), value: "oppo" },
          { label: $t(`${T}.vivo`), value: "vivo" },
          { label: $t(`${T}.huawei_store`), value: "huawei_store" },
        ],
        onChange: onPlatformChange
      }
    },
    // 巨量支持选择推送到组织或账户，腾讯支持选择推送到账户或业务单元
    {
      component: "RadioGroup",
      fieldName: "pushTargetType",
      label: $t(`${T}.pushTargetType`),
      defaultValue: DEFAULT_PUSH_TARGET,
      componentProps: {
        onChange: onPushTargetTypeChange
      },
      dependencies: {
        triggerFields: ["platform"],
        if: (values: Record<string, any>) =>
          Object.keys(PUSH_TARGET_OPTIONS).includes(values.platform),
        // 选项随平台变化，交给 dependencies 动态下发而不是写死一份
        componentProps: (values: Record<string, any>) => ({
          options: PUSH_TARGET_OPTIONS[values.platform] ?? []
        })
      }
    }
  ]
});

// ==================== 账户穿梭框 ====================
const targetKeys = ref<string[]>([]);
const accountDataSource = ref<TransferItem[]>([]);
const accountLoading = ref(false);
const currentPlatform = ref<string>("");

async function onPlatformChange(platform: string) {
  if (platform === currentPlatform.value) {
    return;
  }
  currentPlatform.value = platform || "";
  targetKeys.value = [];
  if (!platform) {
    accountDataSource.value = [];
    return;
  }
  // 换平台后推送目标的可选项会变（组织只属于巨量、业务单元只属于腾讯），先回到默认值再查账户
  await formApi.setFieldValue("pushTargetType", DEFAULT_PUSH_TARGET);
  await loadAdvertiserList(platform);
}

async function onPushTargetTypeChange() {
  if (!currentPlatform.value) return;
  targetKeys.value = [];
  await loadAdvertiserList(currentPlatform.value);
}

async function loadAdvertiserList(platform: string) {
  if (!platform) return;
  accountLoading.value = true;
  try {
    const values = await formApi.getValues();
    // 推送到组织（巨量）/ 业务单元（腾讯）时按账户角色筛选，否则只取投放中的账户
    const roleFilter = PUSH_TARGET_ROLE[platform]?.[values.pushTargetType] ?? [];
    const params: AdvertiserPageRequest = {
      page: 1,
      pageSize: 1000,
      platform,
      advertiserRole: roleFilter
    };
    if (roleFilter.length === 0) {
      params.putStatue = 1;
    }
    const res = await advertiserApi.fetchAdvertiserList(params);
    const items = res.items ?? [];
    // @ts-ignore
    accountDataSource.value = items.map((item: AdvertiserItem) => ({
      key: item.id,
      title: item.advertiserName || item.advertiserId || item.id,
      // 平台展示中文名（原样显示的是英文值）
      description: `${getPlatformLabel(item.platform, "")}  ${item.companyName || ""}`,
      platform: item.platform || "",
      advertiserId: item.advertiserId || ""
    }));
  } catch {
    message.error($t(`${T}.loadAccountError`));
    accountDataSource.value = [];
  } finally {
    accountLoading.value = false;
  }
}

function handleTransferChange(nextTargetKeys: string[]) {
  targetKeys.value = nextTargetKeys;
}

function resetState() {
  formApi.resetForm();
  targetKeys.value = [];
  currentPlatform.value = '';
  accountDataSource.value = [];
}

// ==================== 提交 ====================
const submitting = ref(false);

async function handleSubmit() {
  const values = await formApi.validate();
  if (!values) return;

  if (targetKeys.value.length === 0) {
    await message.warning($t(`${T}.selectAccountWarning`));
    return;
  }
  submitting.value = true;
  const { taskName, platform } = await formApi.getValues();
  try {
    await materialPushApi.fetchMaterialPush({
      name: taskName,
      platform,
      // @ts-ignore
      materialIds: (props.materials ?? []).map((m) => m.id),
      advertiserIds: targetKeys.value
    });
    await message.success($t(`${T}.pushSuccess`));
    resetState();
    await drawerApi.close();
  } catch (e) {
    await  message.error($t(`${T}.pushError`));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <Drawer class="w-[75%]" :title="$t(`${T}.title`)">
    <div class="push-drawer-content">
      <Form />

      <!-- 已选素材表格 -->
      <div class="section">
        <div class="section-title">
          {{ $t(`${T}.selectedMaterials`, { count: gridData.length }) }}
        </div>
        <div v-if="gridData.length === 0" class="empty-box">
          <Empty
            :description="$t(`${T}.noMaterialSelected`)"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
          />
        </div>
        <div v-else class="grid-wrapper">
          <Grid />
        </div>
      </div>

      <!-- 账户穿梭框 -->
      <div class="section transfer-section">
        <div class="section-title">
          {{ $t(`${T}.selectTargetAccount`, { count: targetKeys.length }) }}
        </div>
        <div v-if="!currentPlatform" class="empty-box">
          <Empty
            :description="$t(`${T}.selectPlatformFirst`)"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
          />
        </div>
        <div
          v-else-if="accountDataSource.length === 0 && !accountLoading"
          class="empty-box"
        >
          <Empty
            :description="$t(`${T}.noAccountAvailable`)"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
          />
        </div>
        <div v-else class="transfer-wrapper">
          <Spin :spinning="accountLoading" :tip="$t(`${T}.loadingAccounts`)">
            <Transfer
              :data-source="accountDataSource"
              :target-keys="targetKeys"
              :render="(item: AntdTransferItem) => item.title || ''"
              :titles="[
                $t(`${T}.availableAccounts`),
                $t(`${T}.selectedAccounts`),
              ]"
              :list-style="{ width: '260px', height: '320px' }"
              :show-search="true"
              :filter-option="
                (inputValue: string, item: AntdTransferItem) => {
                  const kw = inputValue.toLowerCase();
                  return (
                    (item.title || '').toLowerCase().includes(kw) ||
                    (item.description || '').toLowerCase().includes(kw)
                  );
                }
              "
              @change="handleTransferChange"
            />
          </Spin>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.push-drawer-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  .section-title {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}

.empty-box {
  padding: 10px 0;
}

.grid-wrapper {
  max-height: 200px;
  overflow-y: auto;
}

.transfer-section {
  flex: 1;
  min-height: 0;
}

.transfer-wrapper {
  display: flex;
  justify-content: center;
}
</style>
