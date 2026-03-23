<script lang="ts" setup>
import { advertiserApi, targetedPackageApi } from '#/api';
import { useVbenForm, useVbenModal } from '@vben/common-ui';
import { message, RadioGroup, RadioButton, CheckboxGroup } from 'ant-design-vue';
import { computed, h, ref, watch } from 'vue';
import TreeSelector from './TreeSelector.vue'
import { tagData } from './tagData';
import { ACTIVE_PLATFORM } from '#/constants/locales';
import type { AdConfig } from './audiencePackageType';

const props = defineProps<{
  displayValue?: AdConfig
}>();

/**处理枚举公用方法 */
const getTagOptions = (key: string) => {
  const list = (tagData as any)?.data?.[key] || [];
  return list.map((item: any) => ({
    label: item.tagName,
    value: item.id,
  }));
};

/**清除所选公用方法 */
const handleChange = (val: any,strList?:any,ids?:any) => {
  if (val === '0' || val === 0) {
    formApi.setFieldValue(strList, []); // 同步清空表单字段
    ids.value = [];
  }
};

const emit = defineEmits(['pageReload']);

const [titlePackageModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onCancel() {
    await popUpCancel();
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return
    }
    const formValue = await formApi.getValues()
    const formValueAll = {
      id:'',
      localAdvertiserId:localAdId.value,
      name:formValue.name,
      platform:formValue.platform,
      platformAdvertiserId:formValue.platformAdvertiserId,
      remark:formValue.remark,
      config:{
        sexList:formValue.sexList || [],
        ageList:formValue.ageList || [],
        interestSet:formValue.interestSet || [],
        installedApp:installedAppType.value,
        androidVersionSet:formValue.androidVersionSet,
        phonePriceSet:formValue.phonePriceSet,
        network:networkType.value,
        phoneSeriesSet:formValue.phoneSeriesSet,
        networkOperatorSet:formValue.networkOperatorSet,
        region: {
          regionCodeList: formValue.regionCodeList || [],
          stayType: regionStayType.value,
        },
        installBehavior: {
          period: periodType.value,
          behavior: behaviorType.value,
        },
        startBehavior: {
          period: periodTypeVal.value,
          behavior: startBehaviorVal.value,
        },
      }
    }
    try {
      if (props.displayValue && props.displayValue.id) {
        formValueAll.id = props.displayValue.id; 
        await targetedPackageApi.fetchModifyTargetedPackage(formValueAll);
        message.success("修改成功！");
      } else {
        await targetedPackageApi.fetchNewTargetedPackage(formValueAll);
        message.success("添加成功！");
      }
      await popUpCancel();
      await modalApi.close();
      emit('pageReload');
    }catch (err) {
      console.error('保存失败:', err);
    }
  },
  async onOpened(){
    await loadAdvertiserOptions();
    if(props.displayValue && props.displayValue.id){
      const data = props.displayValue;
      formApi.setValues({
        platform: data.platform,
        name: data.name,
        platformAdvertiserId: data.platformAdvertiserId,
        remark: data.remark,
      });

      const config = data.config || {};

      // --- 性别/年龄 ---
      sexSelectedIds.value = config.sexList || [];
      sexListType.value = sexSelectedIds.value.length > 0 ? '1' : '0';
      ageListIds.value = config.ageList || [];
      ageType.value = ageListIds.value.length > 0 ? '1' : '0';

      // --- 地域 ---
      regionArr.value = config.region?.regionCodeList || [];
      regionSel.value = regionArr.value.length > 0 ? '1' : '0';
      regionStayType.value = config.region?.stayType || 1;

      // --- 兴趣行为/安装/网络 ---
      interestSetArr.value = config.interestSet || [];
      interestSetType.value = interestSetArr.value.length > 0 ? 1 : 0;
      networkType.value = config.network || 1;
      installedAppType.value = config.installedApp || 1;

      // --- 手机属性回显 ---
      androidVersionSetIds.value = config.androidVersionSet || [];
      androidVersionSetType.value = androidVersionSetIds.value.length > 0 ? '1' : '0';
      phonePriceSetIds.value = config.phonePriceSet || [];
      phonePriceSetType.value = phonePriceSetIds.value.length > 0 ? '1' : '0';
      phoneSeriesSetIds.value = config.phoneSeriesSet || [];
      phoneSeriesSetType.value = phoneSeriesSetIds.value.length > 0 ? '1' : '0';

      // --- 行为习惯 ---
      periodType.value = config.installBehavior?.period ?? -1;
      behaviorType.value = config.installBehavior?.behavior ?? 2;
      periodTypeVal.value = config.startBehavior?.period ?? -1;
      startBehaviorVal.value = config.startBehavior?.behavior ?? 2;

      localAdId.value = data.localAdvertiserId;
    }else{
      await popUpCancel();
    }
  }
});

