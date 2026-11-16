<script setup lang="ts" name="BytedanceAudienceForm">
import { useVbenForm } from '@vben/common-ui';

import { message } from 'ant-design-vue';

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
  // ===== 智擎版 =====
  BytedanceStd_age,
  BytedanceStd_android_osv,
  BytedanceStd_auto_extend_targets,
  BytedanceStd_district,
  BytedanceStd_filter_own_aweme_fans,
  BytedanceStd_gender,
  BytedanceStd_harmony_osv,
  BytedanceStd_hide_if_converted,
  BytedanceStd_hide_if_exists,
  BytedanceStd_ios_osv,
  BytedanceStd_launch_price,
  BytedanceStd_region_recommend,
  BytedanceStd_smart_extend,
  // ===== 全域版 =====
  BytedanceUnit_age,
  BytedanceUnit_district,
  BytedanceUnit_gender,
  BytedanceUnit_hide_if_converted,
  BytedanceUnit_location_type,
  BytedanceUnit_platform,
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
      { label: '智擎版', value: 'std' },
      { label: '全域版', value: 'unit' },
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

// ==================== 智擎版 schema 字段 ====================
const stdFields = [
  { component: 'Select', fieldName: 'gender', label: '性别定向', defaultValue: 'GENDER_UNLIMITED', componentProps: { options: BytedanceStd_gender, placeholder: '请选择性别定向' } },
  { component: 'Select', fieldName: 'age', label: '年龄定向', defaultValue: [], componentProps: { options: BytedanceStd_age, mode: 'multiple', placeholder: '请选择年龄定向' } },
  { component: 'Select', fieldName: 'district', label: '地域定向', defaultValue: 'NONE', componentProps: { options: BytedanceStd_district, placeholder: '请选择地域定向' } },
  { component: 'Input', fieldName: 'region_version', label: '行政区域版本号', defaultValue: '2.3.2', componentProps: { placeholder: '仅允许 2.3.2 版本号' } },
  { component: 'Select', fieldName: 'city', label: '地域省市/区县', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择地域省市/区县' } },
  { component: 'Select', fieldName: 'location_type', label: '位置类型', defaultValue: 'ALL', componentProps: { options: Bytedance_location_type, placeholder: '请选择位置类型' } },
  { component: 'Input', fieldName: 'geolocation', label: '地域地图位置', defaultValue: [], componentProps: { placeholder: 'JSON数组格式: [{"radius":0,"name":"","long":0,"lat":0}]' } },
  { component: 'Select', fieldName: 'region_recommend', label: '地域智能放量', defaultValue: 'OFF', componentProps: { options: BytedanceStd_region_recommend, placeholder: '请选择地域智能放量' } },
  { component: 'Select', fieldName: 'android_osv', label: '最低安卓版本', defaultValue: 'NONE', componentProps: { options: BytedanceStd_android_osv, placeholder: '请选择最低安卓版本' } },
  { component: 'Select', fieldName: 'ios_osv', label: '最低IOS版本', defaultValue: 'NONE', componentProps: { options: BytedanceStd_ios_osv, placeholder: '请选择最低IOS版本' } },
  { component: 'Select', fieldName: 'harmony_osv', label: '最低鸿蒙版本', defaultValue: 'NONE', componentProps: { options: BytedanceStd_harmony_osv, placeholder: '请选择最低鸿蒙版本' } },
  { component: 'Select', fieldName: 'hide_if_converted', label: '过滤已转化用户', defaultValue: 'NO_EXCLUDE', componentProps: { options: BytedanceStd_hide_if_converted, placeholder: '请选择过滤已转化用户' } },
  { component: 'Select', fieldName: 'hide_if_exists', label: '过滤已安装', defaultValue: 'UNLIMITED', componentProps: { options: BytedanceStd_hide_if_exists, placeholder: '请选择过滤已安装' } },
  { component: 'Select', fieldName: 'retargeting_tags_include', label: '定向人群包', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择定向人群包' } },
  { component: 'Select', fieldName: 'retargeting_tags_exclude', label: '排除人群包', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择排除人群包' } },
  { component: 'Select', fieldName: 'converted_time_duration', label: '过滤时间范围', defaultValue: 'NONE', componentProps: { options: Bytedance_converted_time_duration, placeholder: '请选择过滤时间范围' } },
  { component: 'Select', fieldName: 'platform', label: '应用类型', defaultValue: [], componentProps: { options: Bytedance_platform, mode: 'multiple', placeholder: '请选择应用类型' } },
  { component: 'Select', fieldName: 'interest_action_mode', label: '行为兴趣', defaultValue: 'UNLIMITED', componentProps: { options: Bytedance_interest_action_mode, placeholder: '请选择行为兴趣' } },
  { component: 'Select', fieldName: 'interest_categories', label: '兴趣类目词', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择兴趣类目词' } },
  { component: 'Select', fieldName: 'interest_words', label: '兴趣关键词', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择兴趣关键词' } },
  { component: 'Select', fieldName: 'action_days', label: '用户行为天数', defaultValue: 7, componentProps: { options: Bytedance_action_days, placeholder: '请选择用户行为天数' } },
  { component: 'Select', fieldName: 'action_categories', label: '行为类目词', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择行为类目词' } },
  { component: 'Select', fieldName: 'action_words', label: '行为关键词', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择行为关键词' } },
  { component: 'Select', fieldName: 'filter_own_aweme_fans', label: '过滤自己的粉丝', defaultValue: 'OFF', componentProps: { options: BytedanceStd_filter_own_aweme_fans, placeholder: '请选择过滤自己的粉丝' } },
  { component: 'Select', fieldName: 'ac', label: '网络类型', defaultValue: [], componentProps: { options: Bytedance_ac, mode: 'multiple', placeholder: '请选择网络类型' } },
  { component: 'Select', fieldName: 'launch_price', label: '手机价格', defaultValue: '', componentProps: { options: BytedanceStd_launch_price, placeholder: '请选择手机价格区间（须为500的整数）' } },
  { component: 'Select', fieldName: 'smart_extend', label: '智能拓展', defaultValue: 'OFF', componentProps: { options: BytedanceStd_smart_extend, placeholder: '请选择智能拓展' } },
  { component: 'Select', fieldName: 'device_brand', label: '设备品牌', defaultValue: [], componentProps: { options: Bytedance_device_brand, mode: 'multiple', placeholder: '请选择设备品牌' } },
  { component: 'Select', fieldName: 'device_type', label: '设备类型', defaultValue: [], componentProps: { options: Bytedance_device_type, mode: 'multiple', placeholder: '请选择设备类型' } },
  { component: 'Select', fieldName: 'superior_popularity_type', label: '优质媒体', defaultValue: 'NONE', componentProps: { options: Bytedance_superior_popularity_type, placeholder: '请选择优质媒体' } },
  { component: 'Select', fieldName: 'flow_package', label: '定向流量包', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择定向流量包' } },
  { component: 'Select', fieldName: 'exclude_flow_package', label: '排除流量包', defaultValue: [], componentProps: { options: [], mode: 'multiple', filterOption: true, showSearch: true, placeholder: '请选择排除流量包' } },
  { component: 'Select', fieldName: 'auto_extend_targets', label: '智能定向', defaultValue: [], componentProps: { options: BytedanceStd_auto_extend_targets, mode: 'multiple', placeholder: '请选择智能定向' } },
  { component: 'Select', fieldName: 'dpa_rta_switch', label: 'RTA重定向开关', defaultValue: 'OFF', componentProps: { options: Bytedance_dpa_rta_switch, placeholder: '请选择RTA重定向开关' } },
  { component: 'InputNumber', fieldName: 'rta_id', label: 'RTA策略ID', defaultValue: undefined, componentProps: { placeholder: '请输入RTA策略ID' } },
  { component: 'Select', fieldName: 'dpa_rta_recommend_type', label: 'RTA推荐类型', defaultValue: 'ONLY', componentProps: { options: Bytedance_dpa_rta_recommend_type, placeholder: '请选择RTA推荐类型' } },
];

// ==================== 全域版 schema 字段 ====================
const unitFields = [
  {
    component: 'Select',
    fieldName: 'district',
    label: '地域类型',
    defaultValue: 'NONE',
    componentProps: {
      options: BytedanceUnit_district,
      placeholder: '请选择地域类型',
    },
  },
  {
    type: 'array',
    fieldName: 'geolocation',
    label: '商圈点位',
    defaultValue: [],
    dependencies: {
      show: (values: Record<string, any>) =>
        values.district === 'BUSINESS_DISTRICT',
      triggerFields: ['district'],
    },
    arrayProps: {
      addButtonText: '添加点位',
      createRow: () => ({
        lat: undefined,
        long: undefined,
        name: '',
        radius: 6000,
      }),
      showIndex: true,
    },
    children: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '地点名称',
        componentProps: { placeholder: '地点名称' },
      },
      {
        component: 'InputNumber',
        fieldName: 'long',
        label: '经度',
        componentProps: { precision: 6, placeholder: '经度' },
      },
      {
        component: 'InputNumber',
        fieldName: 'lat',
        label: '纬度',
        componentProps: { precision: 6, placeholder: '纬度' },
      },
      {
        component: 'InputNumber',
        fieldName: 'radius',
        label: '半径(m)',
        componentProps: { max: 30000, min: 3000, placeholder: '3000~30000' },
      },
    ],
  },
  {
    component: 'Input',
    fieldName: 'region_version',
    label: '行政区域版本',
    defaultValue: '2.3.2',
    dependencies: {
      show: (values: Record<string, any>) => values.district === 'REGION',
      triggerFields: ['district'],
    },
    componentProps: { placeholder: '当前仅支持 2.3.2' },
  },
  {
    component: 'Select',
    fieldName: 'city',
    label: '省市/区县',
    defaultValue: [],
    dependencies: {
      show: (values: Record<string, any>) => values.district === 'REGION',
      triggerFields: ['district'],
    },
    componentProps: {
      filterOption: true,
      mode: 'tags',
      options: [],
      placeholder: '输入行政区ID后回车（来自行政信息接口）',
      showSearch: true,
    },
  },
  {
    component: 'Select',
    fieldName: 'location_type',
    label: '位置类型',
    defaultValue: 'ALL',
    dependencies: {
      show: (values: Record<string, any>) => values.district !== 'NONE',
      triggerFields: ['district'],
    },
    componentProps: {
      options: BytedanceUnit_location_type,
      placeholder: '请选择位置类型',
    },
  },
  {
    component: 'Select',
    fieldName: 'gender',
    label: '性别',
    defaultValue: 'NONE',
    componentProps: {
      options: BytedanceUnit_gender,
      placeholder: '请选择性别',
    },
  },
  {
    component: 'Select',
    fieldName: 'age',
    label: '年龄',
    defaultValue: [],
    componentProps: {
      mode: 'multiple',
      options: BytedanceUnit_age,
      placeholder: '请选择年龄区间',
    },
  },
  {
    component: 'Select',
    fieldName: 'platform',
    label: '操作系统',
    defaultValue: [],
    componentProps: {
      mode: 'multiple',
      options: BytedanceUnit_platform,
      placeholder: '请选择操作系统',
    },
  },
  {
    component: 'Select',
    fieldName: 'hide_if_converted',
    label: '过滤已转化用户',
    defaultValue: 'NO_EXCLUDE',
    componentProps: {
      options: BytedanceUnit_hide_if_converted,
      placeholder: '请选择过滤方式',
    },
  },
];

// ==================== schema 注册表（含公共 select） ====================
const audienceSchemaMap = new Map<string, Array<any>>();
audienceSchemaMap.set('package', [typeSelectField, ...packageFields]);
audienceSchemaMap.set('normal', [typeSelectField, ...normalFields]);
audienceSchemaMap.set('std', [typeSelectField, ...stdFields]);
audienceSchemaMap.set('unit', [typeSelectField, ...unitFields]);

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

  // 全域定向只在本地保存，不调用媒体定向接口，统一按常规定向(type=normal)入库
  let submitType = type;
  if (type === 'unit') {
    submitType = 'normal';
    config.unitAudience = true;
    if (Array.isArray(config.geolocation)) {
      config.geolocation = config.geolocation.filter(
        (item: Record<string, any>) =>
          item && item.long !== undefined && item.lat !== undefined,
      );
    } else {
      config.geolocation = [];
    }
    if (config.geolocation.length > 1000) {
      message.error('商圈点位最多 1000 个');
      throw new Error('too many geolocation points');
    }
    if (config.district === 'BUSINESS_DISTRICT' && config.geolocation.length === 0) {
      message.error('选择商圈地域时至少需要添加 1 个点位');
      throw new Error('geolocation required');
    }
    if (Array.isArray(config.city)) {
      config.city = config.city
        .map((id: number | string) => Number(id))
        .filter((id: number) => Number.isFinite(id));
    }
    if (config.district === 'REGION' && !config.city?.length) {
      message.error('选择行政区域时请选择省市/区县');
      throw new Error('city required');
    }
    const ageList: string[] = config.age || [];
    const coarseAges = new Set([
      'AGE_ABOVE_50',
      'AGE_BETWEEN_18_23',
      'AGE_BETWEEN_31_40',
      'AGE_BETWEEN_41_49',
    ]);
    const hasCoarse = ageList.some((item) => coarseAges.has(item));
    const hasFine = ageList.some((item) => !coarseAges.has(item));
    if (hasCoarse && hasFine) {
      message.error('年龄两套枚举不能同时选择');
      throw new Error('mixed age enums');
    }
    if (config.district !== 'REGION') {
      delete config.region_version;
      delete config.city;
    }
    if (config.district === 'NONE') {
      delete config.location_type;
    }
  }

  return { type: submitType, ...config };
}

async function echoBytedanceConfig(data: any) {
  const rawType = data.type || data.config?.type || 'package';
  const configData = { ...(data.config || data) };
  const isUnitAudience =
    rawType === 'normal' && Boolean(configData.unitAudience);
  const type = isUnitAudience ? 'unit' : rawType;
  delete configData.unitAudience;

  formApi.setState({ schema: audienceSchemaMap.get(type) ?? [] });
  if (type === 'unit' && Array.isArray(configData.city)) {
    configData.city = configData.city.map((id: number | string) => String(id));
  }
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
