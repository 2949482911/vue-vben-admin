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
  Bytedance_dpa_city,
  Bytedance_dpa_lbs,
  Bytedance_dpa_rta_recommend_type,
  Bytedance_dpa_rta_switch,
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
  Bytedance_simple_filter_aweme_abnormal_active,
  Bytedance_simple_filter_own_aweme_fans,
  Bytedance_simple_hide_if_exists,
  Bytedance_superior_popularity_type,
} from './bytedance_audience';

// ==================== 定向类型 select（schema 公共字段） ====================
const typeSelectField = {
  component: 'Select',
  fieldName: 'audience_type',
  label: '定向类型',
  defaultValue: 'package',
  componentProps: {
    options: [
      { label: '媒体定向', value: 'package' },
      { label: '常规定向', value: 'normal' },
    ],
    onChange: (value: string) => {
      handleTypeChange(value);
    },
  },
};

// ==================== 媒体定向 schema 字段 ====================
const packageFields = [
  { component: 'Select', fieldName: 'landing_type', label: '定向包类型', defaultValue: 'EXTERNAL', componentProps: { options: Bytedance_landing_type, placeholder: '请选择推广目的' } },
  { component: 'Select', fieldName: 'marketing_goal', label: '营销场景', defaultValue: 'VIDEO_AND_IMAGE', componentProps: { options: Bytedance_marketing_goal, placeholder: '请选择营销场景' } },
  { component: 'Select', fieldName: 'delivery_range', label: '营销投放范围', defaultValue: 'DEFAULT', componentProps: { options: Bytedance_delivery_range, placeholder: '请选择投放范围' } },
  { component: 'Select', fieldName: 'ad_type', label: '单元类型', defaultValue: 'ALL', componentProps: { options: Bytedance_ad_type, placeholder: '请选择单元类型' } },
  { component: 'Select', fieldName: 'retargeting_tags', label: '定向人群', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择定向人群' } },
  { component: 'Select', fieldName: 'retargeting_tags_exclude', label: '排除人群', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择排除人群' } },
  { component: 'Select', fieldName: 'gender', label: '性别', defaultValue: 'NONE', componentProps: { options: Bytedance_gender, placeholder: '请选择性别' } },
  { component: 'Select', fieldName: 'age', label: '年龄', defaultValue: [], componentProps: { options: Bytedance_age, mode: 'multiple', placeholder: '请选择年龄' } },
  { component: 'Select', fieldName: 'android_osv', label: 'Android版本', defaultValue: '0.0', componentProps: { options: Bytedance_android_osv, placeholder: '请选择Android版本' } },
  { component: 'Select', fieldName: 'ios_osv', label: 'iOS版本', defaultValue: '0.0', componentProps: { options: Bytedance_ios_osv, placeholder: '请选择iOS版本' } },
  { component: 'Select', fieldName: 'harmony_osv', label: 'Harmony版本', componentProps: { options: Bytedance_harmony_osv, placeholder: '请选择Harmony版本' } },
  { component: 'Select', fieldName: 'carrier', label: '运营商', defaultValue: [], componentProps: { options: Bytedance_carrier, mode: 'multiple', placeholder: '请选择运营商' } },
  { component: 'Select', fieldName: 'carrier_region_optimize', label: '运营商区域优选', defaultValue: 'OFF', componentProps: { options: Bytedance_carrier_region_optimize } },
  { component: 'Select', fieldName: 'ac', label: '网络类型', defaultValue: [], componentProps: { options: Bytedance_ac, mode: 'multiple', placeholder: '请选择网络类型' } },
  { component: 'Select', fieldName: 'device_brand', label: '设备品牌', defaultValue: [], componentProps: { options: Bytedance_device_brand, mode: 'multiple', placeholder: '请选择设备品牌' } },
  { component: 'Select', fieldName: 'platform', label: '操作系统平台', defaultValue: [], componentProps: { options: Bytedance_platform, mode: 'multiple', placeholder: '请选择操作系统平台' } },
  { component: 'Select', fieldName: 'auto_extend_targets', label: '智能定向', defaultValue: [], componentProps: { options: Bytedance_auto_extend_targets, mode: 'multiple', placeholder: '请选择智能定向' } },
  { component: 'Select', fieldName: 'launch_price', label: '设备价格', defaultValue: [], componentProps: { options: Bytedance_launch_price, mode: 'multiple', placeholder: '请选择设备价格' } },
  { component: 'Select', fieldName: 'interest_action_mode', label: '行为兴趣模式', defaultValue: 'UNLIMITED', componentProps: { options: Bytedance_interest_action_mode, placeholder: '请选择行为兴趣模式' } },
  { component: 'Select', fieldName: 'action_days', label: '行为天数', defaultValue: 7, componentProps: { options: Bytedance_action_days, placeholder: '请选择行为天数' } },
  { component: 'Select', fieldName: 'action_categories', label: '行为类目', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择行为类目' } },
  { component: 'Select', fieldName: 'action_words', label: '行为关键词', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择行为关键词' } },
  { component: 'Select', fieldName: 'interest_categories', label: '兴趣类目', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择兴趣类目' } },
  { component: 'Select', fieldName: 'interest_words', label: '兴趣关键词', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择兴趣关键词' } },
  { component: 'Select', fieldName: 'district', label: '地域类型', defaultValue: 'NONE', componentProps: { options: Bytedance_district, placeholder: '请选择地域类型' } },
  { component: 'Select', fieldName: 'region_version', label: '地域版本', defaultValue: 'NEW', componentProps: { options: Bytedance_region_version } },
  { component: 'Select', fieldName: 'city', label: '城市', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择城市' } },
  { component: 'Select', fieldName: 'location_type', label: '受众位置类型', defaultValue: 'ALL', componentProps: { options: Bytedance_location_type, placeholder: '请选择地点类型' } },
  { component: 'Select', fieldName: 'superior_popularity_type', label: '媒体定向', defaultValue: 'NONE', componentProps: { options: Bytedance_superior_popularity_type } },
  { component: 'Select', fieldName: 'flow_package', label: '定向逻辑', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择定向流量包' } },
  { component: 'Select', fieldName: 'exclude_flow_package', label: '排除定向逻辑', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择排除流量包' } },
  { component: 'Select', fieldName: 'hide_if_converted', label: '过滤已转化用户', defaultValue: 'NO_EXCLUDE', componentProps: { options: Bytedance_hide_if_converted } },
  { component: 'Select', fieldName: 'converted_time_duration', label: '过滤时间范围', defaultValue: 'NONE', componentProps: { options: Bytedance_converted_time_duration } },
  { component: 'Select', fieldName: 'filter_event', label: '自定义过滤事件', defaultValue: [], componentProps: { options: Bytedance_filter_event, mode: 'multiple', placeholder: '请选择转化事件' } },
  { component: 'Select', fieldName: 'device_type', label: '设备类型', defaultValue: [], componentProps: { options: Bytedance_device_type, mode: 'multiple', placeholder: '请选择设备类型' } },
  { component: 'Input', fieldName: 'geolocation', label: '自定义地理位置', defaultValue: [], componentProps: { placeholder: 'JSON数组格式: [{"name":"","long":0,"lat":0,"radius":0}]' } },
  { component: 'Select', fieldName: 'aweme_fans_numbers', label: '粉丝数不小于', defaultValue: [], componentProps: { options: [], mode: 'tags', placeholder: '请输入粉丝数下限值(回车确认)', filterOption: true }, help: '（抖音投放特有）账号粉丝相似人群' },
  { component: 'Select', fieldName: 'filter_aweme_abnormal_active', label: '过滤抖音异常活跃用户', defaultValue: 0, componentProps: { options: Bytedance_filter_aweme_abnormal_active } },
  { component: 'InputNumber', fieldName: 'filter_aweme_fans_count', label: '过滤高活跃用户', defaultValue: undefined, componentProps: { placeholder: '请输入粉丝数过滤值', min: 0 } },
  { component: 'Select', fieldName: 'filter_own_aweme_fans', label: '过滤自己的粉丝', defaultValue: 0, componentProps: { options: Bytedance_filter_own_aweme_fans } },
  { component: 'Select', fieldName: 'aweme_fan_accounts', label: '抖音达人账号', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择抖音达人账号' } },
  { component: 'Select', fieldName: 'aweme_fan_categories', label: '抖音达人分类', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择抖音达人分类' } },
  { component: 'Select', fieldName: 'aweme_fan_behaviors', label: '抖音达人行为', defaultValue: [], componentProps: { options: Bytedance_aweme_fan_behaviors, mode: 'multiple', placeholder: '请选择抖音达人行为' } },
  { component: 'Select', fieldName: 'aweme_fan_time_scope', label: '抖音达人时间范围', defaultValue: 'FIFTEEN_DAYS', componentProps: { options: Bytedance_aweme_fan_time_scope } },
  { component: 'Select', fieldName: 'hide_if_exists', label: '过滤已安装', defaultValue: 0, componentProps: { options: Bytedance_hide_if_exists } },
];

// ==================== 常规定向 schema 字段 ====================
const normalFields = [
  { component: 'Select', fieldName: 'district', label: '地域类型', defaultValue: 'NONE', componentProps: { options: Bytedance_district, placeholder: '请选择地域类型' } },
  { component: 'Input', fieldName: 'geolocation', label: '自定义地理位置', defaultValue: [], componentProps: { placeholder: 'JSON数组格式: [{"name":"","long":0,"lat":0,"radius":0}]' } },
  { component: 'Select', fieldName: 'region_version', label: '地域版本', defaultValue: 'NEW', componentProps: { options: Bytedance_region_version } },
  { component: 'Select', fieldName: 'city', label: '城市', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择城市' } },
  { component: 'Select', fieldName: 'location_type', label: '受众位置类型', defaultValue: 'ALL', componentProps: { options: Bytedance_location_type, placeholder: '请选择地点类型' } },
  { component: 'Select', fieldName: 'gender', label: '性别', defaultValue: 'NONE', componentProps: { options: Bytedance_gender, placeholder: '请选择性别' } },
  { component: 'Select', fieldName: 'age', label: '年龄', defaultValue: [], componentProps: { options: Bytedance_age, mode: 'multiple', placeholder: '请选择年龄' } },
  { component: 'Select', fieldName: 'retargeting_tags_include', label: '定向人群', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择定向人群' } },
  { component: 'Select', fieldName: 'retargeting_tags_exclude', label: '排除人群', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择排除人群' } },
  { component: 'Select', fieldName: 'interest_action_mode', label: '行为兴趣模式', defaultValue: 'UNLIMITED', componentProps: { options: Bytedance_interest_action_mode, placeholder: '请选择行为兴趣模式' } },
  { component: 'Select', fieldName: 'action_days', label: '行为天数', defaultValue: 7, componentProps: { options: Bytedance_action_days, placeholder: '请选择行为天数' } },
  { component: 'Select', fieldName: 'action_categories', label: '行为类目', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择行为类目' } },
  { component: 'Select', fieldName: 'action_words', label: '行为关键词', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择行为关键词' } },
  { component: 'Select', fieldName: 'interest_categories', label: '兴趣类目', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择兴趣类目' } },
  { component: 'Select', fieldName: 'interest_words', label: '兴趣关键词', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择兴趣关键词' } },
  { component: 'Select', fieldName: 'aweme_fan_behaviors', label: '抖音达人行为', defaultValue: [], componentProps: { options: Bytedance_aweme_fan_behaviors, mode: 'multiple', placeholder: '请选择抖音达人行为' } },
  { component: 'Select', fieldName: 'aweme_fan_time_scope', label: '抖音达人时间范围', defaultValue: 'FIFTEEN_DAYS', componentProps: { options: Bytedance_aweme_fan_time_scope } },
  { component: 'Select', fieldName: 'aweme_fan_categories', label: '抖音达人分类', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择抖音达人分类' } },
  { component: 'Select', fieldName: 'aweme_fan_accounts', label: '抖音达人账号', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择抖音达人账号' } },
  { component: 'Select', fieldName: 'superior_popularity_type', label: '媒体定向', defaultValue: 'NONE', componentProps: { options: Bytedance_superior_popularity_type } },
  { component: 'Select', fieldName: 'flow_package', label: '定向逻辑', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择定向流量包' } },
  { component: 'Select', fieldName: 'exclude_flow_package', label: '排除定向逻辑', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择排除流量包' } },
  { component: 'Select', fieldName: 'platform', label: '操作系统平台', defaultValue: [], componentProps: { options: Bytedance_platform, mode: 'multiple', placeholder: '请选择操作系统平台' } },
  { component: 'Select', fieldName: 'android_osv', label: 'Android版本', defaultValue: '0.0', componentProps: { options: Bytedance_android_osv, placeholder: '请选择Android版本' } },
  { component: 'Select', fieldName: 'ios_osv', label: 'iOS版本', defaultValue: '0.0', componentProps: { options: Bytedance_ios_osv, placeholder: '请选择iOS版本' } },
  { component: 'Select', fieldName: 'harmony_osv', label: 'Harmony版本', componentProps: { options: Bytedance_harmony_osv, placeholder: '请选择Harmony版本' } },
  { component: 'Select', fieldName: 'device_type', label: '设备类型', defaultValue: [], componentProps: { options: Bytedance_device_type, mode: 'multiple', placeholder: '请选择设备类型' } },
  { component: 'Select', fieldName: 'ac', label: '网络类型', defaultValue: [], componentProps: { options: Bytedance_ac, mode: 'multiple', placeholder: '请选择网络类型' } },
  { component: 'Select', fieldName: 'carrier', label: '运营商', defaultValue: [], componentProps: { options: Bytedance_carrier, mode: 'multiple', placeholder: '请选择运营商' } },
  { component: 'Select', fieldName: 'carrier_region_optimize', label: '运营商区域优选', defaultValue: '', componentProps: { options: Bytedance_carrier_region_optimize } },
  { component: 'Select', fieldName: 'hide_if_exists', label: '过滤已安装', defaultValue: 'UNLIMITED', componentProps: { options: Bytedance_simple_hide_if_exists } },
  { component: 'Select', fieldName: 'hide_if_converted', label: '过滤已转化用户', defaultValue: 'NO_EXCLUDE', componentProps: { options: Bytedance_hide_if_converted } },
  { component: 'Select', fieldName: 'converted_time_duration', label: '过滤时间范围', defaultValue: 'NONE', componentProps: { options: Bytedance_converted_time_duration } },
  { component: 'Select', fieldName: 'filter_event', label: '自定义过滤事件', defaultValue: [], componentProps: { options: Bytedance_filter_event, mode: 'multiple', placeholder: '请选择转化事件' } },
  { component: 'Select', fieldName: 'filter_aweme_abnormal_active', label: '过滤抖音异常活跃用户', defaultValue: 'OFF', componentProps: { options: Bytedance_simple_filter_aweme_abnormal_active } },
  { component: 'InputNumber', fieldName: 'filter_aweme_fans_count', label: '过滤高关注数用户', defaultValue: undefined, componentProps: { placeholder: '请输入粉丝数过滤值', min: 0 } },
  { component: 'Select', fieldName: 'filter_own_aweme_fans', label: '过滤自己的粉丝', defaultValue: 'OFF', componentProps: { options: Bytedance_simple_filter_own_aweme_fans } },
  { component: 'Select', fieldName: 'device_brand', label: '设备品牌', defaultValue: [], componentProps: { options: Bytedance_device_brand, mode: 'multiple', placeholder: '请选择设备品牌' } },
  { component: 'Select', fieldName: 'launch_price', label: '设备价格', defaultValue: [], componentProps: { options: Bytedance_launch_price, mode: 'multiple', placeholder: '请选择设备价格' } },
  { component: 'Select', fieldName: 'auto_extend_targets', label: '智能定向', defaultValue: [], componentProps: { options: Bytedance_auto_extend_targets, mode: 'multiple', placeholder: '请选择智能定向' } },
  // { component: 'Select', fieldName: 'dpa_city', label: 'DPA地域匹配-商品所在城市', defaultValue: 'OFF', componentProps: { options: Bytedance_dpa_city } },
  // { component: 'Select', fieldName: 'dpa_lbs', label: 'DPA适地性服务', defaultValue: 'OFF', componentProps: { options: Bytedance_dpa_lbs } },
  // { component: 'Select', fieldName: 'dpa_rta_switch', label: 'DPA RTA重定向开关', defaultValue: 'OFF', componentProps: { options: Bytedance_dpa_rta_switch } },
  // { component: 'Input', fieldName: 'rta_id', label: 'RTA策略ID', componentProps: { placeholder: '请输入RTA策略ID' } },
  // { component: 'Select', fieldName: 'dpa_rta_recommend_type', label: 'RTA推荐逻辑', defaultValue: 'ONLY', componentProps: { options: Bytedance_dpa_rta_recommend_type } },
];

// ==================== schema 注册表（含公共 select） ====================
const audienceSchemaMap = new Map<string, Array<any>>();
audienceSchemaMap.set('package', [typeSelectField, ...packageFields]);
audienceSchemaMap.set('normal', [typeSelectField, ...normalFields]);

// ==================== 单个 Form 实例 ====================
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: audienceSchemaMap.get('package'),
});

// ==================== 切换定向类型 ====================
function handleTypeChange(type: string) {
  const schema = audienceSchemaMap.get(type) ?? [];
  formApi.setState({ schema });

  // 应用新 schema 的默认值（跳过 audience_type 防止覆盖当前选中值）
  const defaultValues: Record<string, any> = {};
  schema.forEach((item) => {
    if (
      item.fieldName &&
      item.fieldName !== 'audience_type' &&
      item.defaultValue !== undefined
    ) {
      defaultValues[item.fieldName] = item.defaultValue;
    }
  });
  if (Object.keys(defaultValues).length) {
    formApi.setValues(defaultValues);
  }
}

// ==================== 对外暴露 ====================
async function submitBytedanceConfig() {
  const values = await formApi.getValues();
  const { audience_type: type = 'package', ...config } = values;
  return { type, ...config };
}

async function echoBytedanceConfig(data: any) {
  const type = data.type || data.config?.type || 'package';
  formApi.setState({ schema: audienceSchemaMap.get(type) ?? [] });

  const configData = data.config || data;
  await formApi.setValues({ audience_type: type, ...configData });
}

async function popUpCancel() {
  formApi.resetForm();
  formApi.setState({ schema: audienceSchemaMap.get('package') ?? [] });
}

defineExpose({
  submitBytedanceConfig,
  echoBytedanceConfig,
  popUpCancel,
});
</script>

<template>
  <div>
    <Form />
  </div>
</template>

<style scoped lang="scss"></style>
