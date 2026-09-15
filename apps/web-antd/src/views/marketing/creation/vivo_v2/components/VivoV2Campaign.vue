<script setup lang="ts" name="VivoV2Campaign">
import type {
  VivoV2Creation,
  VivoV2PlanData,
} from '#/views/marketing/creation/vivo_v2/vivo_v2';

import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, Button, Card, Descriptions, DescriptionsItem, message } from 'ant-design-vue';

import { z } from '#/adapter/form';
import {
  VIVO_V2_AD_TYPE_OPTIONS,
  VIVO_V2_APPEAR_TYPE_OPTIONS,
  VIVO_V2_BIDDING_STRATEGY_OPTIONS,
  VIVO_V2_CHARGE_TYPE_OPTIONS,
  VIVO_V2_CONVERSION_TARGET_OPTIONS,
  VIVO_V2_DELIVERY_SCENE_OPTIONS,
  VIVO_V2_GENERAL_SWITCH_OPTIONS,
  VIVO_V2_H5_TYPE_OPTIONS,
  VIVO_V2_INSTALL_BEHAVIOR_OPTIONS,
  VIVO_V2_INSTALL_PERIOD_OPTIONS,
  VIVO_V2_INSTALLED_APP_OPTIONS,
  VIVO_V2_INTEL_AD_TYPE_OPTIONS,
  VIVO_V2_MEDIA_TYPE_OPTIONS,
  VIVO_V2_NETWORK_OPTIONS,
  VIVO_V2_NOBID_BIDDING_STRATEGY_OPTIONS,
  VIVO_V2_PLACE_TYPE_OPTIONS,
  VIVO_V2_PUSH_FORM_OPTIONS,
  VIVO_V2_SPENT_TYPE_OPTIONS,
  VIVO_V2_START_BEHAVIOR_OPTIONS,
  VIVO_V2_START_PERIOD_OPTIONS,
  VIVO_V2_STAY_TYPE_OPTIONS,
  VIVO_V2_SWITCH_OPTIONS,
  VIVO_V2_WECHAT_FOLLOW_OPTIONS,
  VIVO_V2_WORD_CHOICE_MODEL_OPTIONS,
} from '#/views/marketing/creation/vivo_v2/enums';
import { defaultVivoV2ConfigData } from '#/views/marketing/creation/vivo_v2/vivo_v2';

import VivoV2CampaignDrawer from './VivoV2CampaignDrawer.vue';

/**
 * vivo 2.0 计划组件 props
 * creationInfo 批创信息（计划数据取自 creationInfo.configData.campaign）
 */
const props = defineProps({
  creationInfo: {
    type: Object as () => VivoV2Creation,
    default: () => ({}) as VivoV2Creation,
  },
});

/**
 * update:campaign 更新计划信息
 */
const emit = defineEmits<{
  (e: 'update:campaign', campaign: Partial<VivoV2PlanData>): void;
}>();

/**
 * 计划表单字段配置（vivo 2.0 ad/plan/addPlan）
 *
 * 说明：
 * 1. 字段按接口文档分组，用 Divider 分块展示，避免一长列；
 * 2. 取值依赖 vivo 查询接口的字段本次不接接口：
 *    - 数组型码值（地域、性别、年龄、人群包、各类标签集合）用 Select + mode="tags"，可先手工填写码值；
 *    - 单值型 ID（商品/资质/渠道包/小程序/分包/词包等）用 Input，placeholder 标注待接入的接口名；
 * 3. 金额字段表单以「元」填写，生成预览/提交时 ×100000 转毫分（见 VIVO_V2_MONEY_RATE）；
 * 4. scheduleTime 为 168 位 0/1 字符串，本次用 Input 占位，待接入时段选择组件。
 */
