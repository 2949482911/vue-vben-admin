<script lang="ts" setup>
import { useVbenDrawer} from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { BILLINGTYPE_SELECT, COMMODITYURL_SELECT, DELIVER_SELECT, PHASETWOGOAL_SELECT, PROMOTIONLINK_SELECT, VXFOLLOW_SELECT } from '../projectEnum'
import { h, ref } from 'vue';
import TimeSelectionPeriod from './timeSelectionPeriod.vue'

// 1. 定义一个响应式变量，记录上一个页面的关键信息
const projectContext = ref<any>({});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal:false,
  async onOpenChange(isOpen) {
    if (isOpen) {
      // 2. 当 Drawer 打开时，从 sessionStorage 读取上一个页面的数据
      const info = sessionStorage.getItem('projectInfo');
      if (info) {
        const data = JSON.parse(info);
        // 记录推广目标，用于后续逻辑判断
        projectContext.value = data;
      }
    }
  },
});

const timePeriod = ref<string>('')

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  wrapperClass: 'grid grid-cols-2 gap-x-4 gap-y-2', 
  commonConfig: {
    componentProps: {
      allowClear: true,
      class: 'w-[250px]', 
    },
    labelWidth: 150,
    formItemClass: 'col-span-1',
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'appPackageName',
      label: '应用包名',
      dependencies: {
        show: async () => {
          return projectContext.value["adType"] === 2;
        },
        triggerFields: ["adType"]
      },
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      // 快应用deepLink地址，推广目标为快应用/快游戏时必填，格式需以如下域名开头
      // http://hapjs.org/app/
      // https://hapjs.org/app/
      // hap://app/
      // http://hybrid.vivo.com/app/
      // https://hybrid.vivo.com/app/
      fieldName: 'rpkDeepLink',
      label: '快应用deepLink地址',
      dependencies: {
        show: async () => {
          return projectContext.value["adType"] === 8;
        },
        triggerFields: ["adType"]
      },
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'webSiteUrl',
      label: '推广链接',
      dependencies: {
        show: async () => {
          return projectContext.value["adType"] === 1;
        },
        triggerFields: ["adType"]
      },
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: PROMOTIONLINK_SELECT,
      },
      fieldName: 'h5Type',
      label: '推广链接类型',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'h5Code',
      label: '推广链接编码',
      dependencies: {
        show: async (values) => {
          return values.h5Type !== 2 && values.h5Type !== undefined;
        },
        triggerFields: ["h5Type"]
      },
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: COMMODITYURL_SELECT,
      },
      fieldName: 'productUrlType',
      label: '商品URL类型',
      dependencies: {
        show: async (values) => {
          return values.h5Type === 12;
        },
        triggerFields: ["h5Type"]
      },
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'appletOriginId',
      label: '小程序id',
      dependencies: {
        show: async () => {
          return projectContext.value["adType"] === 11;
        },
        triggerFields: ["adType"]
      },
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'appletPath',
      label: '小程序页面路径',
      dependencies: {
        show: async () => {
          return projectContext.value["adType"] === 11;
        },
        triggerFields: ["adType"]
      },
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'industry1',
      label: '一级行业分类id',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'industry2',
      label: '二级行业分类id',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: [],//要走接口
      },
      fieldName: 'advertiseQualificationId',
      label: '广告投放资质ID',
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: VXFOLLOW_SELECT,
      },
      fieldName: 'wechatFollow',
      label: '是否微信一键关注',
    },
    {
      component: 'DatePicker',
      defaultValue: undefined,
      fieldName: 'startDate',
      label: '投放开始日期',
      rules: 'selectRequired',
    },
    {
      component: 'DatePicker',
      defaultValue: undefined,
      fieldName: 'endDate',
      label: '投放结束日期',
      rules: 'selectRequired',
    },
    //投放时间段组件
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入',
    //   },
    //   fieldName: 'scheduleTime',
    //   label: '广告投放时段',
    //   rules: 'required',
    // },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: BILLINGTYPE_SELECT,
      },
      fieldName: 'chargeType',
      label: '计费类型',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: PHASETWOGOAL_SELECT,
      },
      fieldName: 'cvType',
      label: '二阶段转化目标',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'price',
      label: '一阶段出价',
      suffix: () => h('span', { class: 'text-600' }, '毫分'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'ocpxPrice',
      label: '二阶段出价',
      suffix: () => h('span', { class: 'text-600' }, '毫分'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '广告组名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'dailyBudget',
      label: '日预算',
      suffix: () => h('span', { class: 'text-600' }, '毫分'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: DELIVER_SELECT,
      },
      fieldName: 'spentType',
      label: '投放状态',
      rules: 'required',
    }
  ],
});
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="新建广告组">
      <Form></Form>
      <div class="timePeriod">
        <div>广告投放时段</div>
        <TimeSelectionPeriod class="timeTab"/>
      </div>
    </Drawer>
  </div>
</template>

<style lang="scss" scoped>
.timePeriod{
  display: flex;
  align-items: start;
  margin: 0 0 0 58px;

  .timeTab{
    margin: 0 0 0 10px;
  }
}
</style>
