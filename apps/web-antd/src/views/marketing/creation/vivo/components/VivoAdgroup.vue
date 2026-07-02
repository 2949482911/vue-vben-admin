<script setup lang="ts" name="VivoAdgroup">
import { ref, watch } from 'vue';
import type {
  VivoAdgroupData,
  QualificationValue,
  ChannelPackageValue
} from '#/views/marketing/creation/vivo/vivo';
import type { AudienceConfigData, AccountInfo } from '#/views/marketing/creation/creation';
import { useVbenDrawer } from '@vben/common-ui';
import VivoAdgroupDrawer from './VivoAdgroupDrawer.vue';
import { Alert, Button, Card, Descriptions, DescriptionsItem, message } from "ant-design-vue";
import AudiencePackageModal
  from '#/views/marketing/creation/components/audience_package/AudiencePackageModal.vue';
import { useVbenModal } from '@vben/common-ui';
import AudiencePackageShow
  from '#/views/marketing/creation/components/audience_package/AudiencePackageShow.vue';
import { Platform } from '#/constants/enums';

/**
 * update:adgroup 更新广告组信息
 * update:adQualification 更新投放资质
 * update:channelPackage 更新渠道包
 * update:audiencePackage 更新定向包
 */
const emit = defineEmits([
  'update:adgroup',
  'update:adQualification',
  'update:channelPackage',
  'update:audiencePackage'
]);

/**
 * 广告组编辑抽屉
 */
const [AdgroupDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: VivoAdgroupDrawer,
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const { finalParams, localAdvertiserQualification, localChannelPackage } = drawerApi.getData();
      if (finalParams && finalParams._isConfirmed) {
        adgroupInfo.value = finalParams;
        emit('update:adgroup', adgroupInfo.value);
        if (localAdvertiserQualification && localAdvertiserQualification.size > 0) {
          emit('update:adQualification', localAdvertiserQualification);
        }
        if (localChannelPackage && localChannelPackage.size > 0) {
          emit('update:channelPackage', localChannelPackage);
        }
      }
    }
  }
});

/**
 * vivo广告组组件props
 * formFields 表单字段配置（从VivoBaseTemplate传入）
 * adgroupShowLabel 展示label配置（从VivoBaseTemplate传入）
 * adgroup 广告组数据
 * campaign 计划数据
 * accountInfo 账户信息
 * audience 定向包数据
 * advertiserQualification 投放资质
 * channelPackage 渠道包
 */
const {
  formFields,
  adgroupShowLabel,
  adgroup,
  campaign,
  accountInfo,
  audience,
  advertiserQualification,
  channelPackage
} = defineProps({
  formFields: {
    type: Array,
    default: () => []
  },
  adgroupShowLabel: {
    type: Object,
    default: () => {}
  },
  adgroup: {
    type: Object as () => VivoAdgroupData | null,
    default: () => null
  },
  campaign: {
    type: Object,
    default: () => {}
  },
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => []
  },
  audience: {
    type: Object as () => AudienceConfigData | null,
    default: () => {}
  },
  advertiserQualification: {
    type: Object,
    default: new Map<string, QualificationValue>()
  },
  channelPackage: {
    type: Object,
    default: new Map<string, ChannelPackageValue>()
  }
});

// adgroupInfo vivo广告组信息
const adgroupInfo = ref<VivoAdgroupData>({
  apkId: '',
  appPackageName: '',
  appletOriginId: '',
  appletPath: '',
  biddingStrategy: 0,
  builtInRpkDeepLink: '',
  campaignId: 0,
  channelId: '',
  chargeType: null,
  conversionFilterCycle: 0,
  cvType: 0,
  dailyBudget: -1,
  endDate: '',
  h5Code: '',
  h5Type: null,
  industry1: '',
  industry2: '',
  name: '',
  ocpxPrice: 0,
  price: 0,
  productUrlType: 0,
  retrieveType: 0,
  rpkDeepLink: '',
  ruleAudience: '',
  scheduleTime: '',
  secondCvType: null,
  secondOcpxPrice: 0,
  spentType: null,
  startDate: '',
  subpackageId: 0,
  webSiteUrl: '',
  wechatFollow: 0
});

const localAdvertiserQualification = ref<Map<string, QualificationValue>>(new Map());
const localChannelPackage = ref<Map<string, ChannelPackageValue>>(new Map());

// 监听父组件传入的 adgroup 数据变化，实现回显（复用策略组时）
watch(
  () => adgroup,
  (newAdgroup) => {
    if (newAdgroup) {
      adgroupInfo.value = { ...newAdgroup };
    }
  },
  { immediate: true, deep: true }
);

// 监听父组件传入的资质和渠道包数据变化
watch(
  () => [advertiserQualification, channelPackage],
  ([newQualification, newChannel]) => {
    if (newQualification) {
      localAdvertiserQualification.value = new Map(newQualification);
    }
    if (newChannel) {
      localChannelPackage.value = new Map(newChannel);
    }
  },
  { immediate: true, deep: true }
);

function openAdgroupDrawer() {
  if (!campaign.name) {
    message.warning("请先设置计划");
    return;
  }
  drawerApi.setData({
    adgroupData: adgroupInfo.value,
    localAdQualification: localAdvertiserQualification.value,
    localChannelPackage: localChannelPackage.value
  });
  drawerApi.open();
}

//----------选择定向包-----------
const [AudiencePackage, audiencePackageModalApi] = useVbenModal({
  connectedComponent: AudiencePackageModal
});

function openAudiencePackage() {
  if (!campaign.name) {
    return;
  }
  audiencePackageModalApi.setData(audience);
  audiencePackageModalApi.open();
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit('update:audiencePackage', audienceConfigData);
}
</script>

<template>
  <div class="vivo-adgroup-container">
    <div class="adgroup-cards-wrapper">
      <Card title="广告组" class="info-card">
        <div class="card-content">
          <Descriptions
            title="基本信息"
            v-if="adgroupInfo.name"
            :column="1"
            class="info-descriptions"
          >
            <DescriptionsItem
              v-for="(label, key) in adgroupShowLabel"
              :key="key"
              :label="label"
            >
              {{ adgroupInfo[key] }}
            </DescriptionsItem>
          </Descriptions>
          <Alert v-else type="error" message="请先填写广告组信息" class="empty-alert"></Alert>
        </div>
        <div class="card-footer">
          <Button primary @click="openAdgroupDrawer">
            {{ adgroupInfo.name ? '编辑广告组' : '添加广告组' }}
          </Button>
        </div>
      </Card>

      <Card title="定向包" class="info-card">
        <div class="card-content">
          <AudiencePackageShow :audience="audience" />
        </div>
        <div class="card-footer">
          <Button primary @click="openAudiencePackage">添加定向包</Button>
        </div>
      </Card>
    </div>

    <AdgroupDrawerModule :form-fields="formFields" />

    <AudiencePackage
      :account-info="accountInfo"
      :platform="Platform.VIVO"
      @update:orientation="updateAudiencePackage"
    />
  </div>
</template>

<style scoped lang="scss">
.vivo-adgroup-container {
  width: 100%;
  flex: 1; // 让容器高度自适应，匹配父容器的高度
  display: flex;
  flex-direction: column;
  min-height: 0; // 允许容器收缩，防止内容被挤压
}

.adgroup-cards-wrapper {
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
