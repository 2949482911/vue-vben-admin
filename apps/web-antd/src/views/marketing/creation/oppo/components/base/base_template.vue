<script setup lang="ts" name="OppoBaseTemplate">
import type {
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData,
} from '#/views/marketing/creation/creation';
import type {
  OppoAdgroupData,
  OppoCampaignData,
  OppoCreation,
  OppoPromotionData,
} from '#/views/marketing/creation/oppo/Oppo.types';

import { markRaw } from "vue";

import { oppo_advertisementApi } from "#/api";
import { Platform } from '#/constants/enums';
import AudiencePackageSelector
  from '#/views/marketing/creation/components/audience_package/AudiencePackageSelector.vue';
import CreativeGroupSelector from '#/views/marketing/creation/components/creative/CreativeGroupSelector.vue';
import PageViewSelector from '#/views/marketing/creation/components/pageview/PageViewSelector.vue';
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";
import TitleSelector from '#/views/marketing/creation/components/title/TitleSelector.vue';
import OppoAdgroup from '#/views/marketing/creation/oppo/components/OppoAdgroup.vue';
import OppoCampaign from '#/views/marketing/creation/oppo/components/OppoCampaign.vue';
import OppoPromotion from '#/views/marketing/creation/oppo/components/OppoPromotion.vue';
import {
  ADTYPE_SELECT,
  BILLINGTYPE_SELECT,
  DAY_LIMIT_SELECT,
  // EXTENSION_SELECT,
  DAYLIMIT_SELECT,
  // FLOW_SELECT,
  // FLOWSCENE_SELECT,
  DEEP_CV_SELECT,
  DELIVERMODE_SELECT,
  fieldLabelMap,
  GLOBAL_SPECID_SELECT,
  OPPO_FREE_ORDER_SELECT,
  OPPO_QUICK_APP_SELECT,
  OPTIMIZE_SWITCH_SELECT,
  OPTIMIZE_TYPE_SELECT,
  PAGE_TYPE_SELECT,
  PRODUCT_AD_TYPE_SELECT,
  QUICK_APP_TYPE_SELECT,
  SMART_EXPAND_SELECT, TIME_LIMIT_SELECT
} from "#/views/marketing/creation/oppo/projectEnum";

const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => OppoCreation,
    default: () => ({}),
  },
});

const emit = defineEmits([
  'update:campaign',
  'update:adgroup',
  'update:promotion',
  'update:audiencePackage',
  'update:updateMaterial',
  'update:titlePackage',
  'update:landingPage',
]);

function updateCampaign(campaign: OppoCampaignData) {
  emit('update:campaign', campaign);
}

function updateAdgroup(adgroup: OppoAdgroupData) {
  emit('update:adgroup', adgroup);
}

function updatePromotion(promotion: OppoPromotionData) {
  emit('update:promotion', promotion);
}

function updateMaterial(materialData: MaterialData) {
  emit('update:updateMaterial', materialData);
}

function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit('update:titlePackage', titlePackage);
}

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit('update:audiencePackage', audienceConfigData);
}

function updateLandingPage(landingPage: PageViewConfigData) {
  emit('update:landingPage', landingPage);
}

// ======================== 计划表单字段 ========================
const campaignFormFields = [
  {
    component: 'AdNameGen',
    fieldName: 'planName',
    label: '计划名称',
    rules: 'required',
  },
  {
    component: 'ApiSelect',
    fieldName: 'extensionType',
    componentProps: {
      options: [],
      allowClear: true,
      api: async () => {
        return await oppo_advertisementApi.fetchOppoConfigList({
          type: 'EXTENSION_TYPE',
          advertiserId: creationInfo.accountInfo.map(x => x.localAdvertiserId),
        })
      },
      valueField: 'value',
      labelField: 'name',
    },
    label: '推广目标',
    rules: 'required',
  },
  {
    component: 'Select',
    fieldName: 'dayLimit',
    componentProps: { options: DAYLIMIT_SELECT },
    label: '是否限制日预算',
    defaultValue: 0,
  },
  {
    component: 'Input',
    fieldName: 'dayBudget',
    label: '日预算',
    defaultValue: 0,
    rules: "required",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue.dayLimit === 1
      },
      triggerFields: ["dayLimit"]
    }
  },
  {
    component: 'Select',
    fieldName: 'deliveryMode',
    componentProps: { options: DELIVERMODE_SELECT },
    label: '竞价策略',
    defaultValue: 0,
    rules: 'required',
  },
];

