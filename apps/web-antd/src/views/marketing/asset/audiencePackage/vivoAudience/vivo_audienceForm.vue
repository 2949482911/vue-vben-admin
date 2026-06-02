<script lang="ts" setup>
import { useVbenForm } from '@vben/common-ui';
import { RadioGroup, RadioButton, CheckboxGroup } from 'ant-design-vue';
import { computed, h, ref } from 'vue';
import TreeSelector from '../TreeSelector.vue';
import { vivoTagData } from './vivoTagData';
import type { AdVivoConfig } from '../audiencePackageType';

const vivoConfig = ref({
  sexList: [],
  ageList: [],
  interestSet: [],
  installedApp: 1,
  androidVersionSet: [],
  phonePriceSet: [],
  network: 1,
  phoneSeriesSet: [],
  networkOperatorSet: [],
  region: {
    regionCodeList: [],
    stayType: 1,
  },
  installBehavior: {
    period: -1,
    behavior: 2,
  },
  startBehavior: {
    period: -1,
    behavior: 2,
  },
});

/** 按点分隔路径读取嵌套对象的值 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((o, k) => o?.[k], obj);
};

/** 按点分隔路径设置嵌套对象的值 */
const setNestedValue = (obj: any, path: string, val: any): void => {
  const keys = path.split('.');
  const last = keys.pop()!;
  const target = keys.reduce((o, k) => o?.[k], obj);
  if (target) target[last] = val;
};

/**
 * 切换"不限/设置"单选框时的清空公用方法
 * @param val 当前选中的单选框值 (包含字符串'0'、数字0等"不限"值)
 * @param configKey vivoConfig 对象内部对应的属性路径，支持点分隔（如 'region.regionCodeList'）
 * @param fieldName 可选：Vben Form 对应的字段名（如果是纯自定义 Slot 没在 Schema 注册则不传）
 */
const handleTargetingChange = (val: any, configKey: string, fieldName?: string) => {
  if (val === '0' || val === 0 || val === '-1' || val === -1) {
    const originVal = getNestedValue(vivoConfig.value, configKey);

    // 1. 清空自定义的大存储对象 vivoConfig 内部的嵌套值
    if (configKey && originVal !== undefined) {
      setNestedValue(vivoConfig.value, configKey, Array.isArray(originVal) ? [] : undefined);
    }

    // 2. 同步清空 Vben Form 内部收集的表单值
    if (fieldName) {
      formApi.setFieldValue(fieldName, Array.isArray(originVal) ? [] : undefined);
    }
  }
};

/**关闭弹框提交vivoConfig */
async function submitVivoConfig() {
  // 直接返回 vivoConfig，因为所有自定义组件 v-model 都绑在它上面
  return vivoConfig.value;
}

/**编辑vivoConfig回显展示 */
async function echoVivoConfig(params: AdVivoConfig) {
  const config = params.config || {};
  vivoConfig.value = {
    sexList: config.sexList || [],
    ageList: config.ageList || [],
    interestSet: config.interestSet || [],
    installedApp: config.installedApp ?? 1,
    androidVersionSet: config.androidVersionSet || [],
    phonePriceSet: config.phonePriceSet || [],
    network: config.network ?? 1,
    phoneSeriesSet: config.phoneSeriesSet || [],
    networkOperatorSet: config.networkOperatorSet || [],
    region: {
      regionCodeList: config.region?.regionCodeList || [],
      stayType: config.region?.stayType ?? 1,
    },
    installBehavior: {
      period: config.installBehavior?.period ?? -1,
      behavior: config.installBehavior?.behavior ?? 2,
    },
    startBehavior: {
      period: config.startBehavior?.period ?? -1,
      behavior: config.startBehavior?.behavior ?? 2,
    },
  } as any;

  // 恢复各 RadioGroup 的"不限/设置"状态
  sexListType.value = (config.sexList && config.sexList.length > 0) ? '1' : '0';
  ageType.value = (config.ageList && config.ageList.length > 0) ? '1' : '0';
  phonePriceSetType.value = (config.phonePriceSet && config.phonePriceSet.length > 0) ? '1' : '0';
  phoneSeriesSetType.value = (config.phoneSeriesSet && config.phoneSeriesSet.length > 0) ? '1' : '0';
  networkOperatorSetType.value = (config.networkOperatorSet && config.networkOperatorSet.length > 0) ? '1' : '0';
  androidVersionSetType.value = (config.androidVersionSet && config.androidVersionSet.length > 0) ? '1' : '0';
  regionType.value = (config.region?.regionCodeList && config.region.regionCodeList.length > 0) ? '1' : '0';
  interestSetType.value = (config.interestSet && config.interestSet.length > 0) ? 1 : 0;
}

