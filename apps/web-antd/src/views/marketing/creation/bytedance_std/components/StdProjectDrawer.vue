<script setup lang="ts" name="StdProjectDrawer">
/**
 * 智擎版项目配置抽屉
 *
 * 单层结构：所有参数（基础信息、投放设置、出价预算、素材配置等）均在项目层级
 * 复用现有共享组件：素材选择器、标题包、定向包、落地页选择器
 */
import { nextTick, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type { StdProjectData } from '#/views/marketing/creation/bytedance_std/bytedance';
import { markRaw } from 'vue';
import ProductImageButtonField
  from '#/views/marketing/creation/bytedance/components/ProductImageButtonField.vue';
import TimeSelectionPeriod
  from '#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue';
import {
  BytedanceCampaign_ad_type,
  BytedanceCampaign_bid_type,
  BytedanceCampaign_deep_bid_type,
  BytedanceCampaign_delivery_type,
  BytedanceCampaign_external_action,
  BytedanceCampaign_landing_type,
  BytedanceCampaign_marketing_goal,
  BytedanceCampaign_pricing,
  BytedanceCampaign_product_setting,
  BytedanceCampaign_schedule_type,
  BytedanceCampgin_budget_mode,
  BytedancePromotion_is_comment_disable,
  BytedanceCampaign_aigc_dynamic_creative_switch,
  CampaignOperation,
  DeliveryMode,
  BytedanceCampaign_landing_page_stay_time,
  BytedancePromotion_anchor_related_type,
} from '#/views/marketing/creation/bytedance_std/enums';

const props = defineProps({
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => [],
  },
});

/** 产品主图选中上下文 */
const productImageContext = reactive<{ selectedIds: string[] }>({
  selectedIds: [],
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
});