// 计划展示标签
const campaignShowLabel: Record<string, string> = {
  planName: '计划名称',
  extensionType: '推广目标',
  dayLimit: '日预算限制',
  dayBudget: '日预算',
  deliveryMode: '竞价策略',
};

// ======================== 广告组表单字段 ========================
const adgroupFormFields = [
  {
    component: 'AdNameGen',
    fieldName: 'adGroupName',
    label: '广告组名称',
    rules: 'required',
  },

  {
    component: 'ApiSelect',
    fieldName: 'extensionFlow',
    rules: "required",
    componentProps: {
      options: [],
      allowClear: true,
      api: async() => {
        return await oppo_advertisementApi.fetchOppoConfigList({
          type: 'EXTENSION_FLOW',
          advertiserId: creationInfo.accountInfo.map(x => x.localAdvertiserId),
          extensionType: creationInfo.configData.campaign.extensionType,
        })
      },
      valueField: 'value',
      labelField: 'name',
    },
    label: '推广流量',
  },
  {
    component: 'ApiSelect',
    fieldName: 'flowScene',
    rules: "required",
    componentProps: (formValues: Record<string, any>) => ({
      options: [],
      api: async (params: any) => {
        return await oppo_advertisementApi.fetchOppoConfigList(params);
      },
      params: {
        type: 'FLOW_SCENE',
        advertiserId: creationInfo.accountInfo.map(x => x.localAdvertiserId),
        extensionType: creationInfo.configData.campaign.extensionType,
        extensionFlow: formValues.extensionFlow,
      },
      valueField: 'value',
      labelField: 'name',
    }),
    label: '流量场景',
    dependencies: {
      triggerFields: ["extensionFlow"]
    }
  },
  {
    component: 'Select',
    fieldName: 'dayLimit',
    componentProps: { options: DAY_LIMIT_SELECT },
    label: '推广日期限制',
    defaultValue: 0,
  },
  {
    component: 'DatePicker',
    fieldName: 'beginTime',
    label: '推广开始时间',
    defaultValue: '',
    componentProps: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    rules: "required",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue.dayLimit === 1
      },
      triggerFields: ['dayLimit']
    }
  },
  {
    component: 'DatePicker',
    fieldName: 'endTime',
    label: '推广结束时间',
    defaultValue: '',
    componentProps: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    rules: "required",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue.dayLimit === 1
      },
      triggerFields: ['dayLimit']
    }
  },
  {
    component: 'Select',
    fieldName: 'billingType',
    componentProps: { options: BILLINGTYPE_SELECT },
    label: '计费方式',
    rules: "required",
    defaultValue: 1,
  },
  {
    component: 'Select',
    fieldName: 'advertiseType',
    componentProps: { options: ADTYPE_SELECT },
    label: '广告类型',
    rules: "required",
    defaultValue: 0,
    dependencies: {
      show: (currentValue: any) => {
        // 信息流才会展示
        return currentValue.flowScene === 6
      },
      triggerFields: ["flowScene"]
    }
  },

  {
    component: 'Select',
    fieldName: 'autoOpenFlag',
    componentProps: { options: OPPO_QUICK_APP_SELECT },
    label: '下载并打开',
    defaultValue: 0,
  },

  {
    component: 'InputNumber',
    fieldName: 'price',
    label: '出价',
    defaultValue: 0,
    rules: "required",
    dependencies: {
      show:(currentValue: any) => {
        // CPC 出价
        return currentValue.billingType === 2 || currentValue.billingType === 5
      },
      triggerFields: ["billingType"]
    }
  },

  {
    component: 'InputNumber',
    fieldName: 'deepOcpcPrice',
    label: '转化出价',
    defaultValue: 0,
    rules: "required",
    dependencies: {
      show: (currentValue: any) => {
        // OCPC
        return currentValue.billingType === 5
      },
      triggerFields: ["billingType"]
    }
  },
  {
    component: 'Select',
    fieldName: 'deepOcpcType',
    componentProps: { options: DEEP_CV_SELECT },
    label: '转化类型',
    defaultValue: 0,
    rules: "required",
    dependencies: {
      show: (currentValue: any) => {
        // OCPC
        return currentValue.billingType === 5
      },
      triggerFields: ["billingType"]
    }
  },
  {
    component: 'Input',
    fieldName: 'deepUrl',
    label: '直达链接',
    defaultValue: '',
  },
  {
    component: 'Select',
    fieldName: 'ocpcOptmType',
    componentProps: {
      options: [
        { label: '无', value: 0 },
        { label: '转化', value: 1 },
        { label: '点击', value: 2 },
      ],
    },
    label: '出价类型',
    defaultValue: 0,
  },
  {
    component: 'Input',
    fieldName: 'ocpcPrice',
    label: '目标转化出价',
    defaultValue: '',
  },
  {
    component: 'Select',
    fieldName: 'ocpcType',
    componentProps: { options: DEEP_CV_SELECT },
    label: '目标转化类型',
    defaultValue: 0,
    rules: "required",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue.billingType === 5
      },
      triggerFields: ["billingType"]
    }
  },


  {
    component: 'Select',
    fieldName: 'smartExpandType',
    componentProps: { options: SMART_EXPAND_SELECT },
    label: '智能扩量',
    defaultValue: 0,
  },
  {
    component: 'Select',
    fieldName: 'timeLimit',
    componentProps: { options: TIME_LIMIT_SELECT },
    label: '推广时段限制',
    defaultValue: 0,
  },
  {
    component: markRaw(TimeSelectionPeriod),
    fieldName: 'timeSet',
    label: '推广时段',
    rules: "required",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue.timeLimit === 1
      },
      triggerFields: ["timeLimit"]
    }
  },
  {
    component: 'Select',
    fieldName: 'linkDeskFlag',
    componentProps: { options: OPPO_QUICK_APP_SELECT },
    label: '打开快应用并加桌',
    defaultValue: 1,
  },
  {
    component: 'Select',
    fieldName: 'appletType',
    componentProps: { options: QUICK_APP_TYPE_SELECT },
    label: '小程序类型',
    defaultValue: 0,
  },
  {
    component: 'Input',
    fieldName: 'kwOcpcPrice',
    label: '关键词目标转化出价（分）',
    defaultValue: '',
  },
  {
    component: 'Input',
    fieldName: 'kwDeepOcpcPrice',
    label: '关键词深度转化出价（分）',
    defaultValue: '',
  },
  {
    component: 'Input',
    fieldName: 'kwTargetROI',
    label: '关键词目标ROI系数',
    defaultValue: '',
  },
  {
    component: 'Input',
    fieldName: 'channelPkgId',
    label: '渠道包ID',
    defaultValue: '',
  },
  {
    component: 'Select',
    fieldName: 'defaultSecondStage',
    componentProps: { options: OPPO_FREE_ORDER_SELECT },
    label: '是否开启免一阶',
    defaultValue: 1,
  },
  {
    component: 'InputNumber',
    fieldName: 'targetROI',
    label: '目标ROI系数',
    rules: "required",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue.ocpcType === 47
      },
      triggerFields: ["ocpcType"]
    }
  },
  // adsDpaProductDTO 平铺字段
  {
    component: 'Select',
    fieldName: 'adsDpaProductDTO_dpaProductType',
    componentProps: { options: PRODUCT_AD_TYPE_SELECT },
    label: '商品广告类型',
    defaultValue: 0,
  },
  {
    component: 'Input',
    fieldName: 'adsDpaProductDTO_dpaProductLibraryId',
    label: '商品广告-商品库ID',
    defaultValue: 0,
  },
  {
    component: 'Select',
    fieldName: 'adsDpaProductDTO_dpaProductIdList',
    componentProps: { options: [], mode: 'multiple', placeholder: '请选择商品ID' },
    label: '商品ID列表',
    defaultValue: [],
  },

  {
    component: "Select",
    fieldName: "pageType",
    defaultValue: 0,
    componentProps: {
      options: PAGE_TYPE_SELECT
    },
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
  },
  // {
  //   component: 'Select',
  //   fieldName: 'pushAppPageType',
  //   componentProps: { options: APP_PAGE_SELECT },
  //   label: '应用内页类型',
  //   defaultValue: 0,
  // },
  {
    component: 'Select',
    fieldName: 'ocpxOptimizeSwitch',
    componentProps: { options: OPTIMIZE_SWITCH_SELECT },
    label: 'OCPX自动优化开关',
    defaultValue: 0,
  },
  {
    component: 'Select',
    fieldName: 'ocpxOptimizeType',
    componentProps: { options: OPTIMIZE_TYPE_SELECT },
    label: 'OCPX优化类型',
    defaultValue: 0,
  },
  // marketingObjectiveDTO 平铺字段
  {
    component: 'Input',
    fieldName: 'marketingObjectiveDTO_dpaProductType',
    label: '营销目标商品库类型',
    defaultValue: 3,
  },
  {
    component: 'Input',
    fieldName: 'marketingObjectiveDTO_dpaProductLibraryId',
    label: '营销目标商品库ID',
    defaultValue: '',
  },
  {
    component: 'Select',
    fieldName: 'marketingObjectiveDTO_dpaProductIdList',
    componentProps: { options: [], mode: 'multiple', placeholder: '请选择营销商品ID' },
    label: '营销目标商品ID列表',
    defaultValue: [],
  },
];