const campaignFormFields: any[] = [
  // ==================== 基本信息 ====================
  {
    component: 'Divider',
    fieldName: '_dividerBasic',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '基本信息' }),
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '计划名称',
    rules: z
      .string()
      .min(1, { message: '请输入计划名称' })
      .max(200, { message: '计划名称长度不得超过 200' }),
    componentProps: {
      placeholder: '计划名称，长度不得超过 200，同账户不可重复',
    },
  },
  {
    component: 'Select',
    fieldName: 'adType',
    label: '推广目标',
    rules: 'selectRequired',
    componentProps: {
      options: VIVO_V2_AD_TYPE_OPTIONS,
      placeholder: '请选择推广目标',
    },
  },

  // ==================== 流量与展示（mediaDisplayOption） ====================
  {
    component: 'Divider',
    fieldName: '_dividerMedia',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '流量与展示（mediaDisplayOption）' }),
  },
  {
    component: 'Select',
    fieldName: 'autoSelect',
    label: '流量自动选择',
    rules: 'selectRequired',
    componentProps: {
      options: VIVO_V2_SWITCH_OPTIONS,
      placeholder: '开启时 mediaFormat 无需传值',
    },
  },
  {
    component: 'Select',
    fieldName: 'mediaTypeList',
    label: '媒体类型',
    componentProps: {
      mode: 'multiple',
      options: VIVO_V2_MEDIA_TYPE_OPTIONS,
      // 关闭自动选择时生效，对应 mediaFormat[].mediaType
      placeholder: '可多选，关闭自动选择时生效',
    },
  },
  {
    component: 'Select',
    fieldName: 'placeTypeList',
    label: '展现形式',
    componentProps: {
      mode: 'multiple',
      options: VIVO_V2_PLACE_TYPE_OPTIONS,
      // 对应 mediaFormat[].placeType
      placeholder: '可多选；含搜索推广时需填选词模式',
    },
  },

  // ==================== 推广与落地 ====================
  {
    component: 'Divider',
    fieldName: '_dividerPromotion',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '推广与落地' }),
  },
  {
    component: 'Select',
    fieldName: 'intelAdType',
    label: '应用智投',
    componentProps: {
      options: VIVO_V2_INTEL_AD_TYPE_OPTIONS,
      placeholder: '不填写默认为普通投放',
    },
  },
  {
    component: 'Select',
    fieldName: 'generalSwitch',
    label: '通投智选',
    rules: 'selectRequired',
    componentProps: {
      options: VIVO_V2_GENERAL_SWITCH_OPTIONS,
      placeholder: '请选择通投智选',
    },
  },
  {
    component: 'Input',
    fieldName: 'productId',
    label: '商品ID',
    componentProps: {
      placeholder: '商品ID（待接商品查询接口）',
    },
  },
  {
    component: 'Input',
    fieldName: 'advertiseQualificationId',
    label: '广告投放资质ID',
    componentProps: {
      placeholder: '广告投放资质ID（待接资质列表接口）',
    },
  },
  {
    component: 'Input',
    fieldName: 'channelId',
    label: '渠道包ID',
    componentProps: {
      placeholder: '渠道包ID（待接渠道包列表接口）',
    },
  },
  {
    component: 'Input',
    fieldName: 'apkId',
    label: '渠道包可用APKID',
    componentProps: {
      placeholder: '渠道包可用APKID（待接渠道包列表接口）',
    },
  },
  {
    component: 'Input',
    fieldName: 'webSiteUrl',
    label: '推广链接-普通网址',
    componentProps: {
      placeholder: '普通网址，推广目标为普通网址时必填',
    },
  },
  {
    component: 'Select',
    fieldName: 'h5Type',
    label: '推广链接-h5来源',
    componentProps: {
      options: VIVO_V2_H5_TYPE_OPTIONS,
      placeholder: 'h5详情页来源',
    },
  },
  {
    component: 'Input',
    fieldName: 'h5Code',
    label: '推广链接-h5编码',
    componentProps: {
      placeholder: 'h5详情页ID或编码（待接落地页查询接口）',
    },
  },
  {
    component: 'Input',
    fieldName: 'rpkDeepLink',
    label: '快应用deepLink',
    componentProps: {
      placeholder: '快应用deepLink地址，需以 hap://app/、hapjs.org 等域名开头',
    },
  },
  {
    component: 'Input',
    fieldName: 'appletOriginId',
    label: '小程序ID',
    componentProps: {
      placeholder: '小程序ID（待接白名单接口）',
    },
  },
  {
    component: 'Input',
    fieldName: 'appletPath',
    label: '小程序页面路径',
    componentProps: {
      placeholder: '小程序页面路径，推广目标为小程序时必填',
    },
  },
  {
    component: 'Input',
    fieldName: 'subpackageId',
    label: '智能分包ID',
    componentProps: {
      placeholder: '智能分包ID（待接智能分包列表接口）',
    },
  },
  {
    component: 'Input',
    fieldName: 'builtInRpkDeepLink',
    label: '内置快应用deepLink',
    componentProps: {
      placeholder: '内置快应用deepLink，普通网址 + 第三方落地页可填',
    },
  },
  {
    component: 'Select',
    fieldName: 'wechatFollow',
    label: '微信一键关注',
    componentProps: {
      options: VIVO_V2_WECHAT_FOLLOW_OPTIONS,
      placeholder: '仅普通网址支持一键关注',
    },
  },

  // ==================== 出价与预算 ====================
  {
    component: 'Divider',
    fieldName: '_dividerBid',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '出价与预算' }),
  },
  {
    component: 'Select',
    fieldName: 'chargeType',
    label: '出价方式',
    rules: 'selectRequired',
    componentProps: {
      options: VIVO_V2_CHARGE_TYPE_OPTIONS,
      placeholder: '请选择出价方式',
    },
  },
  {
    // 按转化目标出价时代表优化目标出价；提交时 ×100000 转毫分（见 VIVO_V2_MONEY_RATE）
    component: 'InputNumber',
    fieldName: 'price',
    label: '出价（元）',
    componentProps: {
      min: 0,
      placeholder: '请输入出价，单位：元',
    },
  },
  {
    component: 'Select',
    fieldName: 'cvType',
    label: '优化目标',
    componentProps: {
      options: VIVO_V2_CONVERSION_TARGET_OPTIONS,
      placeholder: '优化目标（待接新版可用优化目标查询接口）',
      showSearch: true,
      optionFilterProp: 'label',
    },
  },
  {
    // 提交时 ×100000 转毫分（见 VIVO_V2_MONEY_RATE）
    component: 'InputNumber',
    fieldName: 'secondOcpxPrice',
    label: '深度优化目标出价（元）',
    componentProps: {
      min: 0,
      placeholder: '请输入深度优化目标出价，单位：元',
    },
  },
  {
    component: 'Select',
    fieldName: 'secondCvType',
    label: '深度优化目标',
    componentProps: {
      options: VIVO_V2_CONVERSION_TARGET_OPTIONS,
      placeholder: '深度优化目标（待接新版可用优化目标查询接口）',
      showSearch: true,
      optionFilterProp: 'label',
    },
  },
  {
    component: 'Select',
    fieldName: 'biddingStrategy',
    label: '出价策略',
    componentProps: {
      options: VIVO_V2_BIDDING_STRATEGY_OPTIONS,
      placeholder: '仅按转化目标出价支持优先拿量',
    },
  },
  {
    component: 'Select',
    fieldName: 'spentType',
    label: '投放类型',
    rules: 'selectRequired',
    componentProps: {
      options: VIVO_V2_SPENT_TYPE_OPTIONS,
      placeholder: '日限额不限或单选商店流量时不支持匀速投放',
    },
  },
  {
    component: 'Select',
    fieldName: 'deliverySceneType',
    label: '投放场景',
    componentProps: {
      options: VIVO_V2_DELIVERY_SCENE_OPTIONS,
      placeholder: '投放场景 deliveryScene.type',
    },
  },
  {
    component: 'Select',
    fieldName: 'nobidBiddingStrategy',
    label: '无出价场景出价策略',
    componentProps: {
      options: VIVO_V2_NOBID_BIDDING_STRATEGY_OPTIONS,
      placeholder: '最大转化投放场景使用',
    },
  },
  {
    // 提交时 ×100000 转毫分（见 VIVO_V2_MONEY_RATE）
    component: 'InputNumber',
    fieldName: 'costCeiling',
    label: '目标成本上限（元）',
    componentProps: {
      min: 0,
      placeholder: '请输入目标成本上限，单位：元',
    },
  },
  {
    // -1 表示不限；提交时按元 ×100000 转毫分（见 VIVO_V2_MONEY_RATE）
    component: 'InputNumber',
    fieldName: 'dailyBudget',
    label: '计划预算（元）',
    rules: z
      .number()
      .min(-1, { message: '计划预算单位为元，最小 -1（-1 表示不限）' })
      .nullish(),
    componentProps: {
      min: -1,
      placeholder: '计划预算，单位：元；-1 表示不限',
    },
  },

  // ==================== 定向（audienceInfo） ====================
  {
    component: 'Divider',
    fieldName: '_dividerAudience',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '定向（audienceInfo）' }),
  },
  {
    component: 'Select',
    fieldName: 'regionCodeList',
    label: '行政区划代码',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写行政区划码值',
    },
  },
  {
    component: 'Select',
    fieldName: 'stayType',
    label: '地域停留类型',
    componentProps: {
      options: VIVO_V2_STAY_TYPE_OPTIONS,
      placeholder: '请选择停留类型',
    },
  },
  {
    component: 'Select',
    fieldName: 'sexList',
    label: '用户性别',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写码值',
    },
  },
  {
    component: 'Select',
    fieldName: 'ageList',
    label: '用户年龄',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写码值',
    },
  },
  {
    component: 'Select',
    fieldName: 'installedApp',
    label: '安装定向',
    componentProps: {
      options: VIVO_V2_INSTALLED_APP_OPTIONS,
      placeholder: '请选择安装定向',
    },
  },
  {
    component: 'Select',
    fieldName: 'customList',
    label: '定向人群包ID',
    componentProps: {
      mode: 'tags',
      placeholder: '待接广告主人群包列表接口，可先手工填写人群包ID',
    },
  },
  {
    component: 'Select',
    fieldName: 'excludeCustomList',
    label: '排除人群包ID',
    componentProps: {
      mode: 'tags',
      placeholder: '待接广告主人群包列表接口，可先手工填写人群包ID',
    },
  },
  {
    component: 'Select',
    fieldName: 'installPeriod',
    label: '安装行为-时间范围',
    componentProps: {
      options: VIVO_V2_INSTALL_PERIOD_OPTIONS,
      placeholder: '请选择时间范围',
    },
  },
  {
    component: 'Select',
    fieldName: 'installBehaviorCode',
    label: '安装行为-行为',
    componentProps: {
      options: VIVO_V2_INSTALL_BEHAVIOR_OPTIONS,
      placeholder: '请选择应用行为',
    },
  },
  {
    component: 'Select',
    fieldName: 'installAppCategoryCode',
    label: '安装行为-应用分类ID',
    componentProps: {
      mode: 'tags',
      // 与游戏分类合计最多 200 个
      placeholder: '待接入基础人群定向标签接口，可先手工填写分类ID（与游戏分类合计最多 200 个）',
    },
  },
  {
    component: 'Select',
    fieldName: 'installGameCategoryCode',
    label: '安装行为-游戏分类ID',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写分类ID',
    },
  },
  {
    component: 'Select',
    fieldName: 'startPeriod',
    label: '启动行为-时间范围',
    componentProps: {
      options: VIVO_V2_START_PERIOD_OPTIONS,
      placeholder: '-1 表示历史',
    },
  },
  {
    component: 'Select',
    fieldName: 'startBehaviorCode',
    label: '启动行为-行为',
    componentProps: {
      options: VIVO_V2_START_BEHAVIOR_OPTIONS,
      placeholder: '请选择应用行为',
    },
  },
  {
    component: 'Select',
    fieldName: 'startAppCategoryCode',
    label: '启动行为-应用分类ID',
    componentProps: {
      mode: 'tags',
      // 与游戏分类合计最多 200 个
      placeholder: '待接入基础人群定向标签接口，可先手工填写分类ID（与游戏分类合计最多 200 个）',
    },
  },
  {
    component: 'Select',
    fieldName: 'startGameCategoryCode',
    label: '启动行为-游戏分类ID',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写分类ID',
    },
  },
  {
    component: 'Select',
    fieldName: 'interestSet',
    label: '兴趣行为',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写码值（-1 为系统优选）',
    },
  },
  {
    component: 'Select',
    fieldName: 'network',
    label: '网络环境',
    componentProps: {
      options: VIVO_V2_NETWORK_OPTIONS,
      placeholder: '请选择网络环境',
    },
  },
  {
    component: 'Select',
    fieldName: 'androidVersionSet',
    label: '安卓版本',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写码值',
    },
  },
  {
    component: 'Select',
    fieldName: 'phonePriceSet',
    label: '购机价格',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写码值',
    },
  },
  {
    component: 'Select',
    fieldName: 'phoneSeriesSet',
    label: '手机系列',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写码值',
    },
  },
  {
    component: 'Select',
    fieldName: 'networkOperatorSet',
    label: '运营商',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入基础人群定向标签接口，可先手工填写码值',
    },
  },

  // ==================== 排期 ====================
  {
    component: 'Divider',
    fieldName: '_dividerSchedule',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '排期' }),
  },
  {
    component: 'DatePicker',
    fieldName: 'startDate',
    label: '投放开始日期',
    rules: 'required',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择投放开始日期',
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'endDate',
    label: '投放结束日期',
    rules: 'required',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择投放结束日期',
    },
  },
  {
    component: 'Input',
    fieldName: 'scheduleTime',
    label: '投放时段',
    componentProps: {
      placeholder: '168 位 0/1 字符串，待接入时段选择组件',
    },
  },

  // ==================== 搜索提词 ====================
  {
    component: 'Divider',
    fieldName: '_dividerSearch',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '搜索提词' }),
  },
  {
    component: 'Select',
    fieldName: 'wordChoiceModel',
    label: '选词模式',
    componentProps: {
      options: VIVO_V2_WORD_CHOICE_MODEL_OPTIONS,
      placeholder: '展现形式含搜索推广时必填',
    },
  },
  {
    component: 'Select',
    fieldName: 'autoExtension',
    label: '自动拓词',
    componentProps: {
      options: VIVO_V2_SWITCH_OPTIONS,
      placeholder: '请选择是否自动拓词',
    },
  },
  {
    // 提词列表为动态增减行，实际渲染在抽屉的 #searchWordList 插槽中
    component: 'Input',
    fieldName: 'searchWordList',
    label: '搜索提词列表',
  },
  {
    component: 'Input',
    fieldName: 'wordPackageId',
    label: '关键词包ID',
    componentProps: {
      placeholder: '关键词包ID（星词管家词包，待接词包查询接口）',
    },
  },

  // ==================== 其他 ====================
  {
    component: 'Divider',
    fieldName: '_dividerOther',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '其他' }),
  },
  {
    component: 'Select',
    fieldName: 'pushForm',
    label: '通知形式',
    componentProps: {
      options: VIVO_V2_PUSH_FORM_OPTIONS,
      placeholder: '请选择通知形式',
    },
  },
  {
    component: 'Select',
    fieldName: 'appearType',
    label: '广告计划类型',
    componentProps: {
      options: VIVO_V2_APPEAR_TYPE_OPTIONS,
      placeholder: '请选择广告计划类型',
    },
  },
];

