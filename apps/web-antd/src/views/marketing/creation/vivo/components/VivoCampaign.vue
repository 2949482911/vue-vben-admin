<script setup lang="ts" name="VivoCampaign">
import { ref, watch } from "vue";
import type { VivoCampaignData } from "#/views/marketing/creation/vivo/vivo";
import { useVbenDrawer } from "@vben/common-ui";
import VivoCampaignDrawer from "./VivoCampaignDrawer.vue";
import { Alert, Button, Card, Descriptions, DescriptionsItem, message } from "ant-design-vue";
import type { AccountInfo } from "#/views/marketing/creation/creation";

/**
 * update:campaign 更新计划信息
 */
const emit = defineEmits(["update:campaign", "adTypeChanged"]);

/**
 * 计划编辑抽屉
 */
const [CampaignDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: VivoCampaignDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const campaignData = drawerApi.getData();
      if (campaignData && campaignData._isConfirmed) {
        campaignInfo.value = campaignData;
        emit("update:campaign", campaignInfo.value);
        if (campaignData._adTypeChanged) {
          emit("adTypeChanged");
        }
      }
    }
  }
});

/**
 * campaign 计划数据
 * accountInfo 账户信息
 * hasAccount 是否有账户
 * hasProduct 是否有产品
 */
/**
 * vivo计划组件props
 * formFields 表单字段配置（从VivoBaseTemplate传入）
 * campaignShowLabel 展示label配置（从VivoBaseTemplate传入）
 * campaign 计划数据
 * accountInfo 账户信息
 * hasAccount 是否有账户
 * hasProduct 是否有产品
 */
const { formFields, campaignShowLabel, campaign, accountInfo, hasAccount, hasProduct } = defineProps({
  formFields: {
    type: Array,
    default: () => []
  },
  campaignShowLabel: {
    type: Object,
    default: () => {}
  },
  campaign: {
    type: Object as () => VivoCampaignData | null,
    default: () => {}
  },
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => []
  },
  hasAccount: {
    type: Boolean,
    default: false
  },
  hasProduct: {
    type: Boolean,
    default: false
  }
});

// campaignInfo vivo计划信息 - 必须在 watch 之前定义
const campaignInfo = ref<VivoCampaignData>({
  name: "",
  adType: 0,
  mediaType: 0,
  dailyBudget: 200,
  campaignType: 0,
  pushForm: 0,
  pushType: 0,
  promotionType: 0,
  conversionMonitorType: 0
});

// 监听父组件传入的 campaign 数据变化，实现回显（复用策略组时）
watch(
  () => campaign,
  (newCampaign) => {
    if (newCampaign) {
      campaignInfo.value = { ...newCampaign };
    }
  },
  { immediate: true, deep: true }
);

function openCampaignDrawer() {
  if (!hasProduct) {
    message.warning("请先选择产品");
    return;
  }
  if (!hasAccount) {
    message.warning("请先选择账户");
    return;
  }
  drawerApi.setData(campaignInfo.value);
  drawerApi.open();
}
</script>

<template>
  <div class="vivo-campaign-container">
    <Card title="计划" class="info-card">
      <div class="card-content">
        <Descriptions
          title="基本信息"
          v-if="campaignInfo.name"
          :column="1"
          class="info-descriptions"
        >
          <DescriptionsItem v-for="(label, key) in campaignShowLabel" :key="key" :label="label">
            {{ campaignInfo[key] }}
          </DescriptionsItem>
        </Descriptions>
        <Alert v-else type="error" message="请先填写计划信息" class="empty-alert"></Alert>
      </div>
      <div class="card-footer">
        <Button primary @click="openCampaignDrawer">
          {{ campaignInfo.name ? "编辑计划" : "添加计划" }}
        </Button>
      </div>
    </Card>
    <CampaignDrawerModule :form-fields="formFields" />
  </div>
</template>

<style scoped lang="scss">
.vivo-campaign-container {
  width: 100%;
  flex: 1; // 让容器高度自适应，匹配父容器的高度
  display: flex;
  flex-direction: column;
  min-height: 0; // 允许容器收缩，防止内容被挤压
}

.info-card {
  width: 100%;
  flex: 1; // Card自适应容器高度
  min-height: 300px; // 最小高度
  display: flex;
  flex-direction: column;

  // Card 样式优化
  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }

  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px; // Card 标题固定高度
    flex-shrink: 0; // 标题不参与flex布局，固定高度
  }

  .ant-card-body {
    padding: 16px;
    flex: 1; // Card内容区域自适应剩余高度
    display: flex;
    flex-direction: column;
    min-height: 0; // 允许收缩
    overflow: hidden; // 防止内容溢出Card
  }
}

.card-content {
  flex: 1; // 内容区域自适应剩余高度（减去button）
  overflow-y: auto; // 内容区域在Card内部滚动
  min-height: 100px; // 最小高度，确保有滚动空间
  max-height: calc(100% - 60px); // 最大高度 = Card内容高度 - button高度(约60px)

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
}

.card-footer {
  flex-shrink: 0; // 按钮区域固定，不参与flex布局
  display: flex;
  justify-content: center; // 居中对齐
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 16px; // 与内容区域的间距
}

.info-descriptions {
  .ant-descriptions-item-label {
    font-weight: 500;
  }
}

.empty-alert {
  margin: 8px 0;
}
</style>