/**弹框取消 */
async function popUpCancel(){
  await formApi.resetForm();
  sexListType.value = '0';
  sexSelectedIds.value = [];
  ageType.value = '0';
  ageListIds.value = [];
  regionSel.value = '0';
  regionArr.value = [];
  interestSetType.value = 0;
  interestSetArr.value = [];
  networkType.value = 1;
  installedAppType.value = 1;
  phonePriceSetType.value = '0';
  phonePriceSetIds.value = [];
  phoneSeriesSetType.value = '0';
  phoneSeriesSetIds.value = [];
  networkOperatorSetType.value = '0';
  networkOperatorSetIds.value = [];
  androidVersionSetType.value = '0';
  androidVersionSetIds.value = [];
  regionStayType.value = 1;
  localAdId.value = '';
  periodType.value = -1;
  behaviorType.value = 2;
  periodTypeVal.value = -1;
  startBehaviorVal.value = 2;
}

//----------性别------------
const sexListType = ref<string>('0');
const sexSelectedIds = ref<number[]>([]);
const sexOptions = computed(() => getTagOptions('sex'));
watch(sexSelectedIds, (newVal) => {
  formApi.setFieldValue('sexList', newVal);
});

//----------购机价格------------
const phonePriceSetType = ref<string>('0');
const phonePriceSetIds = ref<number[]>([]); 
const phonePriceSetOptions = computed(() => getTagOptions('phonePrice'));
watch(phonePriceSetIds, (newVal) => {
  formApi.setFieldValue('phonePriceSet', newVal);
});

//----------手机系列------------
const phoneSeriesSetType = ref<string>('0');
const phoneSeriesSetIds = ref<number[]>([]); 
const phoneSeriesSetOptions = computed(() => getTagOptions('phoneSeries'));
watch(phoneSeriesSetIds, (newVal) => {
  formApi.setFieldValue('phoneSeriesSet', newVal);
});

//----------网络运营商------------
const networkOperatorSetType = ref<string>('0');
const networkOperatorSetIds = ref<number[]>([]); 
const networkOperatorSetOptions = computed(() => getTagOptions('networkOperator'));
watch(networkOperatorSetIds, (newVal) => {
  formApi.setFieldValue('networkOperatorSet', newVal);
});

//----------安卓版本------------
const androidVersionSetType = ref<string>('0');
const androidVersionSetIds = ref<number[]>([]); 
const androidVersionSetOptions = computed(() => getTagOptions('androidVersion'));
watch(androidVersionSetIds, (newVal) => {
  formApi.setFieldValue('androidVersionSet', newVal);
});

//----------用户年龄id列表------------
const ageType = ref<string>('0');
const ageListIds = ref<number[]>([]); 
const ageOptions = computed(() => getTagOptions('age'));
watch(ageListIds, (newVal) => {
  formApi.setFieldValue('ageList', newVal);
});

//----------地域------------
const regionSel = ref<string>('0')
const regionArr = ref<number[]>([])
watch(regionArr, (newVal) => {
  formApi.setFieldValue('regionCodeList', newVal);
});

//----------兴趣行为------------
const interestSetType = ref<number>(0);
const interestSetArr = ref<number[]>([])
watch(interestSetArr, (newVal) => {
  formApi.setFieldValue('interestSet', newVal);
});

//----------常驻类型------------
const regionStayType = ref<number>(1)

//----------平台开发者id------------
const localAdId = ref<string>()

//----------安装定向------------
const installedAppType = ref<number>(1);