/**
 * 计划编辑抽屉
 */
const [CampaignDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: VivoV2CampaignDrawer,
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const { planData, _isConfirmed } = (drawerApi.getData() || {}) as {
        planData?: Partial<VivoV2PlanData>;
        _isConfirmed?: boolean;
      };
      if (planData && _isConfirmed) {
        // 属性合并更新，避免覆盖模板预置的其他字段
        Object.assign(campaignInfo.value, planData);
        emit('update:campaign', Object.assign({}, planData));
      }
    }
  },
});

/**
 * campaignInfo 计划信息 - 必须在 watch 之前定义
 */
const campaignInfo = ref<VivoV2PlanData>(defaultVivoV2ConfigData().campaign);

// 监听父组件传入的计划数据变化，实现回显（复用模板时）
watch(
  () => props.creationInfo?.configData?.campaign,
  (newCampaign) => {
    if (newCampaign) {
      campaignInfo.value = { ...newCampaign };
    }
  },
  { immediate: true, deep: true },
);

/** 是否有账户 */
const hasAccount = computed(() => (props.creationInfo?.accountInfo?.length ?? 0) > 0);

/** 是否有产品 */
const hasProduct = computed(() => Boolean(props.creationInfo?.project?.projectId));

/**
 * 卡片展示字段（展示名称 -> 计划字段名），仅展示简单字段
 */
