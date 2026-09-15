<script lang="ts" setup name="VivoV2AudienceForm">
import type { AdVivoV2Config } from '../audiencePackageType';

import type { VivoV2AudienceInfo } from '#/views/marketing/creation/vivo_v2/vivo_v2';

import { h } from 'vue';

import { useVbenForm } from '@vben/common-ui';

import {
  VIVO_V2_INSTALL_BEHAVIOR_OPTIONS,
  VIVO_V2_INSTALL_PERIOD_OPTIONS,
  VIVO_V2_INSTALLED_APP_OPTIONS,
  VIVO_V2_NETWORK_OPTIONS,
  VIVO_V2_START_BEHAVIOR_OPTIONS,
  VIVO_V2_START_PERIOD_OPTIONS,
  VIVO_V2_STAY_TYPE_OPTIONS,
} from '#/views/marketing/creation/vivo_v2/enums';

/** 分组标题（与 vivo v1 一致，用 Divider 分组，不额外定制样式） */
const renderGroupTitle = (title: string) => () => ({
  default: () => h('span', title),
});

/**
 * 关闭弹框提交 vivo2.0 定向配置
 * 返回结构与 vivo v1 保持一致：{ type: 'package', ...audienceInfo }
 * type 供上层区分定向类型（package-定向包）
 */
async function submitVivoV2Config() {
  const values = await formApi.getValues();
  const audienceInfo: VivoV2AudienceInfo = {
    // 地域定向
    region: {
      regionCodeList: values.regionCodeList ?? [],
      stayType: values.stayType ?? 1,
    },
    // 人群
    sexList: values.sexList ?? [],
    ageList: values.ageList ?? [],
    customList: values.customList ?? [],
    excludeCustomList: values.excludeCustomList ?? [],
    // 安装行为
    installBehavior: {
      period: values.installPeriod ?? 30,
      behavior: values.installBehavior ?? 3,
      appCategoryCode: values.installAppCategoryCode ?? [],
      gameCategoryCode: values.installGameCategoryCode ?? [],
    },
    // 启动行为
    startBehavior: {
      period: values.startPeriod ?? -1,
      behavior: values.startBehavior ?? 1,
      appCategoryCode: values.startAppCategoryCode ?? [],
      gameCategoryCode: values.startGameCategoryCode ?? [],
    },
    // 环境与设备
    installedApp: values.installedApp ?? 1,
    network: values.network ?? 1,
    interestSet: values.interestSet ?? [],
    androidVersionSet: values.androidVersionSet ?? [],
    phonePriceSet: values.phonePriceSet ?? [],
    phoneSeriesSet: values.phoneSeriesSet ?? [],
    networkOperatorSet: values.networkOperatorSet ?? [],
  };
  return { type: 'package', ...audienceInfo };
}

/** 编辑 vivo2.0 定向配置回显展示 */
async function echoVivoV2Config(params: AdVivoV2Config) {
  const config = params.config || ({} as VivoV2AudienceInfo);
  await formApi.setValues({
    // 地域定向
    regionCodeList: config.region?.regionCodeList ?? [],
    stayType: config.region?.stayType ?? 1,
    // 人群
    sexList: config.sexList ?? [],
    ageList: config.ageList ?? [],
    customList: config.customList ?? [],
    excludeCustomList: config.excludeCustomList ?? [],
    // 安装行为
    installPeriod: config.installBehavior?.period ?? 30,
    installBehavior: config.installBehavior?.behavior ?? 3,
    installAppCategoryCode: config.installBehavior?.appCategoryCode ?? [],
    installGameCategoryCode: config.installBehavior?.gameCategoryCode ?? [],
    // 启动行为
    startPeriod: config.startBehavior?.period ?? -1,
    startBehavior: config.startBehavior?.behavior ?? 1,
    startAppCategoryCode: config.startBehavior?.appCategoryCode ?? [],
    startGameCategoryCode: config.startBehavior?.gameCategoryCode ?? [],
    // 环境与设备
    installedApp: config.installedApp ?? 1,
    network: config.network ?? 1,
    interestSet: config.interestSet ?? [],
    androidVersionSet: config.androidVersionSet ?? [],
    phonePriceSet: config.phonePriceSet ?? [],
    phoneSeriesSet: config.phoneSeriesSet ?? [],
    networkOperatorSet: config.networkOperatorSet ?? [],
  });
}

