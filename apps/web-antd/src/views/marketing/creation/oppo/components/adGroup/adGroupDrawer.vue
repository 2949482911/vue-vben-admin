<script lang="ts" setup name="adGroupDrawer">
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import {
  BILLINGTYPE_SELECT,
  FLOW_SELECT,
  TIME_LIMIT_SELECT,
  EXTENSION_SELECT,
  FLOWSCENE_SELECT,
  DAY_LIMIT_SELECT,
} from '../../projectEnum';
import { h, ref, watch, computed } from 'vue';
import TimeSelectionPeriod from './timeSelectionPeriod.vue';
import { Input, Tag, message } from 'ant-design-vue';
import { useProjectPlaceholder } from '#/utils/customName';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import adPlacementQualification from '#/views/marketing/creation/adPlacementQualification.vue';
import type { QualificationValue, ChannelPackageValue } from '../../Oppo.types';
import channelPackageModule from '#/views/marketing/creation/channelPackage.vue';
import type { OppoCampaignData } from '#/views/marketing/creation/oppo/Oppo.types';
const { campaign, accountInfo } = defineProps(
  {
    // 接收来自 index 的项目基本信息
    campaign: { 
      type: Object,
      default: () => ({}),
    },
    // 账户列表
    accountInfo: {
      type: Array<AccountInfo>,
      default: () => [],
    },
  },
);

const campaiginInfo = ref<OppoCampaignData>()
const isTimeSet = ref<boolean>(false);
const PROJECT_PLACEHOLDERS = [
  { label: '时间', value: '<时间>' },
  { label: '日期', value: '<日期>' },
  { label: '时分秒', value: '<时分秒>' },
  { label: '动态标号', value: '<动态标号>' },
] as const; // 使用 as const 保证类型安全

const { customizeName, handleTagClick } = useProjectPlaceholder('', 100);

const timeSet = ref('1'.repeat(336));
const advertiseQualificationId = ref<string>('');
//在抽屉关闭的时候再传过去广告资质
const localAdvertiserQualification = ref<Map<string, QualificationValue>>(new Map());
const deepOcpcPrice = ref<string>()
watch(() => campaign,(val)=>{
  if(val) {
    campaiginInfo.value = val;
  }
},{immediate:true, deep: true});
// ✅ 核心：计算属性 → 判断是否必填（根据其他字段值）
const isInstantAppRequired = computed(() => {
  // 条件：用户类型为企业时，公司名称必填
  return campaiginInfo.value.extensionType === 3;
});
//--------------广告投放资质ID---------------
const [AdPlacementQualification, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: adPlacementQualification,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      const res = modalApi.getData();
      if (!res) return;
    }
  },
});

function openAdPlacementQualificationModal() {
  modalApi.setData({});
  modalApi.open();
}

const channelPackageStr = ref<string>('');
const localChannelPackage = ref<Map<string, ChannelPackageValue>>(new Map());

//--------------渠道包---------------
const [ChannelPackageModule, ChannelPackageModalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: channelPackageModule,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      const res = ChannelPackageModalApi.getData() as Map<string, ChannelPackageValue>;

      if (!res) return;

      const rawData = res;

      let standardMap: Map<string, ChannelPackageValue>;
      if (rawData instanceof Map) {
        standardMap = rawData;
      } else if (typeof rawData === 'object' && rawData !== null) {
        standardMap = new Map(Object.entries(rawData));
      } else {
        return;
      }

      localChannelPackage.value = standardMap;

      if (standardMap.size === 0) {
        // 只有明确返回空数据时才清空回显
        channelPackageStr.value = '';
        return;
      }

      // 核心修改：使用 Array.from(res.values()) 将 Map 的值转为数组
      channelPackageStr.value = Array.from(standardMap.values())
        .map((item: any) => item.channelPackageName)
        .filter(Boolean)
        .join('，');
    }
  },
});

