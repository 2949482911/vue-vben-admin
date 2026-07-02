<script setup lang="ts" name="VivoPromotion">
import { ref, watch } from "vue";
import type {
  QualificationValue,
  VivoCampaignData,
  VivoPromotionData
} from "#/views/marketing/creation/vivo/vivo";
import { useVbenDrawer } from "@vben/common-ui";
import VivoPromotionDrawer from "./VivoPromotionDrawer.vue";
import { Alert, Button, Card, Descriptions, DescriptionsItem, message } from "ant-design-vue";
import type { AccountInfo, PageViewConfigData } from "#/views/marketing/creation/creation";
import PageViewShow from "#/views/marketing/creation/components/pageview/PageViewShow.vue";
import PageViewDrawer from "#/views/marketing/creation/components/pageview/PageViewDrawer.vue";
import { Platform } from "#/constants/enums";


const [PageViewDrawerModel, pageViewDrawerApi] = useVbenDrawer({
  connectedComponent: PageViewDrawer
});


function openLandingPage() {
  pageViewDrawerApi.open()
}

/**
 * update:promotion 更新广告信息
 */
const emit = defineEmits(["update:promotion", "update:pageView"]);


/**
 * update page view
 * @param landingPage
 */
function updatePageView(landingPage: PageViewConfigData) {
  emit('update:pageView', landingPage)
}

/**
 * 广告编辑抽屉
 */
const [PromotionDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: VivoPromotionDrawer,
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const promotionData = drawerApi.getData();
      if (promotionData && promotionData._isConfirmed) {
        promotionInfo.value = promotionData as VivoPromotionData;
        emit("update:promotion", promotionInfo.value);
      }
    }
  }
});

/**
 * vivo广告组件props
 * formFields 表单字段配置（从VivoBaseTemplate传入）
 * promotionShowLabel 展示label配置（从VivoBaseTemplate传入）
 * promotion 广告数据
 * accountInfo 账户信息
 * hasAccount 是否有账户
 * hasProduct 是否有产品
 */
const {
  formFields,
  promotionShowLabel,
  campaign,
  promotion,
  accountInfo,
  hasAccount,
  hasProduct,
  landingPage
} = defineProps({
  formFields: {
    type: Array,
    default: () => []
  },
  promotionShowLabel: {
    type: Object,
    default: () => {
    }
  },
  campaign: {
    type: Object as () => VivoCampaignData | null,
    default: () => null
  },
  promotion: {
    type: Object as () => VivoPromotionData | null,
    default: () => {
    }
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
  },
  landingPage: {
    type: Object as () => PageViewConfigData,
    default: () => {
    }
  }
});


// promotionInfo vivo广告信息 - 必须在 watch 之前定义
const promotionInfo = ref<VivoPromotionData>({
  groupId: "",
  name: "",
  deepLink: "",
  videoAttribution: 0,
  pageUrl: "",
  h5Code: "",
  h5Type: 0,
  generalSwitch: 0,
  config: {
    videoMaxCount: 0,
    imageMaxCount: 0,
    materialNormId: 0,
    placeType: 0,
    strongReminder: 0,
    virtualPositionId: ""
  }
});

// 监听父组件传入的 promotion 数据变化，实现回显（复用策略组时）
watch(
  () => promotion,
  (newPromotion) => {
    if (newPromotion) {
      promotionInfo.value = { ...newPromotion };
    }
  },
  { immediate: true, deep: true }
);

function openPromotionDrawer() {
  if (!hasProduct) {
    message.warning("请先选择产品");
    return;
  }
  if (!hasAccount) {
    message.warning("请先选择账户");
    return;
  }
  drawerApi.setData(promotionInfo.value);
  drawerApi.open();
}
</script>

<template>
  <div class="vivo-promotion-container">
    <div class="promotion-cards-wrapper">
      <Card title="广告" class="info-card">
        <div class="card-content">
          <Descriptions
            title="基本信息"
            v-if="promotionInfo.name"
            :column="1"
            class="info-descriptions"
          >
            <DescriptionsItem v-for="(label, key) in promotionShowLabel" :key="key" :label="label">
              {{ promotionInfo[key] }}
            </DescriptionsItem>
          </Descriptions>
          <Alert v-else type="error" message="请先填写广告信息" class="empty-alert"></Alert>
        </div>
        <div class="card-footer">
          <Button primary @click="openPromotionDrawer">
            {{ promotionInfo.name ? "编辑广告" : "添加广告" }}
          </Button>
        </div>
      </Card>

      <Card title="落地页" class="info-card">
        <div class="card-content">
          <PageViewShow :landing-page="landingPage"
                        :account-info="accountInfo"
          ></PageViewShow>
        </div>

        <div class="card-footer">
          <Button primary @click="openLandingPage">
            {{ landingPage.data.size > 0 ? '编辑落地页' : '添加落地页' }}
          </Button>
        </div>
      </Card>
    </div>

    <PromotionDrawerModule :form-fields="formFields" :campaign="campaign" :account-info="accountInfo" />
    <PageViewDrawerModel :platform="Platform.VIVO" :account-info="accountInfo" @update:pageView="updatePageView"/>
  </div>
</template>

<style scoped lang="scss">
.vivo-promotion-container {
  width: 100%;
  flex: 1; // 让容器高度自适应，匹配父容器的高度
  display: flex;
  flex-direction: column;
  min-height: 0; // 允许容器收缩，防止内容被挤压
}

.promotion-cards-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0; // 允许wrapper收缩
}

.info-card {
  width: 100%;
  flex: 1; // Card自适应容器高度，让多个Card高度一致
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
