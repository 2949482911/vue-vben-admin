<script setup lang="ts" name="VivoV2CampaignDrawer">
import type {
  VivoV2PlanData,
  VivoV2SearchWord,
} from '#/views/marketing/creation/vivo_v2/vivo_v2';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Input, InputNumber, Select } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  VIVO_V2_MATCH_TYPE_OPTIONS,
  VIVO_V2_WORD_SOURCE_OPTIONS,
} from '#/views/marketing/creation/vivo_v2/enums';
import { defaultVivoV2ConfigData } from '#/views/marketing/creation/vivo_v2/vivo_v2';

/**
 * formFields 计划表单字段配置（由 VivoV2Campaign 按接口文档分组下发）
 */
const { formFields } = defineProps({
  formFields: {
    type: Array as () => any[],
    default: () => [],
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    labelClass: 'w-[200px]',
    componentProps: {
      class: 'w-[300px]',
    },
  },
});

/** 计划默认值：保证平铺回显时每个字段都有值 */
const defaultPlan = defaultVivoV2ConfigData().campaign;

/** 搜索提词行（matchType / source 用 undefined 表示未选择，便于下拉绑定） */
type SearchWordRow = Omit<VivoV2SearchWord, 'matchType' | 'source'> & {
  matchType?: number;
  source?: number;
};

/** 搜索提词列表（动态增减行，确认时回写到 plan.searchWordList） */
const searchWordList = ref<SearchWordRow[]>([]);

function createSearchWord(): SearchWordRow {
  return { word: '', price: 0 };
}

function addSearchWord() {
  searchWordList.value.push(createSearchWord());
}

function removeSearchWord(index: number) {
  searchWordList.value.splice(index, 1);
}

/**
 * 计划数据（接口嵌套结构）-> 表单平铺值
 */
function toFormValues(plan?: Partial<VivoV2PlanData>) {
  const data: VivoV2PlanData = {
    ...defaultPlan,
    ...plan,
    mediaDisplayOption: {
      ...defaultPlan.mediaDisplayOption,
      ...plan?.mediaDisplayOption,
    },
    promotionLink: {
      ...defaultPlan.promotionLink,
      ...plan?.promotionLink,
    },
    deliveryScene: {
      ...defaultPlan.deliveryScene,
      ...plan?.deliveryScene,
    },
    audienceInfo: {
      ...defaultPlan.audienceInfo,
      ...plan?.audienceInfo,
      region: {
        ...defaultPlan.audienceInfo.region,
        ...plan?.audienceInfo?.region,
      },
      installBehavior: {
        ...defaultPlan.audienceInfo.installBehavior,
        ...plan?.audienceInfo?.installBehavior,
      },
      startBehavior: {
        ...defaultPlan.audienceInfo.startBehavior,
        ...plan?.audienceInfo?.startBehavior,
      },
    },
  };

  const { audienceInfo, deliveryScene, mediaDisplayOption, promotionLink } = data;
  const mediaFormat = mediaDisplayOption.mediaFormat || [];

  return {
    name: data.name,
    adType: data.adType,
    autoSelect: mediaDisplayOption.autoSelect,
    // mediaFormat 为「媒体类型 + 展现形式」的组合列表，表单拆成两个多选字段维护
    mediaTypeList: mediaFormat.map((item) => item.mediaType),
    placeTypeList: mediaFormat[0]?.placeType || [],
    intelAdType: data.intelAdType,
    generalSwitch: data.generalSwitch,
    productId: data.productId,
    advertiseQualificationId: data.advertiseQualificationId,
    channelId: data.channelId,
    apkId: data.apkId,
    webSiteUrl: promotionLink.webSiteUrl,
    h5Type: promotionLink.h5Type,
    h5Code: promotionLink.h5Code,
    rpkDeepLink: data.rpkDeepLink,
    appletOriginId: data.appletOriginId,
    appletPath: data.appletPath,
    subpackageId: data.subpackageId,
    builtInRpkDeepLink: data.builtInRpkDeepLink,
    wechatFollow: data.wechatFollow,
    chargeType: data.chargeType,
    price: data.price,
    cvType: data.cvType,
    secondOcpxPrice: data.secondOcpxPrice,
    secondCvType: data.secondCvType,
    biddingStrategy: data.biddingStrategy,
    spentType: data.spentType,
    deliverySceneType: deliveryScene.type,
    nobidBiddingStrategy: deliveryScene.nobidBiddingStrategy,
    costCeiling: deliveryScene.costCeiling,
    dailyBudget: data.dailyBudget,
    regionCodeList: audienceInfo.region.regionCodeList,
    stayType: audienceInfo.region.stayType,
    sexList: audienceInfo.sexList,
    ageList: audienceInfo.ageList,
    installedApp: audienceInfo.installedApp,
    customList: audienceInfo.customList,
    excludeCustomList: audienceInfo.excludeCustomList,
    installPeriod: audienceInfo.installBehavior.period,
    installBehaviorCode: audienceInfo.installBehavior.behavior,
    installAppCategoryCode: audienceInfo.installBehavior.appCategoryCode,
    installGameCategoryCode: audienceInfo.installBehavior.gameCategoryCode,
    startPeriod: audienceInfo.startBehavior.period,
    startBehaviorCode: audienceInfo.startBehavior.behavior,
    startAppCategoryCode: audienceInfo.startBehavior.appCategoryCode,
    startGameCategoryCode: audienceInfo.startBehavior.gameCategoryCode,
    interestSet: audienceInfo.interestSet,
    network: audienceInfo.network,
    androidVersionSet: audienceInfo.androidVersionSet,
    phonePriceSet: audienceInfo.phonePriceSet,
    phoneSeriesSet: audienceInfo.phoneSeriesSet,
    networkOperatorSet: audienceInfo.networkOperatorSet,
    startDate: data.startDate,
    endDate: data.endDate,
    scheduleTime: data.scheduleTime,
    wordChoiceModel: data.wordChoiceModel,
    autoExtension: data.autoExtension,
    wordPackageId: data.wordPackageId,
    pushForm: data.pushForm,
    appearType: data.appearType,
  };
}

