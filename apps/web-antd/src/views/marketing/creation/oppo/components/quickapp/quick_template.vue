<script setup lang="ts" name="QuickAppTemplate">
import type {
  AudienceConfigData,
  MaterialData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
// 快应用模板
import type {
  OppoAdgroupData,
  OppoCampaignData,
  OppoCreation, OppoPromotionData
} from "#/views/marketing/creation/oppo/Oppo.types";

import { Platform } from "#/constants/enums";
import AudiencePackageSelector
  from "#/views/marketing/creation/components/audience_package/AudiencePackageSelector.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import OppoAdgroup from "#/views/marketing/creation/oppo/components/OppoAdgroup.vue";
import OppoCampaign from "#/views/marketing/creation/oppo/components/OppoCampaign.vue";
import OppoPromotion from "#/views/marketing/creation/oppo/components/OppoPromotion.vue";
import {
  DAYLIMIT_SELECT,
  DELIVERMODE_SELECT,
  fieldLabelMap, GLOBAL_SPECID_SELECT
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
    label: '推广目标',
    rules: 'required',
    defaultValue: 3,
    dependencies: {
      show: false,
      triggerFields: ["*"]
    }
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
]

const campaignShowLabel: Record<string, string> = {
  planName: '计划名称',
  extensionType: '推广目标',
  dayLimit: '日预算限制',
  dayBudget: '日预算',
  deliveryMode: '竞价策略',
};



// 广告组
const adgroupFormFields = [
  {
    component: 'AdNameGen',
    fieldName: 'adGroupName',
    label: '广告组名称',
    rules: 'required',
  },
]

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



// 创意基本信息

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
]


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
  <div class="oppo-quickapp-template">
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
.oppo-quickapp-template {
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