// 广告组展示标签
const adgroupShowLabel: Record<string, string> = {
  adGroupName: '广告组名称',
  billingType: '计费方式',
  ocpcType: '目标转化类型',
  price: '基础出价（分）',
  dayLimit: '推广日期限制',
  beginTime: '开始时间',
  endTime: '结束时间',
  flowScene: '流量场景',
};

// ======================== 广告表单字段 ========================
const promotionFormFields = [
  {
    component: 'AdNameGen',
    fieldName: 'adName',
    label: '广告名称',
    rules: 'required',
  },
  {
    component: 'Select',
    fieldName: 'globalSpecId',
    componentProps: { options: GLOBAL_SPECID_SELECT },
    label: '统一规格',
    defaultValue: 1,
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'brandName',
    label: '品牌名称',
    rules: 'required',
    defaultValue: '',
  },
  {
    component: 'Input',
    fieldName: 'buttonTxt',
    label: '按钮文案',
    rules: 'required',
    defaultValue: '',
  },
];

// 广告展示标签
const promotionShowLabel: Record<string, string> = {
  adName: '广告名称',
  globalSpecId: '规格',
  brandName: '品牌名称',
  copywriter: '广告文案',
  dynamicCr: '是否衍生',
  clickUrl: '点击链接',
};
</script>