/**
 * 表单平铺值 -> 计划数据（还原接口的嵌套结构）
 */
function toPlanData(values: Record<string, any>): Partial<VivoV2PlanData> {
  return {
    name: values.name ?? '',
    adType: values.adType,
    mediaDisplayOption: {
      autoSelect: values.autoSelect ?? 0,
      // 开启「自动选择」时 mediaFormat 无需传值；
      // 未开启时按所选媒体类型 × 所选展现形式还原为组合列表
      mediaFormat:
        values.autoSelect === 1
          ? []
          : (values.mediaTypeList || []).map((mediaType: number) => ({
              mediaType,
              placeType: values.placeTypeList || [],
            })),
    },
    intelAdType: values.intelAdType ?? 0,
    generalSwitch: values.generalSwitch ?? 0,
    productId: values.productId ?? '',
    advertiseQualificationId: values.advertiseQualificationId ?? '',
    channelId: values.channelId ?? '',
    apkId: values.apkId ?? '',
    promotionLink: {
      webSiteUrl: values.webSiteUrl ?? '',
      h5Type: values.h5Type ?? null,
      h5Code: values.h5Code ?? '',
    },
    rpkDeepLink: values.rpkDeepLink ?? '',
    appletOriginId: values.appletOriginId ?? '',
    appletPath: values.appletPath ?? '',
    subpackageId: values.subpackageId ?? '',
    builtInRpkDeepLink: values.builtInRpkDeepLink ?? '',
    wechatFollow: values.wechatFollow ?? 0,
    chargeType: values.chargeType ?? null,
    // 金额以「元」填写，生成预览/提交时 ×100000 转毫分（见 VIVO_V2_MONEY_RATE）
    price: values.price ?? 0,
    cvType: values.cvType ?? null,
    secondOcpxPrice: values.secondOcpxPrice ?? 0,
    secondCvType: values.secondCvType ?? null,
    biddingStrategy: values.biddingStrategy ?? 0,
    spentType: values.spentType ?? null,
    deliveryScene: {
      type: values.deliverySceneType ?? 0,
      nobidBiddingStrategy: values.nobidBiddingStrategy ?? null,
      costCeiling: values.costCeiling ?? 0,
    },
    audienceInfo: {
      region: {
        regionCodeList: values.regionCodeList ?? [],
        stayType: values.stayType ?? null,
      },
      sexList: values.sexList ?? [],
      ageList: values.ageList ?? [],
      installedApp: values.installedApp ?? null,
      customList: values.customList ?? [],
      excludeCustomList: values.excludeCustomList ?? [],
      installBehavior: {
        period: values.installPeriod ?? null,
        behavior: values.installBehaviorCode ?? null,
        appCategoryCode: values.installAppCategoryCode ?? [],
        gameCategoryCode: values.installGameCategoryCode ?? [],
      },
      startBehavior: {
        period: values.startPeriod ?? null,
        behavior: values.startBehaviorCode ?? null,
        appCategoryCode: values.startAppCategoryCode ?? [],
        gameCategoryCode: values.startGameCategoryCode ?? [],
      },
      interestSet: values.interestSet ?? [],
      network: values.network ?? null,
      androidVersionSet: values.androidVersionSet ?? [],
      phonePriceSet: values.phonePriceSet ?? [],
      phoneSeriesSet: values.phoneSeriesSet ?? [],
      networkOperatorSet: values.networkOperatorSet ?? [],
    },
    startDate: values.startDate ?? '',
    endDate: values.endDate ?? '',
    scheduleTime: values.scheduleTime ?? '',
    dailyBudget: values.dailyBudget ?? -1,
    wordChoiceModel: values.wordChoiceModel ?? null,
    autoExtension: values.autoExtension ?? 0,
    // 过滤掉未填写关键词的空行；未选择的下拉值回写为 null
    searchWordList: searchWordList.value
      .filter((item) => Boolean(item.word))
      .map((item) => ({
        word: item.word,
        price: item.price,
        matchType: item.matchType ?? null,
        source: item.source ?? null,
      })),
    wordPackageId: values.wordPackageId ?? '',
    pushForm: values.pushForm ?? 0,
    appearType: values.appearType ?? 0,
  };
}

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[40vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const plan = drawerApi.getData() as Partial<VivoV2PlanData> | undefined;
      formApi.setState({
        schema: formFields,
      });

      // 回显表单数据（嵌套结构平铺后写入）
      await formApi.setValues(toFormValues(plan));

      // 回显搜索提词列表，无数据时给出一个空行方便填写
      const words: VivoV2SearchWord[] = plan?.searchWordList || [];
      searchWordList.value =
        words.length > 0
          ? words.map((item) => ({
              word: item.word,
              price: item.price,
              matchType: item.matchType ?? undefined,
              source: item.source ?? undefined,
            }))
          : [createSearchWord()];
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    drawerApi.setData({
      planData: toPlanData(currentValues),
      _isConfirmed: true,
    });
    await drawerApi.close();
  },
  onClosed() {
    formApi.resetForm();
    searchWordList.value = [];
    drawerApi.close();
  },
  onCancel() {
    formApi.resetForm();
    searchWordList.value = [];
    drawerApi.close();
  },
});
</script>

<template>
  <div>
    <Drawer title="编辑计划信息">
      <Form>
        <!-- 搜索提词列表：动态增减行，确认时回写到 searchWordList -->
        <template #searchWordList>
          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in searchWordList"
              :key="index"
              class="flex items-center gap-2"
            >
              <Input v-model:value="item.word" placeholder="关键词" />
              <InputNumber
                v-model:value="item.price"
                :min="0"
                placeholder="关键词出价，单位：元"
              />
              <Select
                v-model:value="item.matchType"
                :options="VIVO_V2_MATCH_TYPE_OPTIONS"
                placeholder="匹配方式"
              />
              <Select
                v-model:value="item.source"
                :options="VIVO_V2_WORD_SOURCE_OPTIONS"
                placeholder="词来源"
              />
              <Button danger type="link" @click="removeSearchWord(index)">删除</Button>
            </div>
            <Button type="dashed" @click="addSearchWord">添加关键词</Button>
          </div>
        </template>
      </Form>
    </Drawer>
  </div>
</template>
