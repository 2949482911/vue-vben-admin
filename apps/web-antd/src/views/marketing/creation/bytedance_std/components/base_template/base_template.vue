<script setup lang="ts" name="StdBaseTemplate">
/**
 * 智擎版基础模板
 *
 * 参考 bytedance/base_template.vue 模式：
 * - 接收 creationInfo prop
 * - 定义自己的 projectFormFields
 * - 渲染布局（Row/Col）
 * - 通过 :form-fields 传给 StdProject
 */
import { Col, Row } from 'ant-design-vue';
import { markRaw } from 'vue';

import StdProject from '../StdProject.vue';
import ProductConfigCard
  from '../product/ProductConfigCard.vue';
import DpaProductConfigCard
  from '../product/DpaProductConfigCard.vue';
import CreativeGroupSelector
  from '#/views/marketing/creation/components/creative/CreativeGroupSelector.vue';
import TitleSelector
  from '#/views/marketing/creation/components/title/TitleSelector.vue';
import PageViewSelector
  from '#/views/marketing/creation/components/pageview/PageViewSelector.vue';
import TimeSelectionPeriod
  from '#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue';
import type {
  AudienceConfigData,
  MaterialData,
  PageViewConfigData,
  TitlePackageConfigData,
} from '#/views/marketing/creation/creation';
import type {
  ProductConfigData,
  StdCreation,
  StdProjectData,
  DpaProductConfigData,
} from '#/views/marketing/creation/bytedance_std/bytedance';
import {
  BytedanceCampaign_ad_type,
  BytedanceCampaign_bid_type,
  BytedanceCampaign_deep_bid_type,
  BytedanceCampaign_delivery_type,
  // BytedanceCampaign_external_action,
  BytedanceCampaign_landing_type,
  BytedanceCampaign_marketing_goal,
  BytedanceCampaign_pricing,
  BytedanceCampaign_product_setting,
  BytedanceCampaign_schedule_type,
  BytedanceCampgin_budget_mode,
  BytedancePromotion_anchor_related_type,
  BytedancePromotion_is_comment_disable,
  CampaignOperation,
  DeliveryMode,
  fieldLabelMap,
} from '#/views/marketing/creation/bytedance_std/enums';

const emit = defineEmits([
  'update:project',
  'update:audiencePackage',
  'update:updateMaterial',
  'update:titlePackage',
  'update:landingPage',
  'update:productConfig',
  'update:dpaProductConfig',
]);

const { creationInfo, productConfig, dpaProductConfig } = defineProps({
  creationInfo: {
    type: Object as () => StdCreation,
    default: () => ({}),
  },
  productConfig: {
    type: Object as () => ProductConfigData | null,
    default: null,
  },
  dpaProductConfig: {
    type: Object as () => DpaProductConfigData | null,
    default: null,
  },
});

function updateProject(project: StdProjectData) {
  emit('update:project', project);
}
function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit('update:audiencePackage', audienceConfigData);
}
function updateMaterial(materialData: MaterialData) {
  emit('update:updateMaterial', materialData);
}
function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit('update:titlePackage', titlePackage);
}
function updateLandingPage(landingPage: PageViewConfigData) {
  emit('update:landingPage', landingPage);
}
function updateProductConfig(data: ProductConfigData) {
  emit('update:productConfig', data);
}
function updateDpaProductConfig(data: DpaProductConfigData) {
  emit('update:dpaProductConfig', data);
}

/** 项目基本信息展示字段（父传子给 StdProject 循环展示） */
const campaignShowLabel: Record<string, string> = {
  name: '项目名称',
  landing_type: '推广目的',
  marketing_goal: '营销场景',
  ad_type: '广告类型',
  delivery_type: '投放类型',
};