const campaignShowLabel: Record<string, keyof VivoV2PlanData> = {
  计划名称: 'name',
  推广目标: 'adType',
  出价方式: 'chargeType',
  '出价（元）': 'price',
  '计划预算（元）': 'dailyBudget',
  投放开始日期: 'startDate',
  投放结束日期: 'endDate',
};

function openCampaignDrawer() {
  if (!hasProduct.value) {
    message.warning('请先选择产品');
    return;
  }
  if (!hasAccount.value) {
    message.warning('请先选择账户');
    return;
  }
  drawerApi.setData(campaignInfo.value);
  drawerApi.open();
}
</script>

<template>
  <div class="vivo-v2-campaign-container">
    <Card title="计划" class="info-card">
      <div class="card-content">
        <Descriptions v-if="campaignInfo.name" :column="1">
          <DescriptionsItem
            v-for="(field, label) in campaignShowLabel"
            :key="field"
            :label="label"
          >
            {{ campaignInfo[field] }}
          </DescriptionsItem>
        </Descriptions>
        <Alert v-else type="error" message="请先填写计划信息" />
      </div>

      <div class="card-footer">
        <Button type="primary" @click="openCampaignDrawer">
          {{ campaignInfo.name ? '编辑计划' : '添加计划' }}
        </Button>
      </div>
    </Card>

    <CampaignDrawerModule :form-fields="campaignFormFields" />
  </div>
</template>

<style scoped lang="scss">
.vivo-v2-campaign-container {
  display: flex;
  flex: 1; // 让容器高度自适应，匹配父容器的高度
  flex-direction: column;
  width: 100%;
  min-height: 0; // 允许容器收缩，防止内容被挤压
}

.info-card {
  display: flex;
  flex: 1; // Card 自适应列高，保证与其他列底部对齐
  flex-direction: column;
  width: 100%;
  min-height: 300px;

  :deep(.ant-card-head) {
    flex-shrink: 0;
  }

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
}

.card-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.card-footer {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgb(0 0 0 / 6%);
}
</style>
