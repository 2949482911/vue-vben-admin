<script setup lang="ts" name="BytedanceAudienceForm">
import { useVbenForm } from '@vben/common-ui';
import {
  Bytedance_ac,
  Bytedance_action_days,
  Bytedance_ad_type,
  Bytedance_age,
  Bytedance_android_osv,
  Bytedance_auto_extend_targets,
  Bytedance_aweme_fan_behaviors,
  Bytedance_aweme_fan_time_scope,
  Bytedance_carrier,
  Bytedance_carrier_region_optimize,
  Bytedance_converted_time_duration,
  Bytedance_delivery_range,
  Bytedance_device_brand,
  Bytedance_device_type,
  Bytedance_district,
  Bytedance_filter_aweme_abnormal_active,
  Bytedance_filter_event,
  Bytedance_filter_own_aweme_fans,
  Bytedance_gender,
  Bytedance_harmony_osv,
  Bytedance_hide_if_converted,
  Bytedance_hide_if_exists,
  Bytedance_interest_action_mode,
  Bytedance_ios_osv,
  Bytedance_landing_type,
  Bytedance_launch_price,
  Bytedance_location_type,
  Bytedance_marketing_goal,
  Bytedance_platform,
  Bytedance_region_version,
  Bytedance_superior_popularity_type,
} from './bytedance_audience';

async function submitBytedanceConfig() {
  return await formApi.getValues();
}

async function echoBytedanceConfig(data: any) {
  if (data.config) {
    await formApi.setValues(data.config);
  }
}

async function popUpCancel() {
  formApi.resetForm();
}