// ==================== 基础模板表单字段 ====================
const projectFormFields = [
  // -- 基本信息 --
  { component: 'AdNameGen', fieldName: 'name', label: '项目名称', rules: 'required' },
  {
    component: 'Select', fieldName: 'operation',
    componentProps: { options: CampaignOperation },
    label: '启停状态', defaultValue: 'ENABLE',
  },
  {
    component: 'Select', fieldName: 'delivery_mode',
    componentProps: { options: DeliveryMode },
    label: '投放模式', defaultValue: 'PROCEDURAL',
  },
  {
    component: 'Select', fieldName: 'landing_type',
    componentProps: { options: BytedanceCampaign_landing_type },
    label: '营销目的', rules: 'required', defaultValue: 'APP',
  },
  {
    component: 'Select', fieldName: 'marketing_goal',
    componentProps: { options: BytedanceCampaign_marketing_goal },
    label: '营销场景', defaultValue: 'VIDEO_AND_IMAGE',
  },
  {
    component: 'Select', fieldName: 'ad_type',
    componentProps: { options: BytedanceCampaign_ad_type },
    label: '项目类型', defaultValue: 'ALL',
  },
  {
    component: 'Select', fieldName: 'delivery_type',
    componentProps: { options: BytedanceCampaign_delivery_type },
    label: '投放类型', defaultValue: 'NORMAL',
  },

  // -- 优化目标（options 由 StdProjectDrawer 远程请求后注入） --
  {
    component: 'Select',
    fieldName: 'external_action',
    label: '转化目标',
    rules: 'required',
    componentProps: { options: [], placeholder: '请选择转化目标', allowClear: true, showSearch: true },
  },
  {
    component: 'Select',
    fieldName: 'deep_external_action',
    label: '深度转化目标',
    componentProps: { options: [], placeholder: '请选择深度转化目标', allowClear: true, showSearch: true },
  },
  {
    component: 'Select', fieldName: 'deep_bid_type',
    componentProps: { options: BytedanceCampaign_deep_bid_type },
    label: '深度优化方式', defaultValue: 'DEEP_BID_DEFAULT',
  },

  // -- 商品设置 --
  {
    component: 'Select', fieldName: 'related_product_setting',
    componentProps: { options: BytedanceCampaign_product_setting },
    label: '商品设置', defaultValue: 'NO_MAP',
  },
  { component: 'Input', fieldName: 'related_product_platform_id', label: '商品平台ID' },
  { component: 'Input', fieldName: 'related_product_id', label: '商品ID' },
  { component: 'Input', fieldName: 'related_product_unique_id', label: '升级版商品ID' },
  // 是否选择关联商品（控制 DPA 商品选择按钮显隐）
  {
    component: 'Select', fieldName: 'related_product_enabled',
    componentProps: {
      options: [
        { label: '否', value: 'NO' },
        { label: '是', value: 'YES' },
      ],
    },
    label: '选择关联商品', defaultValue: 'NO',
  },
  // 关联商品后的投放商品展示（值由 StdProjectDrawer 按分配规则计算注入，配置入口在配置区卡片）
  {
    component: 'Input', fieldName: 'dpa_product_display', label: '投放商品',
    componentProps: { disabled: true, placeholder: '请先在配置区配置投放商品' },
    dependencies: {
      show: (cv: Record<string, any>) => cv['related_product_enabled'] === 'YES',
      triggerFields: ['related_product_enabled'],
    },
  },
  // DPA 商品选择的隐藏字段（按分配规则回填 product_id / product_platform_id）
  { component: 'Input', fieldName: 'product_id', dependencies: { show: false, triggerFields: ['*'] } },
  { component: 'Input', fieldName: 'product_platform_id', dependencies: { show: false, triggerFields: ['*'] } },

  // -- 排期 --
  {
    component: 'Select', fieldName: 'schedule_type',
    componentProps: { options: BytedanceCampaign_schedule_type },
    label: '投放时间', defaultValue: 'SCHEDULE_FROM_NOW',
  },
  {
    component: 'DatePicker', fieldName: 'start_time',
    componentProps: { format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD' },
    label: '开始时间',
    dependencies: {
      show: (cv: Record<string, any>) => cv['schedule_type'] === 'SCHEDULE_START_END',
      triggerFields: ['schedule_type'],
    },
  },
  {
    component: 'DatePicker', fieldName: 'end_time',
    componentProps: { format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD' },
    label: '结束时间',
    dependencies: {
      show: (cv: Record<string, any>) => cv['schedule_type'] === 'SCHEDULE_START_END',
      triggerFields: ['schedule_type'],
    },
  },
  {
    component: markRaw(TimeSelectionPeriod),
    fieldName: 'schedule_time',
    label: '投放时段',
  },

  // -- 竞价策略与出价 --
  {
    component: 'Select', fieldName: 'bid_type',
    componentProps: { options: BytedanceCampaign_bid_type },
    label: '竞价策略', defaultValue: 'CUSTOM',
  },
  {
    component: 'Select', fieldName: 'pricing',
    componentProps: { options: BytedanceCampaign_pricing },
    label: '计费方式', defaultValue: 'PRICING_OCPM',
  },

  // -- 预算 --
  {
    component: 'Select', fieldName: 'budget_mode',
    componentProps: { options: BytedanceCampgin_budget_mode },
    label: '预算模式', defaultValue: 'BUDGET_MODE_DAY',
  },
  {
    component: 'InputNumber', fieldName: 'budget',
    label: '预算', defaultValue: 0,
    dependencies: {
      show: (cv: Record<string, any>) => cv['budget_mode'] !== 'BUDGET_MODE_INFINITE',
      triggerFields: ['budget_mode'],
    },
  },
  {
    component: 'InputNumber', fieldName: 'bid',
    label: '出价', defaultValue: 0, rules: 'required', help: '范围 0.2-999',
  },
  {
    component: 'InputNumber', fieldName: 'roi_goal',
    label: 'ROI系数', defaultValue: 0, help: '深度优化方式为ROI时必填',
  },

  // -- 创意设置 --
  {
    component: 'Select', fieldName: 'is_comment_disable',
    componentProps: { options: BytedancePromotion_is_comment_disable },
    label: '评论管理', defaultValue: 'OFF',
  },
  { component: 'Input', fieldName: 'source', label: '来源' },
  {
    component: 'Select', fieldName: 'anchor_related_type',
    componentProps: { options: BytedancePromotion_anchor_related_type },
    label: '原生锚点', defaultValue: 'OFF',
  },

  // -- AIGC --
  {
    component: 'Switch', formItemClass: 'w-[150px]',
    fieldName: 'aigc_dynamic_creative_switch',
    componentProps: {
      checkedValue: 'ON', unCheckedValue: 'OFF',
      checkedChildren: 'ON', unCheckedChildren: 'OFF',
    },
    label: 'AIGC动态素材', defaultValue: 'OFF',
  },

  // -- 隐藏字段 --
  { component: 'Input', fieldName: 'search_continue_delivery', defaultValue: 'OFF', dependencies: { show: false, triggerFields: ['*'] } },
  { component: 'Input', fieldName: 'layer_roi_switch', defaultValue: 'OFF', dependencies: { show: false, triggerFields: ['*'] } },
  { component: 'Input', fieldName: 'auto_extend_traffic', defaultValue: 'OFF', dependencies: { show: false, triggerFields: ['*'] } },
  { component: 'Input', fieldName: 'star_auto_delivery_switch', defaultValue: 'OFF', dependencies: { show: false, triggerFields: ['*'] } },
  { component: 'Input', fieldName: 'star_auto_material_addition_switch', defaultValue: 'OFF', dependencies: { show: false, triggerFields: ['*'] } },
  { component: 'Input', fieldName: 'audience_type', defaultValue: 'UNLIMITED', dependencies: { show: false, triggerFields: ['*'] } },
  { component: 'Input', fieldName: 'native_type', defaultValue: 'ACCOUNT', dependencies: { show: false, triggerFields: ['*'] } },
  { component: 'Input', fieldName: 'ad_download_status', defaultValue: 'OFF', dependencies: { show: false, triggerFields: ['*'] } },
];
</script>

<template>
  <div class="std-base-template">
    <Row :gutter="16" class="equal-height-row">
      <!-- 第1列：项目配置 + 定向包 -->
      <Col :span="8" class="equal-height-col">
        <StdProject
          :project="creationInfo?.configData.project"
          :audience="creationInfo?.configData.audience"
          :account-info="creationInfo.accountInfo"
          :form-fields="projectFormFields"
          :campaign-show-label="campaignShowLabel"
          :field-label-map="fieldLabelMap"
          :dpa-product-config="dpaProductConfig"
          @update:project="updateProject"
          @update:audience-package="updateAudiencePackage"
        />
      </Col>

      <!-- 第2列：产品配置 + 创意组 -->
      <Col :span="8" class="equal-height-col">
        <div class="combined-area">
          <ProductConfigCard
            :product-config="productConfig"
            :account-info="creationInfo.accountInfo"
            @update:product-config="updateProductConfig"
          />
          <DpaProductConfigCard
            :dpa-product-config="dpaProductConfig"
            :account-info="creationInfo.accountInfo"
            @update:dpa-product-config="updateDpaProductConfig"
          />
          <CreativeGroupSelector
            :account-info="creationInfo.accountInfo"
            :material="creationInfo.configData.material"
            @update:material="updateMaterial"
          />
        </div>
      </Col>

      <!-- 第3列：落地页 + 标题包 -->
      <Col :span="8" class="equal-height-col">
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
        </div>
      </Col>
    </Row>
  </div>
</template>

<style scoped lang="scss">
.std-base-template { width: 100%; }

.equal-height-row {
  display: flex;
  align-items: stretch;
  height: 650px;
}

.equal-height-col {
  display: flex;
  min-height: 0;

  > * {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
}

.combined-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  > * {
    flex: 1;
    min-height: 0;
  }
}
</style>