<template>
  <div class="oppo-base-template">
    <div class="panes">
      <div class="pane">
        <OppoCampaign
          :form-fields="campaignFormFields"
          :campaign-show-label="campaignShowLabel"
          :campaign="creationInfo?.configData.campaign"
          :field-label-map="fieldLabelMap"
          @update:campaign="updateCampaign"
        />
      </div>

      <div class="pane">
        <div class="combined-area">
          <OppoAdgroup
            :form-fields="adgroupFormFields"
            :adgroup-show-label="adgroupShowLabel"
            :adgroup="creationInfo?.configData.adgroup"
            :field-label-map="fieldLabelMap"
            @update:adgroup="updateAdgroup"
          />
          <OppoPromotion
            :form-fields="promotionFormFields"
            :promotion-show-label="promotionShowLabel"
            :promotion="creationInfo?.configData.promotion"
            :field-label-map="fieldLabelMap"
            @update:promotion="updatePromotion"
          />
        </div>
      </div>

      <div class="pane">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData.material"
          @update:material="updateMaterial"
        />
      </div>

      <div class="pane">
        <div class="combined-area">
          <PageViewSelector
            :page-view="creationInfo.configData.landingPage"
            :account-info="creationInfo.accountInfo"
            @update:page-view="updateLandingPage"
          />
          <TitleSelector
            :title-package="creationInfo.configData.titlePackage"
            :account-info="creationInfo.accountInfo"
            @update:title-package="updateTitlePackage"
          />
          <AudiencePackageSelector
            :audience="creationInfo.configData.audience"
            :account-info="creationInfo.accountInfo"
            :platform="Platform.OPPO"
            @update:audience="updateAudiencePackage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.oppo-base-template {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.panes {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
  }

  :deep(.ant-card) {
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    max-height: 100% !important;
    overflow: hidden !important;
  }

  :deep(.ant-card-head) {
    flex-shrink: 0 !important;
  }

  :deep(.ant-card-body) {
    display: flex !important;
    flex: 1 1 0% !important;
    flex-direction: column !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-content) {
    flex: 1 1 0% !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-footer) {
    flex-shrink: 0 !important;
  }
}

.combined-area {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
  }
}
</style>
