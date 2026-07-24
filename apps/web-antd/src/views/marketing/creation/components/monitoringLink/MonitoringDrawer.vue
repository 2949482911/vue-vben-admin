<script setup lang="ts" name="MonitoringDrawer">
// 监测链接选择抽屉 - 供后续全媒体批投公用
import { useVbenDrawer } from "@vben/common-ui";
import { ref, computed, nextTick } from "vue";
import type {
  AccountInfo,
  MonitoringLinkConfigData,
  MonitoringLinkType
} from "#/views/marketing/creation/creation";
import { RuleMethod } from "#/views/marketing/creation/creation_enums";
import {
  RadioGroup,
  RadioButton,
  type RadioChangeEvent,
  message,
  Tabs,
  TabPane,
  Space,
  Divider
} from "ant-design-vue";
import MonitoringManualInput from "./MonitoringManualInput.vue";
import MonitoringOcpx from "./MonitoringOcpx.vue";

const props = defineProps<{
  accountInfo: AccountInfo[];
  monitoringLink: MonitoringLinkConfigData;
}>();

// 编辑监测链接
const emit = defineEmits(["update:monitoringLink"]);

// 当前选中账户 ID
const currentAccountId = ref<string>("");
// 分配方式
const distributionMethod = ref<RuleMethod>(RuleMethod.ALL);
// 链接类型：manual=手动输入, ocpx=OCPX任务
const linkModeType = ref<RuleMethod.MANUAL | RuleMethod.OCPX>(RuleMethod.MANUAL);

// 本地监测链接数据（全账户复用）
const localMonitoringLink = ref<MonitoringLinkConfigData>({
  config: { method: RuleMethod.ALL },
  linkType: RuleMethod.MANUAL,
  data: new Map<string, MonitoringLinkType[]>()
});

// 账户监测链接映射（按账户分配模式）
const accountMonitoringLinks = ref<Map<string, MonitoringLinkType[]>>(new Map());

// 当前账户的临时 OCPX 选中值
const currentOcpxValue = ref<{ monitorLink: string; ocpxTaskId?: string }>({
  monitorLink: "",
  ocpxTaskId: ""
});

// 当前编辑的链接对象（用于 v-model 双向绑定）
const currentEditingLink = ref<MonitoringLinkType>({
  allocateType: distributionMethod.value === RuleMethod.ACCOUNT ? "ACCOUNT" : "ALL",
  clickLink: "",
  exposureLink: "",
  linkModeType: "",
  monitorLink: "",
  ocpxTaskId: ""
});

// 计算当前操作的链接对象（仅用于读取）
const currentLink = computed((): MonitoringLinkType => {
  if (distributionMethod.value === RuleMethod.ACCOUNT) {
    const links = accountMonitoringLinks.value.get(currentAccountId.value) || [];
    return links.length > 0 ? links[0] : currentEditingLink.value;
  }
  const links = localMonitoringLink.value.data.get("0") || [];
  return links.length > 0 ? links[0] : currentEditingLink.value;
});

// 同步当前链接到编辑对象
function syncToEditingLink() {
  const link = currentLink.value;
  if (link) {
    currentEditingLink.value = { ...link };
  } else {
    // 如果没有链接数据，初始化一个空对象
    currentEditingLink.value = {
      allocateType: distributionMethod.value === RuleMethod.ACCOUNT ? "ACCOUNT" : "ALL",
      clickLink: "",
      exposureLink: "",
      linkModeType: linkModeType.value,
      monitorLink: "",
      ocpxTaskId: ""
    };
  }
}

// 从编辑对象同步回数据源
function syncFromEditingLink() {
  const newValue = { ...currentEditingLink.value };
  if (distributionMethod.value === RuleMethod.ACCOUNT) {
    const links = accountMonitoringLinks.value.get(currentAccountId.value);
    if (links && links.length > 0) {
      Object.assign(links[0], newValue);
    }
  } else {
    const links = localMonitoringLink.value.data.get("0");
    if (links && links.length > 0) {
      Object.assign(links[0], newValue);
    }
  }
}

// 手动输入更新处理
function handleManualInputUpdate(val: MonitoringLinkType) {
  currentEditingLink.value = { ...val };
  syncFromEditingLink();
}

// OCPX 更新处理
function handleOcpxUpdate(val: { monitorLink: string; ocpxTaskId?: string }) {
  currentOcpxValue.value = { ...val };
  const link = currentLink.value;
  if (link) {
    link.monitorLink = val.monitorLink || '';
    if (val.ocpxTaskId) {
      link.ocpxTaskId = val.ocpxTaskId;
    }
  }
}