// ==================== 项目表单字段 ====================
// 智擎版 API (std_project/create) 所有参数均在项目层级
const projectFormFields = [
  // -- 基本信息 --
  { component: 'AdNameGen', fieldName: 'name', label: '项目名称', rules: 'required' },
  {
    component: 'Select',
    fieldName: 'operation',
    componentProps: { options: CampaignOperation },
    label: '启停状态',
    defaultValue: 'ENABLE',
  },
  {
    component: 'Select',
    fieldName: 'delivery_mode',
    componentProps: { options: DeliveryMode },
    label: '投放模式',
    defaultValue: 'PROCEDURAL',
  },
  {
    component: 'Select',
    fieldName: 'landing_type',
    componentProps: {
      options: BytedanceCampaign_landing_type,
      placeholder: '请选择营销目的',
    },
    label: '营销目的',
    rules: 'required',
    defaultValue: 'APP',
  },
  {
    component: 'Select',
    fieldName: 'marketing_goal',
    componentProps: { options: BytedanceCampaign_marketing_goal },
    label: '营销场景',
    defaultValue: 'VIDEO_AND_IMAGE',
  },
  {
    component: 'Select',
    fieldName: 'ad_type',
    componentProps: { options: BytedanceCampaign_ad_type },
    label: '项目类型',
    defaultValue: 'ALL',
  },
  {
    component: 'Select',
    fieldName: 'delivery_type',
    componentProps: { options: BytedanceCampaign_delivery_type },
    label: '投放类型',
    defaultValue: 'NORMAL',
  },

  // -- 优化目标 --
  {
    component: 'Select',
    fieldName: 'external_action',
    label: '转化目标',
    rules: 'required',
    componentProps: {
      options: BytedanceCampaign_external_action,
      placeholder: '请选择优化目标',
    },
  },
  {
    component: 'Select',
    fieldName: 'deep_external_action',
    label: '深度转化目标',
    componentProps: {
      options: BytedanceCampaign_external_action,
      placeholder: '请选择深度优化目标',
    },
  },
  {
    component: 'Select',
    fieldName: 'deep_bid_type',
    componentProps: { options: BytedanceCampaign_deep_bid_type },
    label: '深度优化方式',
    defaultValue: 'DEEP_BID_DEFAULT',
  },

  // -- 商品设置 --
  {
    component: 'Select',
    fieldName: 'related_product_setting',
    componentProps: { options: BytedanceCampaign_product_setting },
    label: '商品设置',
    defaultValue: 'NO_MAP',
  },
  {
    component: 'Input',
    fieldName: 'related_product_platform_id',
    label: '商品平台ID',
  },
  {
    component: 'Input',
    fieldName: 'related_product_id',
    label: '商品ID',
  },
  {
    component: 'Input',
    fieldName: 'related_product_unique_id',
    label: '升级版商品ID',
  },

  // -- 排期 --
  {
    component: 'Select',
    fieldName: 'schedule_type',
    componentProps: { options: BytedanceCampaign_schedule_type },
    label: '投放时间',
    defaultValue: 'SCHEDULE_FROM_NOW',
  },
  {
    component: 'DatePicker',
    fieldName: 'start_time',
    componentProps: { format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD' },
    label: '开始时间',
    dependencies: {
      show: (cv: Record<string, any>) => cv['schedule_type'] === 'SCHEDULE_START_END',
      triggerFields: ['schedule_type'],
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'end_time',
    componentProps: { format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD' },
    label: '结束时间',
    dependencies: {
      show: (cv: Record<string, any>) => cv['schedule_type'] === 'SCHEDULE_START_END',
      triggerFields: ['schedule_type'],
    },
  },
  {
    component: markRaw(TimeSelectionPeriod),
    fieldName: 'schedule_time',
    label: '投放时段',
    componentProps: {},
  },

  // -- 竞价策略与出价 --
  {
    component: 'Select',
    fieldName: 'bid_type',
    componentProps: { options: BytedanceCampaign_bid_type },
    label: '竞价策略',
    defaultValue: 'CUSTOM',
  },
  {
    component: 'Select',
    fieldName: 'pricing',
    componentProps: { options: BytedanceCampaign_pricing },
    label: '计费方式',
    defaultValue: 'PRICING_OCPM',
  },

  // -- 预算 --
  {
    component: 'Select',
    fieldName: 'budget_mode',
    componentProps: { options: BytedanceCampgin_budget_mode },
    label: '预算模式',
    defaultValue: 'BUDGET_MODE_DAY',
  },
  {
    component: 'InputNumber',
    fieldName: 'budget',
    label: '预算',
    defaultValue: 0,
    dependencies: {
      show: (cv: Record<string, any>) => cv['budget_mode'] !== 'BUDGET_MODE_INFINITE',
      triggerFields: ['budget_mode'],
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'bid',
    label: '出价',
    defaultValue: 0,
    rules: 'required',
    help: '范围 0.2-999',
  },
  {
    component: 'InputNumber',
    fieldName: 'roi_goal',
    label: 'ROI系数',
    defaultValue: 0,
    help: '深度优化方式为ROI时必填',
  },

  // -- 落地页链接 --
  {
    component: 'Input',
    fieldName: 'open_url',
    label: '直达链接',
  },
  {
    component: 'Input',
    fieldName: 'ulink_url',
    label: '备用链接',
  },
  {
    component: 'Select',
    fieldName: 'ulink_url_type',
    componentProps: {
      options: [
        { label: 'Universal Link', value: 'UNIVERSAL_LINK' },
        { label: 'AppLink', value: 'APPLINK' },
      ],
    },
    label: '备用链接类型',
  },
  {
    component: 'Select',
    fieldName: 'landing_page_stay_time',
    componentProps: { options: BytedanceCampaign_landing_page_stay_time },
    label: '店铺停留时长',
    help: '电商营销目的下',
  },

  // -- 产品主图（产品信息） --
  {
    component: 'TextareaTags',
    fieldName: 'project_materials_product_info_titles',
    label: '产品名称',
    help: '字数限制[1-20]',
  },
  {
    component: markRaw(ProductImageButtonField),
    fieldName: 'product_image_button',
    label: '产品主图',
    componentProps: {},
  },
  {
    component: 'TextareaTags',
    fieldName: 'project_materials_product_info_selling_points',
    label: '产品卖点',
    help: '字符限制[6-9]，个数[1,10]',
  },
  {
    component: 'TextareaTags',
    fieldName: 'project_materials_call_to_action_buttons',
    label: '行动号召',
    help: '字符限制[2-4]，个数[1,10]',
  },

  // -- 创意设置 --
  {
    component: 'Select',
    fieldName: 'is_comment_disable',
    componentProps: { options: BytedancePromotion_is_comment_disable },
    label: '评论管理',
    defaultValue: 'OFF',
  },
  {
    component: 'Input',
    fieldName: 'source',
    label: '来源',
  },
  {
    component: 'Select',
    fieldName: 'anchor_related_type',
    componentProps: { options: BytedancePromotion_anchor_related_type },
    label: '原生锚点',
    defaultValue: 'OFF',
  },

  // -- AIGC --
  {
    component: 'Switch',
    formItemClass: 'w-[150px]',
    fieldName: 'aigc_dynamic_creative_switch',
    componentProps: {
      checkedValue: 'ON',
      unCheckedValue: 'OFF',
      checkedChildren: 'ON',
      unCheckedChildren: 'OFF',
    },
    label: 'AIGC动态素材',
    defaultValue: 'OFF',
  },

  // -- 隐藏字段（保证参数完整）--
  {
    component: 'Input',
    fieldName: 'search_continue_delivery',
    defaultValue: 'OFF',
    dependencies: { show: false, triggerFields: ['*'] },
  },
  {
    component: 'Input',
    fieldName: 'layer_roi_switch',
    defaultValue: 'OFF',
    dependencies: { show: false, triggerFields: ['*'] },
  },
  {
    component: 'Input',
    fieldName: 'auto_extend_traffic',
    defaultValue: 'OFF',
    dependencies: { show: false, triggerFields: ['*'] },
  },
  {
    component: 'Input',
    fieldName: 'star_auto_delivery_switch',
    defaultValue: 'OFF',
    dependencies: { show: false, triggerFields: ['*'] },
  },
  {
    component: 'Input',
    fieldName: 'star_auto_material_addition_switch',
    defaultValue: 'OFF',
    dependencies: { show: false, triggerFields: ['*'] },
  },
  {
    component: 'Input',
    fieldName: 'audience_type',
    defaultValue: 'UNLIMITED',
    dependencies: { show: false, triggerFields: ['*'] },
  },
  {
    component: 'Input',
    fieldName: 'native_type',
    defaultValue: 'ACCOUNT',
    dependencies: { show: false, triggerFields: ['*'] },
  },
  {
    component: 'Input',
    fieldName: 'ad_download_status',
    defaultValue: 'OFF',
    dependencies: { show: false, triggerFields: ['*'] },
  },
];

// ==================== Drawer 逻辑 ====================
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[35vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const project = drawerApi.getData() as StdProjectData;
      formApi.setState({ schema: projectFormFields });
      await nextTick();

      // 动态注入产品主图回调
      const schemaWithImage = (projectFormFields as any[]).map((f: any) => {
        if (f.fieldName === 'product_image_button') {
          return { ...f, componentProps: { productImageContext } };
        }
        return f;
      });
      formApi.setState({ schema: schemaWithImage });
      await nextTick();

      // 平铺嵌套字段到表单
      const flattened: Record<string, any> = {
        ...project,
        // related_product 平铺
        related_product_setting: project.related_product?.product_setting,
        related_product_platform_id: project.related_product?.product_platform_id,
        related_product_id: project.related_product?.product_id,
        related_product_unique_id: project.related_product?.unique_product_id,
        // project_materials.product_info 平铺
        project_materials_product_info_titles:
          project.project_materials?.product_info?.titles,
        project_materials_product_info_selling_points:
          project.project_materials?.product_info?.selling_points,
        project_materials_call_to_action_buttons:
          project.project_materials?.call_to_action_buttons,
        // 品牌信息平铺
        yuntu_category_id: project.brand_info?.yuntu_category_id,
        cdp_brand_id: project.brand_info?.cdp_brand_id,
        cdp_brand_name: project.brand_info?.cdp_brand_name,
      };

      // 回显产品主图
      productImageContext.selectedIds =
        project.project_materials?.product_info?.image_ids || [];

      // 过滤嵌套对象字段
      const nestedKeys = [
        'related_product', 'project_materials', 'brand_info',
        'keywords', 'star_task_id_list', 'track_url_setting',
        '_dpaProductInfo',
      ];
      nestedKeys.forEach((k) => delete flattened[k]);

      await formApi.setValues(flattened);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    const project: StdProjectData = {
      ...currentValues,

      // related_product 还原
      related_product: {
        product_setting: currentValues.related_product_setting || 'NO_MAP',
        product_platform_id: currentValues.related_product_platform_id || '',
        product_id: currentValues.related_product_id || '',
        unique_product_id: currentValues.related_product_unique_id || '',
      },

      // project_materials 还原
      project_materials: {
        local_video_material_list: [],
        local_image_material_list: [],
        video_material_list: [],
        image_material_list: [],
        title_material_list: [],
        carousel_material_list: [],
        trial_play_material_list: [],
        instant_play_material_list: [],
        product_info: {
          titles: currentValues.project_materials_product_info_titles || [],
          image_ids: productImageContext.selectedIds || [],
          selling_points: currentValues.project_materials_product_info_selling_points || [],
          local_material_image_ids: productImageContext.selectedIds || [],
        },
        anchor_related_type: currentValues.anchor_related_type || 'OFF',
        anchor_material_list: [],
        component_material_list: [],
        external_url_material_list: [],
        web_url_material_list: [],
        open_url: currentValues.open_url || '',
        open_urls: [],
        ulink: currentValues.ulink_url || '',
        ulink_type: currentValues.ulink_url_type || '',
        mini_program_info: {
          app_id: '', start_path: '', params: '', url: '', urls: [], auto: [],
        },
        playlet_series_url_list: [],
        original_video_title: '',
        dynamic_creative_switch: '',
        advanced_dc_settings: [],
        call_to_action_buttons:
          currentValues.project_materials_call_to_action_buttons || [],
        intelligent_generation: 'OFF',
        params_type: '',
        external_url_field: '',
        external_url_params: '',
        open_url_type: '',
        open_url_field: '',
        open_url_params: '',
      },

      // brand_info 还原
      brand_info: {
        yuntu_category_id: 0,
        cdp_brand_id: 0,
        ecom_brand_id: 0,
        brand_name_id: 0,
        cdp_brand_name: '',
        sub_brand_names: [],
        sub_brand_name_ids: [],
      },

      // track_url_setting 还原
      track_url_setting: {
        track_url_type: '',
        track_url_group_id: 0,
        track_url: [],
        action_track_url: [],
        active_track_url: [],
        video_play_effective_track_url: [],
        video_play_done_track_url: [],
        video_play_first_track_url: [],
        send_type: 'SERVER_SEND',
      },

      keywords: [] as any,
      star_task_id_list: [] as number[],
    };

    // 清理表单平铺字段
    ['product_image_button', 'project_materials_product_info_titles',
      'project_materials_product_info_selling_points',
      'project_materials_call_to_action_buttons',
      'related_product_setting', 'related_product_platform_id',
      'related_product_id', 'related_product_unique_id',
      'yuntu_category_id', 'cdp_brand_id', 'cdp_brand_name',
    ].forEach((key) => {
      delete (project as any)[key];
    });

    drawerApi.setData(project);
    await drawerApi.close();
  },
  onClosed() {
    formApi.resetForm();
    drawerApi.close();
  },
  onCancel() {
    formApi.resetForm();
    drawerApi.close();
  },
});
</script>

<template>
  <div>
    <Drawer title="智擎项目配置">
      <Form></Form>
    </Drawer>
  </div>
</template>