/**处理枚举公用方法 */
const getTagOptions = (key: string) => {
  const list = (vivoTagData as any)?.data?.[key] || [];
  return list.map((item: any) => ({
    label: item.tagName,
    value: item.id,
  }));
};

/**关闭弹框时清空vivoConfig */
async function popUpVivoCancel() {
  await formApi.resetForm();
  sexListType.value = '0';
  phonePriceSetType.value = '0';
  phoneSeriesSetType.value = '0';
  networkOperatorSetType.value = '0';
  androidVersionSetType.value = '0';
  ageType.value = '0';
  regionType.value = '0';
  interestSetType.value = 0;
  vivoConfig.value = {
    sexList: [],
    ageList: [],
    interestSet: [],
    installedApp: 1,
    androidVersionSet: [],
    phonePriceSet: [],
    network: 1,
    phoneSeriesSet: [],
    networkOperatorSet: [],
    region: {
      regionCodeList: [],
      stayType: 1,
    },
    installBehavior: {
      period: -1,
      behavior: 2,
    },
    startBehavior: {
      period: -1,
      behavior: 2,
    },
  };
}

//----------性别------------
const sexListType = ref<string>('0');
const sexOptions = computed(() => getTagOptions('sex'));

//----------购机价格------------
const phonePriceSetType = ref<string>('0');
const phonePriceSetOptions = computed(() => getTagOptions('phonePrice'));

//----------手机系列------------
const phoneSeriesSetType = ref<string>('0');
const phoneSeriesSetOptions = computed(() => getTagOptions('phoneSeries'));

//----------网络运营商------------
const networkOperatorSetType = ref<string>('0');
const networkOperatorSetOptions = computed(() => getTagOptions('networkOperator'));

//----------安卓版本------------
const androidVersionSetType = ref<string>('0');
const androidVersionSetOptions = computed(() => getTagOptions('androidVersion'));

//----------用户年龄id列表------------
const ageType = ref<string>('0');
const ageOptions = computed(() => getTagOptions('age'));

//----------地域------------
const regionType = ref<string>('0');