//----------网络------------
const networkType = ref<number>(1);

//----------安装-时间范围------------
const periodType = ref<number>(-1);

//----------安装-应用行为------------
const behaviorType = ref<number>(2);

//----------启动-时间范围------------
const periodTypeVal = ref<number>(-1);

//----------启动-应用行为------------
const startBehaviorVal = ref<number>(2);

interface DeveloperOption {
  label: string;
  value: string;
}
const advertiserOption = ref<DeveloperOption[]>([])
async function loadAdvertiserOptions(platform?: string) {
  advertiserOption.value = [];
  const res = await advertiserApi.fetchAdvertiserList({
    platform,
    putStatue: 1,
    page: 1,
    pageSize: 100000,
  });

  advertiserOption.value = res.items.map((item) => ({
    label: item.advertiserName,
    value: item.advertiserId,
  }));
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
      component: "Select",
      componentProps: {
        allowClear: true,
        options:ACTIVE_PLATFORM,
        placeholder: '请选择',
        onChange: async (val: string) => {
          await loadAdvertiserOptions(val);
        },
      },
      fieldName: 'platform',
      label: '平台',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: '请选择',
        options: advertiserOption,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
      },
      fieldName: 'platformAdvertiserId',
      label: '广告主名称',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '定向包名称',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '定向包描述',
    },
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
        default: () => h(
          'span', 
          { 
            style: { 
              fontWeight: 'bold', 
              color: '#1677ff',
            } 
          }, 
          '地域定向'
        ),
      }),
    },
    {
      component: 'Input',
      fieldName: 'regionCodeList',
      label: '地域定向',
      defaultValue: [],
      rules: computed(() => {
        return regionSel.value === '1' ? 'required' : '';
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
        default: () => h(
          'span', 
          { 
            style: { 
              fontWeight: 'bold', 
              color: '#1677ff',
            } 
          }, 
          '安装行为'
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
        default: () => h(
          'span', 
          { 
            style: { 
              fontWeight: 'bold', 
              color: '#1677ff',
            } 
          }, 
          '启动行为'
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
</script>

<template>
  <div>
    <titlePackageModal class="w-[40%]" :title="props.displayValue?.id ? '修改定向包':'添加定向包'">
      <Form>
        <template #regionCodeList>
          <div>
            <RadioGroup v-model:value="regionSel" button-style="solid" @change="handleChange(regionSel,'regionCodeList',regionArr)">
              <RadioButton value="0">不限</RadioButton>
              <RadioButton value="1">设置</RadioButton>
            </RadioGroup>
            <TreeSelector 
              v-if="regionSel === '1'"
              v-model:value="regionArr" 
              :tree-data="tagData.data.region"
              placeholder="搜索省份、城市"
            />
          </div>
        </template>
        <template #stayType>
          <RadioGroup v-model:value="regionStayType" button-style="solid">
            <RadioButton :value="1">常驻</RadioButton>
            <RadioButton :value="2">当前</RadioButton>
          </RadioGroup>
        </template>
        <template #sexList>
          <div class="flex flex-col gap-2">
            <RadioGroup 
              v-model:value="sexListType" 
              button-style="solid" 
              @change="handleChange(sexListType,'sexList',sexSelectedIds)"
            >
              <RadioButton value="0">不限</RadioButton>
              <RadioButton value="1">设置</RadioButton>
            </RadioGroup>
            <div v-if="sexListType === '1'">
              <CheckboxGroup 
                v-model:value="sexSelectedIds" 
                :options="sexOptions" 
              />
            </div>
          </div>
        </template>
        <template #ageList>
          <div class="flex flex-col gap-2">
            <RadioGroup 
              v-model:value="ageType" 
              button-style="solid"
              @change="handleChange(ageType,'ageList',ageListIds)"
            >
              <RadioButton value="0">不限</RadioButton>
              <RadioButton value="1">设置</RadioButton>
            </RadioGroup>
            <div v-if="ageType === '1'">
              <CheckboxGroup 
                v-model:value="ageListIds" 
                :options="ageOptions" 
              />
            </div>
          </div>
        </template>
        <template #installedApp>
          <RadioGroup v-model:value="installedAppType" button-style="solid">
            <RadioButton :value="1">不限</RadioButton>
            <RadioButton :value="2">未安装</RadioButton>
            <RadioButton :value="3">已安装</RadioButton>
          </RadioGroup>
        </template>
        <template #network>
          <RadioGroup v-model:value="networkType" button-style="solid">
            <RadioButton :value="1">不限</RadioButton>
            <RadioButton :value="2">WIFI</RadioButton>
          </RadioGroup>
        </template>
        <template #interestSet>
          <div>
            <RadioGroup v-model:value="interestSetType" button-style="solid" @change="handleChange(interestSetType,'interestSet',interestSetArr)">
              <RadioButton :value="0">不限</RadioButton>
              <RadioButton :value="-1">系统优选</RadioButton>
              <RadioButton :value="1">设置</RadioButton>
            </RadioGroup>
            <TreeSelector 
              v-if="interestSetType === 1"
              v-model:value="interestSetArr" 
              :tree-data="tagData.data.interest"
              placeholder="搜索兴趣标签、行业"
            />
          </div>
        </template>
        <template #androidVersionSet>
          <div class="flex flex-col gap-2">
            <RadioGroup 
              v-model:value="androidVersionSetType" 
              button-style="solid" 
              @change="handleChange(androidVersionSetType,'androidVersionSet',androidVersionSetIds)"
            >
              <RadioButton value="0">不限</RadioButton>
              <RadioButton value="1">设置</RadioButton>
            </RadioGroup>
            <div v-if="androidVersionSetType === '1'">
              <CheckboxGroup 
                v-model:value="androidVersionSetIds" 
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
              @change="handleChange(phonePriceSetType,'phonePriceSet',phonePriceSetIds)"
            >
              <RadioButton value="0">不限</RadioButton>
              <RadioButton value="1">设置</RadioButton>
            </RadioGroup>
            <div v-if="phonePriceSetType === '1'">
              <CheckboxGroup 
                v-model:value="phonePriceSetIds" 
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
              @change="handleChange(phoneSeriesSetType,'phoneSeriesSet',phoneSeriesSetIds)"
            >
              <RadioButton value="0">不限</RadioButton>
              <RadioButton value="1">设置</RadioButton>
            </RadioGroup>
            <div v-if="phoneSeriesSetType === '1'">
              <CheckboxGroup 
                v-model:value="phoneSeriesSetIds" 
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
              @change="handleChange(networkOperatorSetType,'networkOperatorSet',networkOperatorSetIds)"
            >
              <RadioButton value="0">不限</RadioButton>
              <RadioButton value="1">设置</RadioButton>
            </RadioGroup>
            <div v-if="networkOperatorSetType === '1'">
              <CheckboxGroup 
                v-model:value="networkOperatorSetIds" 
                :options="networkOperatorSetOptions" 
              />
            </div>
          </div>
        </template>
        <template #period>
          <RadioGroup v-model:value="periodType" button-style="solid">
            <RadioButton v-for="d in [-1, 7, 30, 180, 356]" :key="d" :value="d">{{ d === -1 ? '标识历史永久' : d + '天' }}</RadioButton>
          </RadioGroup>
        </template>
        <template #behavior>
          <RadioGroup v-model:value="behaviorType" button-style="solid">
            <RadioButton :value="2">未启动</RadioButton>
            <RadioButton :value="1">启动</RadioButton>
            <RadioButton :value="3">安装</RadioButton>
          </RadioGroup>
        </template>
        <template #startPeriod>
          <RadioGroup v-model:value="periodTypeVal" button-style="solid">
            <RadioButton v-for="d in [-1, 7, 30, 180, 356]" :key="d" :value="d">{{ d === -1 ? '标识历史永久' : d + '天' }}</RadioButton>
          </RadioGroup>
        </template>
        <template #startBehavior>
          <RadioGroup v-model:value="startBehaviorVal" button-style="solid">
            <RadioButton :value="2">未启动</RadioButton>
            <RadioButton :value="1">启动</RadioButton>
            <RadioButton :value="3">安装</RadioButton>
          </RadioGroup>
        </template>
      </Form>
    </titlePackageModal>
  </div>
</template>

<style lang="scss" scoped>

</style>