// 初始化默认监测链接
function initDefaultLinks() {
  if (distributionMethod.value === RuleMethod.ACCOUNT) {
    props.accountInfo.forEach(account => {
      const accountId = String(account.localAdvertiserId);
      if (!accountMonitoringLinks.value.has(accountId)) {
        accountMonitoringLinks.value.set(accountId, [{
          clickLink: "",
          exposureLink: "",
          monitorLink: "",
          linkModeType: "manual",
          allocateType: "ACCOUNT",
          ocpxTaskId: ""
        }]);
      }
    });
    if (props.accountInfo.length > 0 && !currentAccountId.value) {
      currentAccountId.value = String(props?.accountInfo[0]?.localAdvertiserId);
    }
  } else {
    // 即使 key "0" 存在，如果数组为空也要重新初始化（父级传入空Map时会出现 key 存在但数组为空的情况）
    const existing = localMonitoringLink.value.data.get("0");
    if (!existing || existing.length === 0) {
      localMonitoringLink.value.data.set("0", [{
        clickLink: "",
        exposureLink: "",
        monitorLink: "",
        linkModeType: RuleMethod.MANUAL,
        allocateType: "ALL",
        ocpxTaskId: ""
      }]);
    }
  }
}

// 获取当前账户名称
function getAccountName(account: AccountInfo): string {
  return `${account.advertiserName}(${account.localAdvertiserId})`;
}

// 账户点击/切换
async function handleAccountClick(accountId: string) {
  currentAccountId.value = accountId;
  // 切换账户时，同步该账户的链接到编辑对象
  // 使用 nextTick 确保 currentAccountId 更新后再同步数据
  await nextTick();
  syncToEditingLink();
}

// 分配方式切换时，同步到编辑对象
function allocationMethodChange(e: RadioChangeEvent) {
  const newMethod = e.target.value as RuleMethod;
  distributionMethod.value = newMethod;
  accountMonitoringLinks.value.clear();
  localMonitoringLink.value.data.clear();
  currentOcpxValue.value = { monitorLink: "", ocpxTaskId: "" };
  currentAccountId.value = "";

  initDefaultLinks();

  // 同步链接类型
  const link = currentLink.value;
  if (link) {
    link.linkModeType = linkModeType.value;
  }

  // 同步到编辑对象
  syncToEditingLink();
}

// 链接类型切换
function linkTypeChange() {
  const link = currentLink.value;
  if (link) {
    link.linkModeType = linkModeType.value;
  }
  // 切换时清空 OCPX 选中
  if (linkModeType.value === RuleMethod.MANUAL) {
    currentOcpxValue.value = { monitorLink: "", ocpxTaskId: "" };
  }
}

// 抽屉
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  size: "large",
  class: "w-[75vw]",
  closeOnPressEscape: true,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData();

      // 先恢复传入的数据
      if (data?.config?.method) {
        distributionMethod.value = data.config.method;
      } else {
        distributionMethod.value = RuleMethod.ALL;
      }

      // 恢复链接类型
      if (data?.linkType) {
        linkModeType.value = data.linkType;
      } else {
        linkModeType.value = RuleMethod.MANUAL;
      }

      accountMonitoringLinks.value.clear();
      localMonitoringLink.value.data.clear();
      currentOcpxValue.value = { monitorLink: "", ocpxTaskId: "" };

      // 恢复数据
      if (data?.data instanceof Map) {
        if (distributionMethod.value === RuleMethod.ACCOUNT) {
          data.data.forEach((items: MonitoringLinkType[], accountId: string) => {
            // 深拷贝数据，避免引用问题
            const copiedItems = items.map(item => ({ ...item }));
            accountMonitoringLinks.value.set(accountId, copiedItems);
          });
          if (props.accountInfo.length > 0) {
            currentAccountId.value = String(props.accountInfo[0]?.localAdvertiserId);
          }

          // 恢复 OCPX 选中值（如果有的话）
          const firstAccountLinks = accountMonitoringLinks.value.get(currentAccountId.value);
          if (firstAccountLinks && firstAccountLinks.length > 0) {
            const link: MonitoringLinkType = firstAccountLinks[0];
            if (link.monitorLink) {
              currentOcpxValue.value = {
                monitorLink: link.monitorLink,
                ocpxTaskId: link.ocpxTaskId
              };
            }
          }
        } else {
          const links = data.data.get("0") || [];
          // 深拷贝数据，避免引用问题
          const copiedLinks = links.map(item => ({ ...item }));
          localMonitoringLink.value.data.set("0", copiedLinks);

          // 恢复 OCPX 选中值（如果有的话）
          if (copiedLinks.length > 0) {
            const link = copiedLinks[0];
            if (link.monitorLink) {
              currentOcpxValue.value = {
                monitorLink: link.monitorLink,
                ocpxTaskId: link.ocpxTaskId
              };
            }
          }
        }
      } else {
        // 没有传入数据，初始化默认
        initDefaultLinks();
      }

      // 数据恢复后，如果数据源为空则初始化默认值（第一次打开时父级传入空Map会走到这里）
      const hasAnyData = distributionMethod.value === RuleMethod.ACCOUNT
        ? accountMonitoringLinks.value.size > 0
        : (localMonitoringLink.value.data.get("0") || []).length > 0;

      if (!hasAnyData) {
        initDefaultLinks();
      }

      // 数据恢复后，同步到编辑对象
      syncToEditingLink();
    }
  },
  async onConfirm() {
    const link = currentLink.value;
    // 校验
    if (linkModeType.value === RuleMethod.MANUAL) {
      if (!link?.clickLink && !link?.exposureLink) {
        return message.warning("请至少填写点击链接或曝光链接");
      }
    } else {
      if (!link?.monitorLink && !link.clickLink) {
        return message.warning("请选择 OCPX 任务");
      }
    }

    // 按账户分配模式：校验每个账户都有监测链接
    if (distributionMethod.value === RuleMethod.ACCOUNT) {
      const unselected = props.accountInfo.filter(
        acc => {
          const links = accountMonitoringLinks.value.get(String(acc.localAdvertiserId));
          if (!links || links.length === 0) return true;
          const l: MonitoringLinkType = links[0];
          if (linkModeType.value === RuleMethod.MANUAL) {
            return !l.clickLink && !l.exposureLink;
          }
          return !l.monitorLink;
        }
      );
      if (unselected.length > 0) {
        return message.warning(`请为账户 [${unselected.map(a => a.advertiserName).join("、")}] 配置监测链接`);
      }
    }

    // 构建返回数据
    const resultData = new Map<string, MonitoringLinkType[]>();
    if (distributionMethod.value === RuleMethod.ACCOUNT) {
      accountMonitoringLinks.value.forEach((items, key) => {
        resultData.set(key, items);
      });
    } else {
      resultData.set("0", localMonitoringLink.value.data.get("0") || []);
    }

    emit("update:monitoringLink", {
      config: { method: distributionMethod.value },
      linkType: linkModeType.value,
      data: resultData
    });
    await drawerApi.close();
  },
  onCancel() {
    // 重置所有本地数据，避免下次打开时残留上次的输入
    currentEditingLink.value = {
      allocateType: distributionMethod.value === RuleMethod.ACCOUNT ? "ACCOUNT" : "ALL",
      clickLink: "",
      exposureLink: "",
      linkModeType: "",
      monitorLink: "",
      ocpxTaskId: ""
    };
    currentOcpxValue.value = { monitorLink: "", ocpxTaskId: "" };
    localMonitoringLink.value.data.clear();
    accountMonitoringLinks.value.clear();
    linkModeType.value = RuleMethod.MANUAL;
    distributionMethod.value = RuleMethod.ALL;
    drawerApi.close();
  }
});
</script>

