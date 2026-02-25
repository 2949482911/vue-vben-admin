<script lang="ts" setup>
import { useVbenDrawer} from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { ADTYPE_SELECT, CONVERSION_SELECT, MEDIA_SELECT, NOTIFORMAT_SELECT, PROJRCT_SELECT, PROMOTION_SELECT } from '../projectEnum';
import { h } from 'vue';

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal:false,
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
        allowClear: true,
      class: 'w-[300px]'
    },
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '项目名字',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: PROJRCT_SELECT,
      },
      fieldName: 'adType',
      label: '推广目标',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: MEDIA_SELECT,
      },
      fieldName: 'mediaType',
      label: '媒体类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'dailyBudget',
      label: '计划日限额',
      suffix: () => h('span', { class: 'text-600' }, '毫分'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: ADTYPE_SELECT,
      },
      defaultValue:0,
      fieldName: 'campaignType',
      label: '广告类型',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: NOTIFORMAT_SELECT,
      },
      fieldName: 'pushForm',
      label: '通知形式',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: PROMOTION_SELECT,
      },
      defaultValue:0,
      fieldName: 'promotionType',
      label: '推广模式',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: CONVERSION_SELECT,
      },
      fieldName: 'promotionType',
      label: '转化监测',
    },
  ],
});
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="添加标题包">
      <Form></Form>
    </Drawer>
  </div>
</template>

<style lang="scss" scoped>

</style>
