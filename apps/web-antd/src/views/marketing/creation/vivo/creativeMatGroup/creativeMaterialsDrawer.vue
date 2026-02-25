<script lang="ts" setup>
import { useVbenDrawer} from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { ADREMINDER_SELECT, ATTRIBUTION_SELECT, COMPREHENSIVESEARCH_SELECT, DETAILPAGE_SELECT, DISPLAYFORM_SELECT, FLOWSWITCH_SELECT } from '../projectEnum';

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
    labelWidth: 120,
  },
  schema: [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: DISPLAYFORM_SELECT,
      },
      fieldName: 'placeType',
      label: '展现形式',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'virtualPositionId',
      label: '虚拟广告位id',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'materialNormId',
      label: '创意物料规格id',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'title',
      label: '标题',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'subTitle',
      label: '副标题',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'pushSubTitle',
      label: '应用副标题',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'avatarCode',//待定，需要再次确定
      label: '头像',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'productName',
      label: '产品名',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'appName',
      label: '应用名',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'imgsCode',
      label: '视频素材',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'dpaBlueprintTemplate',
      label: 'dpa蓝图模板id',
    },
    //综搜广告属性，搜索sug站点类型，同一个样式只能选取一种类型，可选值详见 【附录-h5类型】综搜目前支持使用类型3：悟空站点
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
        options: COMPREHENSIVESEARCH_SELECT,
      },
      fieldName: 'sugSiteType',
      label: '综搜广告属性',
    },
    //综搜广告属性，搜索sug站点编码，多个用逗号隔开
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'sugSiteCode',
      label: '综搜广告属性',
    },
    //综搜广告属性，子链样式：子链名称，多个用配置符号隔开，子链至少三个，至多四个
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'sugLinkName',
      label: '综搜广告属性',
    },
    //综搜广告属性，橱窗样式：图片名称，多个用配置符号隔开，都为空或都不为空
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'sugImageName',
      label: '综搜广告属性',
    },
    //综搜广告属性，子链样式：子链站点url，多个用逗号隔开
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'sugLinkSiteUrl',
      label: '综搜广告属性',
    },
    //综搜广告属性，橱窗样式：橱窗站点url，多个用逗号隔开
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'sugImageSiteUrl',
      label: '综搜广告属性',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'btnText',
      label: '通知广告按钮文案',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: ADREMINDER_SELECT,
      },
      fieldName: 'strongReminder',
      label: '通知广告提醒方式',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'groupId',
      label: '广告组id',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '广告名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'deepLink',
      label: 'deepLink链接',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'viewMonitorUrl',
      label: '曝光监控地址',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'clickMonitorUrl',
      label: '点击监控地址',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
        options: ATTRIBUTION_SELECT,
      },
      fieldName: 'videoAttribution',
      label: '视频类型拓展归因',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'pageUrl',
      label: '详情页地址',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'h5Code',
      label: '详情页id编码',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
        options: DETAILPAGE_SELECT,
      },
      fieldName: 'h5Type',
      label: '详情页类型',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
        options: FLOWSWITCH_SELECT,
      },
      fieldName: 'generalSwitch',
      label: '流量优选开关',
    }
  ],
});

</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="广告创意素材组">
      <Form></Form>
    </Drawer>
  </div>
</template>

<style lang="scss" scoped>

</style>