<template>
  <Drawer title="监测链接组">
    <Space direction="vertical" class="w-full" size="middle">
      <!-- 链接类型选择 -->
      <div class="section">
        <span class="section-label">监测链接模式</span>
        <RadioGroup v-model:value="linkModeType" @change="linkTypeChange">
          <RadioButton :value="RuleMethod.MANUAL">手动输入</RadioButton>
          <RadioButton :value="RuleMethod.OCPX">推广活动</RadioButton>
        </RadioGroup>
      </div>

      <!-- 分配方式 -->
      <div class="section">
        <span class="section-label">分配方式</span>
        <RadioGroup v-model:value="distributionMethod" @change="allocationMethodChange">
          <RadioButton :value="RuleMethod.ALL">全账户复用</RadioButton>
          <RadioButton :value="RuleMethod.ACCOUNT">按账户分配</RadioButton>
        </RadioGroup>
      </div>

      <Divider />

      <!-- 按账户分配模式：Tabs 展示各账户 -->
      <Tabs v-if="distributionMethod === RuleMethod.ACCOUNT" v-model:activeKey="currentAccountId"
            @change="handleAccountClick">
        <TabPane v-for="account in accountInfo" :key="String(account.localAdvertiserId)"
                 :tab="getAccountName(account)">
          <!-- 手动输入 -->
          <MonitoringManualInput
            v-if="linkModeType === RuleMethod.MANUAL"
            :key="currentAccountId"
            :model-value="currentEditingLink"
            @update:model-value="handleManualInputUpdate"
          />
          <!-- OCPX 任务列表选择 -->
          <MonitoringOcpx
            v-if="linkModeType === RuleMethod.OCPX"
            :key="currentAccountId"
            :model-value="currentOcpxValue"
            @update:model-value="handleOcpxUpdate"
          />
        </TabPane>
      </Tabs>

      <!-- 全账户复用模式：直接展示 -->
      <div v-else>
        <!-- 手动输入 -->
        <MonitoringManualInput
          v-if="linkModeType === RuleMethod.MANUAL"
          :model-value="currentEditingLink"
          @update:model-value="handleManualInputUpdate"
        />
        <!-- OCPX 任务列表选择 -->
        <MonitoringOcpx
          v-if="linkModeType === RuleMethod.OCPX"
          :model-value="currentOcpxValue"
          @update:model-value="handleOcpxUpdate"
        />
      </div>
    </Space>
  </Drawer>
</template>

<style scoped lang="scss">
.section {
  display: flex;
  align-items: center;
  gap: 12px;

  .section-label {
    font-weight: 500;
    flex-shrink: 0;
  }
}
</style>
