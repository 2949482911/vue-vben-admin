<script lang="ts" setup name="adGroupDrawer">
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import {
  BIDDING_STRATEGY,
  BILLINGTYPE_SELECT,
  COMMODITYURL_SELECT,
  DELIVER_SELECT,
  PHASETWOGOAL_SELECT,
  PROMOTIONLINK_SELECT,
  VXFOLLOW_SELECT,
} from '../projectEnum';
import { h, ref } from 'vue';
import TimeSelectionPeriod from './timeSelectionPeriod.vue';
import { Input, Tag } from 'ant-design-vue';
import { useProjectPlaceholder } from '#/utils/customName';
import type { AccountInfo } from '../../creation';
import adPlacementQualification from '#/views/marketing/creation/adPlacementQualification.vue';
import type { QualificationValue, ChannelPackageValue } from '../vivo';
import channelPackageModule from '#/views/marketing/creation/channelPackage.vue';

const PROJECT_PLACEHOLDERS = [
  { label: '时间', value: '<时间>' },
  { label: '日期', value: '<日期>' },
  { label: '时分秒', value: '<时分秒>' },
  { label: '动态标号', value: '<动态标号>' },
] as const; // 使用 as const 保证类型安全

const { customizeName, handleTagClick } = useProjectPlaceholder('', 100);

const { campaign, accountInfo, advertiserQualification, channelPackage } = defineProps({
  campaign: {
    type: Object,
    default: () => {
      return {
        name: '',
        adType: 0,
        mediaType: 0,
        dailyBudget: -1,
        campaignType: 0,
        pushForm: 0,
        pushType: 0,
        promotionType: 0,
        conversionMonitorType: 0,
      };
    },
  },
  // 账户列表
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => [],
  },
  advertiserQualification: {
    type: Object,
    default: new Map<string, QualificationValue>(),
  },
  channelPackage: {
    type: Object,
    default: new Map<string, ChannelPackageValue>(),
  },
});

const scheduleTimeValue = ref('1'.repeat(336));
const advertiseQualificationId = ref<string>('');
//在抽屉关闭的时候再传过去广告资质
const localAdvertiserQualification = ref<Map<string, QualificationValue>>(new Map());

//--------------广告投放资质ID---------------
const [AdPlacementQualification, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: adPlacementQualification,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      const res = modalApi.getData();

      // 1. 如果没有返回数据（点击叉号/取消），直接退出，保护现有回显
      if (!res) return;

      // 2. 数据在 res.advertiserQualification 里面
      // 我们提取它，并防御性地兼容“直接返回 Map”的情况
      const rawData = res.advertiserQualification || res;

      // 3. 强制标准化为 Map 类型
      let standardMap: Map<string, QualificationValue>;
      if (rawData instanceof Map) {
        standardMap = rawData;
      } else if (typeof rawData === 'object' && rawData !== null) {
        standardMap = new Map(Object.entries(rawData));
      } else {
        return;
      }

      // 4. 同步到本地 ref（确保它是标准的 Map）
      localAdvertiserQualification.value = standardMap;

      // 5. 判断是否为空
      if (standardMap.size === 0) {
        // 只有明确返回空数据时才清空回显
        advertiseQualificationId.value = '';
        return;
      }

      // 6. 此时调用 .values() 就绝对安全了
      const dataArray = Array.from(standardMap.values());

      advertiseQualificationId.value = dataArray
        .map((item) => item.qualificationName)
        .filter(Boolean)
        .join('，');
    }
  },
});

function openAdPlacementQualificationModal() {
  modalApi.setData({
    // 优先使用本地已经选好的，如果没有则使用 Props 传进来的初始值
    advertiserQualification:
      localAdvertiserQualification.value.size > 0
        ? localAdvertiserQualification.value
        : advertiserQualification,
  });
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
  ChannelPackageModalApi.setData({
    // 优先使用本地已经选好的，如果没有则使用 Props 传进来的初始值
    channelPackage: localChannelPackage.value.size > 0 ? localChannelPackage.value : channelPackage,
  });
  ChannelPackageModalApi.open();
}

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  async onOpenChange(isOpen) {
    if (isOpen) {
      const currentAdType = campaign.adType;

      // 使用不同的变量名避免遮蔽外层 ref
      const {
        adGroupData,
        localAdQualification: savedAdQualification,
        localChannelPackage: savedChannelPackage,
      } = drawerApi.getData();

      // ★ 关键修复：将抽屉 data 中保存的本地选择状态同步回 ref
      // 优先使用本地保存的选择，若没有则降级使用 Props 传入的初始值
      localAdvertiserQualification.value =
        savedAdQualification instanceof Map && savedAdQualification.size > 0
          ? new Map(savedAdQualification)
          : new Map(advertiserQualification as Map<string, QualificationValue>);

      localChannelPackage.value =
        savedChannelPackage instanceof Map && savedChannelPackage.size > 0
          ? new Map(savedChannelPackage)
          : new Map(channelPackage as Map<string, ChannelPackageValue>);

      // 根据本地 Map 更新展示字符串
      if (localAdvertiserQualification.value.size === 0) {
        advertiseQualificationId.value = '';
      } else {
        advertiseQualificationId.value = Array.from<QualificationValue>(
          localAdvertiserQualification.value.values(),
        )
          .map((item) => item.qualificationName)
          .filter(Boolean)
          .join('，');
      }

      if (localChannelPackage.value.size === 0) {
        channelPackageStr.value = '';
      } else {
        channelPackageStr.value = Array.from<ChannelPackageValue>(
          localChannelPackage.value.values(),
        )
          .map((item) => item.channelPackageName)
          .filter(Boolean)
          .join('，');
      }

      if (adGroupData) {
        customizeName.value = adGroupData.name;
        scheduleTimeValue.value = adGroupData.scheduleTime || '1'.repeat(336);
        await formApi.setValues({
          ...adGroupData,
          adType_proxy: currentAdType,
        });
      } else {
        customizeName.value = '';
        scheduleTimeValue.value = '1'.repeat(336);
        await reset();
        if (currentAdType) {
          await formApi.setValues({
            adType_proxy: currentAdType,
          });
        }
      }
    }
  },
  async onConfirm() {
    //给广告资质加上校验
    if (advertiseQualificationId.value)
      await formApi.setValues({ advertiseQualificationId: advertiseQualificationId.value });
    if (customizeName.value) await formApi.setValues({ name: customizeName.value });
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const formData = await formApi.getValues();
    const finalParams = {
      ...formData,
      scheduleTime: scheduleTimeValue.value,
      _isConfirmed: true,
    };
    // 移除代理字段再存储（保持数据纯净）
    delete (finalParams as any).adType_proxy;
    drawerApi.setData({
      finalParams: finalParams,
      localAdvertiserQualification: localAdvertiserQualification.value,
      localChannelPackage: localChannelPackage.value,
    });
    await drawerApi.close();
  },
  async onCancel() {
    await reset();
    await drawerApi.close();
  },
});

