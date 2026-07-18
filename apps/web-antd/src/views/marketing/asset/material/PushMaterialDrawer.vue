<script lang="ts" setup>
import { $t } from "@vben/locales";
import { useVbenDrawer } from "@vben/common-ui";
import { useVbenForm } from "#/adapter/form";
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { advertiserApi, materialPushApi } from "#/api/core";
import { useUserStore } from "@vben/stores";
import type { AdvertiserItem } from "#/api/models/marketing";
import type { MaterialItem } from "#/api/models/assert";
import { Empty, message, Spin, Transfer } from "ant-design-vue";
import { computed, ref, watch } from "vue";

// ==================== i18n 前缀 ====================
const T = "page.marketing.asset.pushDrawer";

// ==================== Props ====================
const props = defineProps<{
  materials?: MaterialItem[];
}>();

// ==================== Transfer 数据项 ====================
interface TransferItem {
  key: string;
  title: string;
  description: string;
  platform: string;
  advertiserId: string;
}

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
    }
  ]
});

// ==================== 账户穿梭框 ====================
const targetKeys = ref<string[]>([]);
const accountDataSource = ref<TransferItem[]>([]);
const accountLoading = ref(false);
const currentPlatform = ref<string>("");

function onPlatformChange(platform: string) {
  if (platform && platform !== currentPlatform.value) {
    currentPlatform.value = platform;
    targetKeys.value = [];
    loadAdvertiserList(platform);
  } else if (!platform) {
    currentPlatform.value = "";
    targetKeys.value = [];
    accountDataSource.value = [];
  }
}

async function loadAdvertiserList(platform: string) {
  if (!platform) return;
  accountLoading.value = true;
  try {
    const res = await advertiserApi.fetchAdvertiserList({
      page: 1,
      pageSize: 1000,
      advertiserRole: "",
      platform
    });
    const items = res.items ?? [];
    accountDataSource.value = items.map((item: AdvertiserItem) => ({
      key: item.id,
      title: item.advertiserName || item.advertiserId || item.id,
      description: `${item.platform || ""}  ${item.companyName || ""}`,
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
  targetKeys.value = [];
  accountDataSource.value = [];
}

// ==================== 提交 ====================
const submitting = ref(false);

async function handleSubmit() {
  const values = await formApi.validate();
  if (!values) return;

  if (targetKeys.value.length === 0) {
    message.warning($t(`${T}.selectAccountWarning`));
    return;
  }
  submitting.value = true;
  const { taskName, platform } = await formApi.getValues();
  try {
    await materialPushApi.fetchMaterialPush({
      name: taskName,
      platform: platform,
      materialIds: (props.materials ?? []).map((m) => m.id),
      advertiserIds: targetKeys.value
    });
    message.success($t(`${T}.pushSuccess`));
    resetState();
    await drawerApi.close();
  } catch (e) {
    message.error($t(`${T}.pushError`));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <Drawer class="w-[55%]" :title="$t(`${T}.title`)">
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
              :render="(item: TransferItem) => item.title"
              :titles="[
                $t(`${T}.availableAccounts`),
                $t(`${T}.selectedAccounts`),
              ]"
              :list-style="{ width: '260px', height: '320px' }"
              :show-search="true"
              :filter-option="
                (inputValue: string, item: TransferItem) => {
                  const kw = inputValue.toLowerCase();
                  return (
                    item.title.toLowerCase().includes(kw) ||
                    item.description.toLowerCase().includes(kw)
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