/** 关闭弹框时重置 vivo2.0 定向配置 */
async function popUpVivoV2Cancel() {
  await formApi.resetForm();
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Divider',
      fieldName: 'regionDivider',
      label: '',
      renderComponentContent: renderGroupTitle('地域定向'),
    },
    {
      component: 'Select',
      fieldName: 'regionCodeList',
      label: '行政区划代码',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入行政区划代码查询接口，可先手工填写码值',
      },
    },
    {
      component: 'Select',
      fieldName: 'stayType',
      label: '停留类型',
      defaultValue: 1,
      componentProps: {
        options: VIVO_V2_STAY_TYPE_OPTIONS,
        placeholder: '请选择停留类型',
      },
    },
    {
      component: 'Divider',
      fieldName: 'crowdDivider',
      label: '',
      renderComponentContent: renderGroupTitle('人群'),
    },
    {
      component: 'Select',
      fieldName: 'sexList',
      label: '性别',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入基础人群定向标签接口，可先手工填写码值',
      },
    },
    {
      component: 'Select',
      fieldName: 'ageList',
      label: '年龄',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入基础人群定向标签接口，可先手工填写码值',
      },
    },
    {
      component: 'Select',
      fieldName: 'customList',
      label: '定向人群',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入人群包列表接口，可先手工填写人群包id',
      },
    },
    {
      component: 'Select',
      fieldName: 'excludeCustomList',
      label: '排除人群',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入人群包列表接口，可先手工填写人群包id',
      },
    },
    {
      component: 'Divider',
      fieldName: 'installBehaviorDivider',
      label: '',
      renderComponentContent: renderGroupTitle('安装行为'),
    },
    {
      component: 'Select',
      fieldName: 'installPeriod',
      label: '时间范围',
      defaultValue: 30,
      componentProps: {
        options: VIVO_V2_INSTALL_PERIOD_OPTIONS,
        placeholder: '请选择时间范围',
      },
    },
    {
      component: 'Select',
      fieldName: 'installBehavior',
      label: '应用行为',
      defaultValue: 3,
      componentProps: {
        options: VIVO_V2_INSTALL_BEHAVIOR_OPTIONS,
        placeholder: '请选择应用行为',
      },
    },
    {
      component: 'Select',
      fieldName: 'installAppCategoryCode',
      label: '应用分类id',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入应用分类查询接口，可先手工填写码值',
      },
      help: '与游戏分类合计最多可选200个',
    },
    {
      component: 'Select',
      fieldName: 'installGameCategoryCode',
      label: '游戏分类id',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入游戏分类查询接口，可先手工填写码值',
      },
    },
    {
      component: 'Divider',
      fieldName: 'startBehaviorDivider',
      label: '',
      renderComponentContent: renderGroupTitle('启动行为'),
    },
    {
      component: 'Select',
      fieldName: 'startPeriod',
      label: '时间范围',
      defaultValue: -1,
      componentProps: {
        options: VIVO_V2_START_PERIOD_OPTIONS,
        placeholder: '请选择时间范围',
      },
    },
    {
      component: 'Select',
      fieldName: 'startBehavior',
      label: '应用行为',
      defaultValue: 1,
      componentProps: {
        options: VIVO_V2_START_BEHAVIOR_OPTIONS,
        placeholder: '请选择应用行为',
      },
    },
    {
      component: 'Select',
      fieldName: 'startAppCategoryCode',
      label: '应用分类id',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入应用分类查询接口，可先手工填写码值',
      },
      help: '与游戏分类合计最多可选200个',
    },
    {
      component: 'Select',
      fieldName: 'startGameCategoryCode',
      label: '游戏分类id',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入游戏分类查询接口，可先手工填写码值',
      },
    },
    {
      component: 'Divider',
      fieldName: 'environmentDivider',
      label: '',
      renderComponentContent: renderGroupTitle('环境与设备'),
    },
    {
      component: 'Select',
      fieldName: 'installedApp',
      label: '安装定向',
      defaultValue: 1,
      componentProps: {
        options: VIVO_V2_INSTALLED_APP_OPTIONS,
        placeholder: '请选择安装定向',
      },
    },
    {
      component: 'Select',
      fieldName: 'network',
      label: '网络环境',
      defaultValue: 1,
      componentProps: {
        options: VIVO_V2_NETWORK_OPTIONS,
        placeholder: '请选择网络环境',
      },
    },
    {
      component: 'Select',
      fieldName: 'interestSet',
      label: '兴趣行为',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入基础人群定向标签接口，可先手工填写码值，系统优选传 -1',
      },
    },
    {
      component: 'Select',
      fieldName: 'androidVersionSet',
      label: '安卓版本',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入安卓版本查询接口，可先手工填写码值',
      },
    },
    {
      component: 'Select',
      fieldName: 'phonePriceSet',
      label: '购机价格',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入购机价格查询接口，可先手工填写码值',
      },
    },
    {
      component: 'Select',
      fieldName: 'phoneSeriesSet',
      label: '手机系列',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入手机系列查询接口，可先手工填写码值',
      },
    },
    {
      component: 'Select',
      fieldName: 'networkOperatorSet',
      label: '运营商',
      defaultValue: [],
      componentProps: {
        mode: 'tags',
        options: [],
        placeholder: '待接入运营商查询接口，可先手工填写码值',
      },
    },
  ],
});

defineExpose({ submitVivoV2Config, echoVivoV2Config, popUpVivoV2Cancel });
</script>

<template>
  <div>
    <Form />
  </div>
</template>

<style lang="scss" scoped></style>