//----------兴趣行为------------
const interestSetType = ref<number>(0);

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
      component: 'Input',
      fieldName: 'sexList',
      label: '用户性别',
      defaultValue: [],
      rules: computed(() => {
        return sexListType.value === '1' ? 'required' : '';
      }) as any,
    },
    {
      component: 'Input',
      fieldName: 'ageList',
      label: '用户年龄',
      defaultValue: [],
      rules: computed(() => {
        return ageType.value === '1' ? 'required' : '';
      }) as any,
    },
    {
      component: 'Input',
      fieldName: 'installedApp',
      label: '安装定向',
    },
    {
      component: 'Input',
      fieldName: 'network',
      label: '网络',
    },
    {
      component: 'Input',
      fieldName: 'interestSet',
      label: '兴趣行为',
      defaultValue: [],
      rules: computed(() => {
        return interestSetType.value === 1 ? 'required' : '';
      }) as any,
    },
    {
      component: 'Input',
      fieldName: 'androidVersionSet',
      label: '安卓版本',
      defaultValue: [],
      rules: computed(() => {
        return androidVersionSetType.value === '1' ? 'required' : '';
      }) as any,
    },
    {
      component: 'Input',
      fieldName: 'phonePriceSet',
      label: '购机价格',
      defaultValue: [],
      rules: computed(() => {
        return phonePriceSetType.value === '1' ? 'required' : '';
      }) as any,
    },
    {
      component: 'Input',
      fieldName: 'phoneSeriesSet',
      label: '购机系列',
      defaultValue: [],
      rules: computed(() => {
        return phoneSeriesSetType.value === '1' ? 'required' : '';
      }) as any,
    },
    {
      component: 'Input',
      fieldName: 'networkOperatorSet',
      label: '网络运营商',
      defaultValue: [],
      rules: computed(() => {
        return networkOperatorSetType.value === '1' ? 'required' : '';
      }) as any,
    },
    {
      component: 'Divider',
      fieldName: 'regionalOrientation',
      label: '',
      renderComponentContent: () => ({
        default: () =>
          h(
            'span',
            {
              style: {
                fontWeight: 'bold',
                color: '#1677ff',
              },
            },
            '地域定向',
          ),
      }),
    },
    {
      component: 'Input',
      fieldName: 'regionCodeList',
      label: '地域定向',
      defaultValue: [],
      rules: computed(() => {
        return regionType.value === '1' ? 'required' : '';
      }) as any,
    },
    {
      component: 'Input',
      fieldName: 'stayType',
      label: '常驻类型',
      dependencies: {
        show: (values) => {
          return !!(values.regionCodeList && values.regionCodeList.length > 0);
        },
        triggerFields: ['regionCodeList'],
      },
      defaultValue: 1,
      rules: 'required',
    },
    {
      component: 'Divider',
      fieldName: 'installationBehavior',
      label: '',
      renderComponentContent: () => ({
        default: () =>
          h(
            'span',
            {
              style: {
                fontWeight: 'bold',
                color: '#1677ff',
              },
            },
            '安装行为',
          ),
      }),
    },
    {
      component: 'Input',
      fieldName: 'period',
      label: '时间范围',
    },
    {
      component: 'Input',
      fieldName: 'behavior',
      label: '应用行为',
    },
    {
      component: 'Divider',
      fieldName: 'behaviorDivider',
      label: '',
      renderComponentContent: () => ({
        default: () =>
          h(
            'span',
            {
              style: {
                fontWeight: 'bold',
                color: '#1677ff',
              },
            },
            '启动行为',
          ),
      }),
    },
    {
      component: 'Input',
      fieldName: 'startPeriod',
      label: '时间范围',
    },
    {
      component: 'Input',
      fieldName: 'startBehavior',
      label: '应用行为',
    },
  ],
});

defineExpose({ submitVivoConfig, popUpVivoCancel, echoVivoConfig });
</script>