defineExpose({
  submitBytedanceConfig,
  echoBytedanceConfig,
  popUpCancel,
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    // landing_type
    {
      component: 'Select',
      fieldName: 'landing_type',
      componentProps: { options: Bytedance_landing_type, placeholder: '请选择推广目的' },
      label: '定向包类型',
      defaultValue: 'EXTERNAL',
    },
    // marketing_goal
    {
      component: 'Select',
      fieldName: 'marketing_goal',
      componentProps: { options: Bytedance_marketing_goal, placeholder: '请选择营销场景' },
      label: '营销场景',
      defaultValue: 'VIDEO_AND_IMAGE',
    },
    // delivery_range
    {
      component: 'Select',
      fieldName: 'delivery_range',
      componentProps: { options: Bytedance_delivery_range, placeholder: '请选择投放范围' },
      label: '营销投放范围',
      defaultValue: 'DEFAULT',
    },
    // ad_type
    {
      component: 'Select',
      fieldName: 'ad_type',
      componentProps: { options: Bytedance_ad_type, placeholder: '请选择单元类型' },
      label: '单元类型',
      defaultValue: 'ALL',
    },
    // retargeting_tags
    {
      component: 'Select',
      fieldName: 'retargeting_tags',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择定向人群' },
      label: '定向人群',
      defaultValue: [],
    },
    // retargeting_tags_exclude
    {
      component: 'Select',
      fieldName: 'retargeting_tags_exclude',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择排除人群' },
      label: '排除人群',
      defaultValue: [],
    },
    // gender
    {
      component: 'Select',
      fieldName: 'gender',
      componentProps: { options: Bytedance_gender, placeholder: '请选择性别' },
      label: '性别',
      defaultValue: 'NONE',
    },
    // age
    {
      component: 'Select',
      fieldName: 'age',
      componentProps: { options: Bytedance_age, mode: 'multiple', placeholder: '请选择年龄' },
      label: '年龄',
      defaultValue: [],
    },
    // android_osv
    {
      component: 'Select',
      fieldName: 'android_osv',
      componentProps: { options: Bytedance_android_osv, placeholder: '请选择Android版本' },
      label: 'Android版本',
      defaultValue: '0.0',
    },
    // ios_osv
    {
      component: 'Select',
      fieldName: 'ios_osv',
      componentProps: { options: Bytedance_ios_osv, placeholder: '请选择iOS版本' },
      label: 'iOS版本',
      defaultValue: '0.0',
    },
    // harmony_osv
    {
      component: 'Select',
      fieldName: 'harmony_osv',
      componentProps: { options: Bytedance_harmony_osv, placeholder: '请选择Harmony版本' },
      label: 'Harmony版本',
      defaultValue: '5.0',
    },
    // carrier
    {
      component: 'Select',
      fieldName: 'carrier',
      componentProps: { options: Bytedance_carrier, mode: 'multiple', placeholder: '请选择运营商' },
      label: '运营商',
      defaultValue: [],
    },
    // carrier_region_optimize
    {
      component: 'Select',
      fieldName: 'carrier_region_optimize',
      componentProps: { options: Bytedance_carrier_region_optimize },
      label: '运营商区域优选',
      defaultValue: 'OFF',
    },
    // ac
    {
      component: 'Select',
      fieldName: 'ac',
      componentProps: { options: Bytedance_ac, mode: 'multiple', placeholder: '请选择网络类型' },
      label: '网络类型',
      defaultValue: [],
    },
    // device_brand
    {
      component: 'Select',
      fieldName: 'device_brand',
      componentProps: { options: Bytedance_device_brand, mode: 'multiple', placeholder: '请选择设备品牌' },
      label: '设备品牌',
      defaultValue: [],
    },
    // platform
    {
      component: 'Select',
      fieldName: 'platform',
      componentProps: { options: Bytedance_platform, mode: 'multiple', placeholder: '请选择操作系统平台' },
      label: '操作系统平台',
      defaultValue: [],
    },
    // auto_extend_targets
    {
      component: 'Select',
      fieldName: 'auto_extend_targets',
      componentProps: { options: Bytedance_auto_extend_targets, mode: 'multiple', placeholder: '请选择智能定向' },
      label: '智能定向',
      defaultValue: [],
    },
    // launch_price
    {
      component: 'Select',
      fieldName: 'launch_price',
      componentProps: { options: Bytedance_launch_price, mode: 'multiple', placeholder: '请选择设备价格' },
      label: '设备价格',
      defaultValue: [],
    },
    // interest_action_mode
    {
      component: 'Select',
      fieldName: 'interest_action_mode',
      componentProps: { options: Bytedance_interest_action_mode, placeholder: '请选择行为兴趣模式' },
      label: '行为兴趣模式',
      defaultValue: 'UNLIMITED',
    },
    // action_days
    {
      component: 'Select',
      fieldName: 'action_days',
      componentProps: { options: Bytedance_action_days, placeholder: '请选择行为天数' },
      label: '行为天数',
      defaultValue: 7,
    },
    // action_categories
    {
      component: 'Select',
      fieldName: 'action_categories',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择行为类目' },
      label: '行为类目',
      defaultValue: [],
    },
    // action_words
    {
      component: 'Select',
      fieldName: 'action_words',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择行为关键词' },
      label: '行为关键词',
      defaultValue: [],
    },
    // interest_categories
    {
      component: 'Select',
      fieldName: 'interest_categories',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择兴趣类目' },
      label: '兴趣类目',
      defaultValue: [],
    },
    // interest_words
    {
      component: 'Select',
      fieldName: 'interest_words',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择兴趣关键词' },
      label: '兴趣关键词',
      defaultValue: [],
    },
    // district
    {
      component: 'Select',
      fieldName: 'district',
      componentProps: { options: Bytedance_district, placeholder: '请选择地域类型' },
      label: '地域类型',
      defaultValue: 'NONE',
    },
    // region_version
    {
      component: 'Select',
      fieldName: 'region_version',
      componentProps: { options: Bytedance_region_version },
      label: '地域版本',
      defaultValue: 'NEW',
    },
    // city
    {
      component: 'Select',
      fieldName: 'city',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择城市' },
      label: '城市',
      defaultValue: [],
    },
    // location_type
    {
      component: 'Select',
      fieldName: 'location_type',
      componentProps: { options: Bytedance_location_type, placeholder: '请选择地点类型' },
      label: '受众位置类型',
      defaultValue: 'ALL',
    },
    // superior_popularity_type
    {
      component: 'Select',
      fieldName: 'superior_popularity_type',
      componentProps: { options: Bytedance_superior_popularity_type },
      label: '媒体定向',
      defaultValue: 'NONE',
    },
    // flow_package
    {
      component: 'Select',
      fieldName: 'flow_package',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择定向流量包' },
      label: '定向逻辑',
      defaultValue: [],
    },
    // exclude_flow_package
    {
      component: 'Select',
      fieldName: 'exclude_flow_package',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择排除流量包' },
      label: '排除定向逻辑',
      defaultValue: [],
    },
    // hide_if_converted
    {
      component: 'Select',
      fieldName: 'hide_if_converted',
      componentProps: { options: Bytedance_hide_if_converted },
      label: '过滤已转化用户',
      defaultValue: 'NO_EXCLUDE',
    },
    // converted_time_duration
    {
      component: 'Select',
      fieldName: 'converted_time_duration',
      componentProps: { options: Bytedance_converted_time_duration },
      label: '过滤时间范围',
      defaultValue: 'NONE',
    },
    // filter_event
    {
      component: 'Select',
      fieldName: 'filter_event',
      componentProps: { options: Bytedance_filter_event, mode: 'multiple', placeholder: '请选择转化事件' },
      label: '自定义过滤事件',
      defaultValue: [],
    },
    // device_type
    {
      component: 'Select',
      fieldName: 'device_type',
      componentProps: { options: Bytedance_device_type, mode: 'multiple', placeholder: '请选择设备类型' },
      label: '设备类型',
      defaultValue: [],
    },
    // geolocation
    {
      component: 'Input',
      fieldName: 'geolocation',
      componentProps: { placeholder: 'JSON数组格式: [{"name":"","long":0,"lat":0,"radius":0}]' },
      label: '自定义地理位置',
      defaultValue: [],
    },
    // aweme_fans_numbers
    {
      component: 'Select',
      fieldName: 'aweme_fans_numbers',
      componentProps: { options: [], mode: 'tags', placeholder: '请输入粉丝数下限值(回车确认)', filterOption: true },
      label: '粉丝数不小于',
      defaultValue: [],
      help: '（抖音投放特有）账号粉丝相似人群（添加抖音账号，会将营销投放给对应账号的相似人群粉丝）'
    },
    // filter_aweme_abnormal_active
    {
      component: 'Select',
      fieldName: 'filter_aweme_abnormal_active',
      componentProps: { options: Bytedance_filter_aweme_abnormal_active },
      label: '过滤抖音异常活跃用户',
      defaultValue: 0,
    },
    // filter_aweme_fans_count
    {
      component: 'InputNumber',
      fieldName: 'filter_aweme_fans_count',
      componentProps: { placeholder: '请输入粉丝数过滤值', min: 0 },
      label: '过滤高活跃用户',
      defaultValue: undefined,
    },
    // filter_own_aweme_fans
    {
      component: 'Select',
      fieldName: 'filter_own_aweme_fans',
      componentProps: { options: Bytedance_filter_own_aweme_fans },
      label: '过滤自己的粉丝',
      defaultValue: 0,
    },
    // aweme_fan_accounts
    {
      component: 'Select',
      fieldName: 'aweme_fan_accounts',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择抖音达人账号' },
      label: '抖音达人账号',
      defaultValue: [],
    },
    // aweme_fan_categories
    {
      component: 'Select',
      fieldName: 'aweme_fan_categories',
      componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择抖音达人分类' },
      label: '抖音达人分类',
      defaultValue: [],
    },
    // aweme_fan_behaviors
    {
      component: 'Select',
      fieldName: 'aweme_fan_behaviors',
      componentProps: { options: Bytedance_aweme_fan_behaviors, mode: 'multiple', placeholder: '请选择抖音达人行为' },
      label: '抖音达人行为',
      defaultValue: [],
    },
    // aweme_fan_time_scope
    {
      component: 'Select',
      fieldName: 'aweme_fan_time_scope',
      componentProps: { options: Bytedance_aweme_fan_time_scope },
      label: '抖音达人时间范围',
      defaultValue: 'FIFTEEN_DAYS',
    },
    // hide_if_exists
    {
      component: 'Select',
      fieldName: 'hide_if_exists',
      componentProps: { options: Bytedance_hide_if_exists },
      label: '过滤已安装',
      defaultValue: 0,
    },
  ],
});
</script>

<template>
  <div>
    <Form />
  </div>
</template>

<style scoped lang="scss"></style>