async function reset() {
  scheduleTimeValue.value = '1'.repeat(336);
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
      fieldName: 'name',
      label: '广告组名称',
      rules: 'required',
      formItemClass: 'col-span-2 items-baseline',
    },
    {
      component: 'Default' as any,
      fieldName: 'channelPackage',
      label: '渠道包',
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
      component: 'Input',
      fieldName: 'rpkDeepLink',
      label: '快应用deepLink地址',
      dependencies: {
        show: (values) => values.adType_proxy === 8,
        triggerFields: ['adType_proxy'],
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'webSiteUrl',
      label: '推广链接',
      dependencies: {
        show: (values) => values.adType_proxy === 1,
        triggerFields: ['adType_proxy'],
      },
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: PROMOTIONLINK_SELECT,
      },
      fieldName: 'h5Type',
      label: '推广链接类型',
      dependencies: {
        show: (values) => values.adType_proxy === 1,
        triggerFields: ['adType_proxy'],
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'h5Code',
      label: '推广链接编码',
      dependencies: {
        show: (values) => values.h5Type !== 2 && values.h5Type !== undefined,
        triggerFields: ['h5Type'],
      },
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: COMMODITYURL_SELECT,
      },
      fieldName: 'productUrlType',
      label: '商品URL类型',
      dependencies: {
        show: (values) => values.h5Type === 12,
        triggerFields: ['h5Type'],
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'appletOriginId',
      label: '小程序id',
      dependencies: {
        show: (values) => values.adType_proxy === 11,
        triggerFields: ['adType_proxy'],
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'appletPath',
      label: '小程序页面路径',
      dependencies: {
        show: (values) => values.adType_proxy === 11,
        triggerFields: ['adType_proxy'],
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'industry1',
      label: '一级行业分类id',
    },
    {
      component: 'Input',
      fieldName: 'industry2',
      label: '二级行业分类id',
    },
    {
      component: 'Default' as any,
      fieldName: 'advertiseQualificationId',
      label: '广告投放资质ID',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: VXFOLLOW_SELECT,
      },
      fieldName: 'wechatFollow',
      label: '是否微信一键关注',
    },
    {
      component: 'DatePicker',
      fieldName: 'startDate',
      label: '投放开始日期',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
      rules: 'required',
    },
    {
      component: 'DatePicker',
      fieldName: 'endDate',
      label: '投放结束日期',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: BILLINGTYPE_SELECT,
      },
      fieldName: 'chargeType',
      label: '计费类型',
      rules: 'required',
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
      component: 'Select',
      componentProps: {
        options: PHASETWOGOAL_SELECT,
      },
      fieldName: 'cvType',
      label: '转化目标',
    },
    {
      component: 'Input',
      fieldName: 'ocpxPrice',
      label: '转化出价',
      suffix: () => h('span', { class: 'text-600' }, '元'),
    },
    {
      component: 'Select',
      componentProps: {
        options: PHASETWOGOAL_SELECT,
      },
      fieldName: 'secondCvType',
      label: '深度优化转化目标',
    },
    {
      component: 'Input',
      fieldName: 'secondOcpxPrice',
      label: '深度优化出价',
      suffix: () => h('span', { class: 'text-600' }, '元'),
    },
    {
      component: 'Select',
      componentProps: {
        options: BIDDING_STRATEGY,
      },
      fieldName: 'biddingStrategy',
      label: '出价策略',
    },
    {
      component: 'Input',
      fieldName: 'dailyBudget',
      label: '日预算',
      suffix: () => h('span', { class: 'text-600' }, '元'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: DELIVER_SELECT,
      },
      fieldName: 'spentType',
      label: '投放状态',
      rules: 'required',
    },
  ],
});
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="新建广告组">
      <Form>
        <template #name>
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
      </Form>
      <div class="timePeriod">
        <div><span style="color: red">*</span>广告投放时段</div>
        <TimeSelectionPeriod class="timeTab" v-model="scheduleTimeValue" />
      </div>
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
</style>