<template>
  <div>
    <Form>
      <template #regionCodeList>
        <div>
          <RadioGroup
            v-model:value="regionType"
            button-style="solid"
            @change="
              (e) =>
                handleTargetingChange(e.target.value, 'region.regionCodeList', 'regionCodeList')
            "
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <TreeSelector
            v-if="regionType === '1'"
            v-model:value="vivoConfig.region.regionCodeList"
            :tree-data="vivoTagData.data.region"
            placeholder="搜索省份、城市"
            @update:value="(val: any) => formApi.setFieldValue('regionCodeList', val)"
          />
        </div>
      </template>
      <template #stayType>
        <RadioGroup v-model:value="vivoConfig.region.stayType" button-style="solid">
          <RadioButton :value="1">常驻</RadioButton>
          <RadioButton :value="2">当前</RadioButton>
        </RadioGroup>
      </template>
      <template #sexList>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="sexListType"
            button-style="solid"
            @change="(e) => handleTargetingChange(e.target.value, 'sexList', 'sexList')"
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <div v-if="sexListType === '1'">
            <CheckboxGroup v-model:value="vivoConfig.sexList" :options="sexOptions" />
          </div>
        </div>
      </template>
      <template #ageList>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="ageType"
            button-style="solid"
            @change="(e) => handleTargetingChange(e.target.value, 'ageList', 'ageList')"
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <div v-if="ageType === '1'">
            <CheckboxGroup v-model:value="vivoConfig.ageList" :options="ageOptions" />
          </div>
        </div>
      </template>
      <template #installedApp>
        <RadioGroup v-model:value="vivoConfig.installedApp" button-style="solid">
          <RadioButton :value="1">不限</RadioButton>
          <RadioButton :value="2">未安装</RadioButton>
          <RadioButton :value="3">已安装</RadioButton>
        </RadioGroup>
      </template>
      <template #network>
        <RadioGroup v-model:value="vivoConfig.network" button-style="solid">
          <RadioButton :value="1">不限</RadioButton>
          <RadioButton :value="2">WIFI</RadioButton>
        </RadioGroup>
      </template>
      <template #interestSet>
        <div>
          <RadioGroup
            v-model:value="interestSetType"
            button-style="solid"
            @change="(e) => handleTargetingChange(e.target.value, 'interestSet', 'interestSet')"
          >
            <RadioButton :value="0">不限</RadioButton>
            <RadioButton :value="-1">系统优选</RadioButton>
            <RadioButton :value="1">设置</RadioButton>
          </RadioGroup>
          <TreeSelector
            v-if="interestSetType === 1"
            v-model:value="vivoConfig.interestSet"
            :tree-data="vivoTagData.data.interest"
            placeholder="搜索兴趣标签、行业"
          />
        </div>
      </template>
      <template #androidVersionSet>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="androidVersionSetType"
            button-style="solid"
            @change="
              (e) => handleTargetingChange(e.target.value, 'androidVersionSet', 'androidVersionSet')
            "
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <div v-if="androidVersionSetType === '1'">
            <CheckboxGroup
              v-model:value="vivoConfig.androidVersionSet"
              :options="androidVersionSetOptions"
            />
          </div>
        </div>
      </template>
      <template #phonePriceSet>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="phonePriceSetType"
            button-style="solid"
            @change="(e) => handleTargetingChange(e.target.value, 'phonePriceSet', 'phonePriceSet')"
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <div v-if="phonePriceSetType === '1'">
            <CheckboxGroup
              v-model:value="vivoConfig.phonePriceSet"
              :options="phonePriceSetOptions"
            />
          </div>
        </div>
      </template>
      <template #phoneSeriesSet>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="phoneSeriesSetType"
            button-style="solid"
            @change="
              (e) => handleTargetingChange(e.target.value, 'phoneSeriesSet', 'phoneSeriesSet')
            "
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <div v-if="phoneSeriesSetType === '1'">
            <CheckboxGroup
              v-model:value="vivoConfig.phoneSeriesSet"
              :options="phoneSeriesSetOptions"
            />
          </div>
        </div>
      </template>
      <template #networkOperatorSet>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="networkOperatorSetType"
            button-style="solid"
            @change="
              (e) =>
                handleTargetingChange(e.target.value, 'networkOperatorSet', 'networkOperatorSet')
            "
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <div v-if="networkOperatorSetType === '1'">
            <CheckboxGroup
              v-model:value="vivoConfig.networkOperatorSet"
              :options="networkOperatorSetOptions"
            />
          </div>
        </div>
      </template>
      <template #period>
        <RadioGroup v-model:value="vivoConfig.installBehavior.period" button-style="solid">
          <RadioButton v-for="d in [-1, 7, 30, 180, 356]" :key="d" :value="d">{{
            d === -1 ? '标识历史永久' : d + '天'
          }}</RadioButton>
        </RadioGroup>
      </template>
      <template #behavior>
        <RadioGroup v-model:value="vivoConfig.installBehavior.behavior" button-style="solid">
          <RadioButton :value="2">未启动</RadioButton>
          <RadioButton :value="1">启动</RadioButton>
          <RadioButton :value="3">安装</RadioButton>
        </RadioGroup>
      </template>
      <template #startPeriod>
        <RadioGroup v-model:value="vivoConfig.startBehavior.period" button-style="solid">
          <RadioButton v-for="d in [-1, 7, 30, 180, 356]" :key="d" :value="d">{{
            d === -1 ? '标识历史永久' : d + '天'
          }}</RadioButton>
        </RadioGroup>
      </template>
      <template #startBehavior>
        <RadioGroup v-model:value="vivoConfig.startBehavior.behavior" button-style="solid">
          <RadioButton :value="2">未启动</RadioButton>
          <RadioButton :value="1">启动</RadioButton>
          <RadioButton :value="3">安装</RadioButton>
        </RadioGroup>
      </template>
    </Form>
  </div>
</template>

<style lang="scss" scoped></style>