function openChannelPackageModal() {
  ChannelPackageModalApi.setData({});
  ChannelPackageModalApi.open();
}

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  async onOpenChange(isOpen) {
    if (isOpen) {
      const { extensionType, deliveryMode } = campaiginInfo.value;
      const adgroupData = drawerApi.getData()
      await formApi.setValues({
        ...adgroupData,
        adType_proxy: extensionType,
        deliveryMode: deliveryMode
      });
    }
  },
  async onConfirm() {
    //给广告资质加上校验
    // if (advertiseQualificationId.value)
    //   await formApi.setValues({ advertiseQualificationId: advertiseQualificationId.value });
    if (customizeName.value) await formApi.setValues({ adGroupName: customizeName.value });
    const formData = await formApi.getValues();
    if(isTimeSet.value) {
      if(timeSet.value === '0'.repeat(336)) {
        return message.error('请选择推广时段');
      }
    }
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    
    const finalParams = {
      ...formData,
      timeSet: timeSet.value,
      _isConfirmed: true,
    };
    // 移除代理字段再存储（保持数据纯净）
    // delete (finalParams as any).adType_proxy;
    drawerApi.setData({
      finalParams: finalParams,
      // localAdvertiserQualification: localAdvertiserQualification.value,
      // localChannelPackage: localChannelPackage.value,
    });
    await drawerApi.close();
  },
  async onCancel() {
    await reset();
    await drawerApi.close();
  },
});
async function reset() {
  timeSet.value = '1'.repeat(336);
  await formApi.resetForm();
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,

  wrapperClass: 'grid grid-cols-2 gap-x-4 gap-y-2',
  commonConfig: {
    componentProps: {
      allowClear: true,
      class: '!w-[250px]',
    },
    labelWidth: 150,
    formItemClass: 'col-span-1',
  },
  schema: [
    {
      component: 'Default' as any,
      fieldName: 'adGroupName',
      label: '广告组名称',
      rules: 'required',
      formItemClass: 'col-span-2 items-baseline',
    },
    {
      fieldName: 'adType_proxy',
      component: 'Input',
      formItemClass: 'hidden',
      dependencies: {
        show: () => false,
        triggerFields: [],
      },
    },
    {
      fieldName: 'deliveryMode',
      component: 'Input',
      formItemClass: 'hidden',
      dependencies: {
        show: () => false,
        triggerFields: [],
      },
    },
    // {
    //   component: 'Default' as any,
    //   fieldName: 'kwPackageType',
    //   label: '词包类型',
    // },
    
    // {
    //   component: 'Default' as any,
    //   fieldName: 'advertiseQualificationId',
    //   label: '广告投放资质ID',
    //   rules: 'required',
    // },
    {
      component: 'Input',
      fieldName: 'instantAppId',
      label: '快应用ID',
      dependencies: {
        show: (values) => {
          if(values.adType_proxy === 3) {
            return true
          }
          return false
        },
        rules: (values) => {
          if(values.adType_proxy === 3) {
            return 'required'
          }
          return ''
        },
        triggerFields: ['adType_proxy'],
      },
    },
    {
      component: 'Input',
      fieldName: 'instantAppUrl',
      label: '快应用链接',
      dependencies: {
        show: (values) => {
          if(values.adType_proxy === 3) {
            return true
          }
          return false
        },
        rules: (values) => {
          if(values.adType_proxy === 3) {
            return 'required'
          }
          return ''
        },
        triggerFields: ['adType_proxy'],
      },
    },

    {
      component: 'Select',
      componentProps: {
        options: BILLINGTYPE_SELECT,
      },
      fieldName: 'billingType',
      label: '计费方式',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: DAY_LIMIT_SELECT,
      },
      fieldName: 'dayLimit',
      label: '推广日期限制',
      rules: 'required',
    },
    {
      component: 'DatePicker',
      fieldName: 'beginTime',
      label: '投放开始日期',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYYMMDD',
      },
      dependencies: {
        show: (values) => {
          return values.dayLimit === 1
        },
        rules: (values) => {
          if(values.dayLimit === 1) {
            return 'required'
          }
          return ''
        },
        triggerFields: ['dayLimit'],
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'endTime',
      label: '投放结束日期',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYYMMDD',
      },
      dependencies: {
        show: (values) => {
          return values.dayLimit === 1
        },
        rules: (values) => {
          if(values.dayLimit === 1) {
            return 'required'
          }
          return ''
        },
        triggerFields: ['dayLimit'],
      },
    },
    {
      component: 'Input',
      fieldName: 'deepOcpcPrice',
      label: '深度ocpc转化出价',
      dependencies: {
        show: (values) => { 
          return values.deliveryMode !== 1
        },
        triggerFields: ['deliveryMode'],
      },
    },
    {
      component: 'Input',
      fieldName: 'ocpcPrice',
      label: '目标转化出价',
      dependencies: {
        show: (values) => { 
          return values.deliveryMode !== 1
        },
        triggerFields: ['deliveryMode'],
      },
    },
    // {
    //   component: 'Default' as any,
    //   fieldName: 'pageId',
    //   label: '落地页id'
    // },
    {
      component: 'Input',
      fieldName: 'price',
      label: '基础出价',
      dependencies: {
        show: (values) => {
          return values.deliveryMode !== 1
        },
        triggerFields: ['deliveryMode'],
      },
    },

    {
      component: 'Select',
      componentProps: {
        options: FLOW_SELECT,
      },
      fieldName: 'extensionFlow',
      label: '推广流量',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: EXTENSION_SELECT,
      },
      fieldName: 'extensionType',
      label: '标的物类型',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: FLOWSCENE_SELECT,
      },
      fieldName: 'flowScene',
      label: '流量场景',
      rules: 'required',
    },
    // {
    //   component: 'Input',
    //   fieldName: 'planId',
    //   label: '计划id',
    //   rules: 'required'
    // },
    {
      component: 'Select',
      fieldName: 'timeLimit',
      componentProps:{
        options:TIME_LIMIT_SELECT,
        onSelect: (value) => {
          if(value === 1) {
            isTimeSet.value = true
          } else {
            isTimeSet.value = false
          }
        }
      },
      label: '推广时段限制'
    },
    {
      component: 'Input',
      fieldName: 'price',
      label: '一阶段出价',
      suffix: () => h('span', { class: 'text-600' }, '元'),
      dependencies: {
        triggerFields: ['chargeType'],
        show: (values) => {
          return !!(values.chargeType && values.chargeType !== 3);
        },
        required: (values) => {
          return !!(values.chargeType && values.chargeType !== 3);
        },
        rules: (values) => {
          if (values.chargeType && values.chargeType !== 3) {
            return 'required';
          }
          return '';
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'secondOcpxPrice',
      label: '深度优化出价',
      suffix: () => h('span', { class: 'text-600' }, '元'),
    },
    {
      component: 'Input',
      fieldName: 'dailyBudget',
      label: '日预算',
      suffix: () => h('span', { class: 'text-600' }, '元'),
      rules: 'required',
    },
    
  ],
});
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="新建广告组">
      <Form>
        <template #adGroupName>
          <div class="flex flex-col gap-2 w-full">
            <Input
              v-model:value="customizeName"
              placeholder="请输入广告组名称"
              :maxlength="100"
              allow-clear
              show-count
              class="!w-[250px]"
            />

            <div class="flex flex-wrap items-center gap-2 text-xs mt-1">
              <span class="text-gray-500 font-medium">通配符：</span>
              <template v-for="item in PROJECT_PLACEHOLDERS" :key="item.value">
                <Tag
                  class="cursor-pointer select-none transition-all hover:border-blue-400"
                  :color="customizeName.includes(item.value) ? 'blue' : 'default'"
                  @click="handleTagClick(item.value)"
                >
                  {{ item.value }}
                </Tag>
              </template>
            </div>
          </div>
        </template>
        <template #channelPackage>
          <Input
            v-model:value="channelPackageStr"
            placeholder="请选择渠道包"
            class="!w-[250px]"
            readonly
            @click="openChannelPackageModal"
          />
        </template>
        <template #advertiseQualificationId>
          <Input
            v-model:value="advertiseQualificationId"
            placeholder="请选择广告投放资质ID"
            class="!w-[250px]"
            readonly
            @click="openAdPlacementQualificationModal"
          />
        </template>
        <!-- <template #instantAppId>
          <div style="display: flex; align-items: center;justify-content: flex-st art;margin: 0;">
            <span class="ant-form-item-required" style="margin-right: 4px;"></span>
            <span style="margin-right: 10px;font-size: 14px;white-space: nowrap;">快应用id</span>
            <Input
              v-model:value="instantAppId"
              placeholder="请输入快应用id"
            />
          </div>
        </template>
        <template #instantAppUrl>
          <div style="display: flex; align-items: center;justify-content: flex-start;">
            <span class="ant-form-item-required" style="margin-right: 4px;"></span>
            <span style="margin-right: 10px;font-size: 14px;white-space: nowrap;">快应用落地链接</span>
            <Input
              v-model:value="instantAppUrl"
              placeholder="请输入快应用落地链接"
            />
          </div>
        </template> -->
        <template #deepOcpcPrice>
          <Input
            v-model:value="deepOcpcPrice"
            placeholder="请输入深度ocpc转化出价"
          />
        </template>
      </Form>
      <div class="timePeriod">
        <div style="font-size: 14px;"><span style="color: red" v-if="isTimeSet">*</span>推广时段</div>
          <TimeSelectionPeriod class="timeTab" v-model="timeSet" />
          
      </div>
      <div class="timePeriod" style="color: red;font-size: 14px;" v-if="timeSet==='0'.repeat(336) && isTimeSet">请选择推广时段</div>
    </Drawer>
    <AdPlacementQualification :accountInfo="accountInfo" />
    <ChannelPackageModule :accountInfo="accountInfo" />
  </div>
</template>

<style lang="scss" scoped>
.timePeriod {
  display: flex;
  align-items: start;
  margin: 0 0 0 50px;

  .timeTab {
    margin: 0 0 0 10px;
  }
}
.ant-form-item-required::before {
  display: inline-block;
  margin-right: 4px;
  color: #ff4d4f;
  font-size: 14px;
  content: '*';
}
</style>
