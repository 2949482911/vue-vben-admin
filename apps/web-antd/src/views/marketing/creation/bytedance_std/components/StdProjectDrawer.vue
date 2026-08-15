<script setup lang="ts" name="StdProjectDrawer">
/**
 * 智擎版项目配置抽屉
 *
 * 完全对齐 bytedance/BytedanceCampaignDrawer.vue 模式：
 * - formFields 从 props 获取（不是从 getData 取）
 * - onOpenChange: getData() 取 project 数据，setState({ schema: props.formFields })
 * - 过滤 falsy 值，让 schema defaultValue 生效
 * - 优化目标/深度优化目标在打开抽屉时远程请求，用 formApi 更新 schema 的 options
 * - onConfirm: 还原嵌套对象，setData(project)
 */
import { nextTick, ref } from 'vue';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import MaterialSelector from '#/views/marketing/creation/components/material/MaterialSelector.vue';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type { DpaProductConfigData, StdProjectData } from '../bytedance';
import type {
  BytedanceDpaProductListItem,
  BytedanceEventManagerOptimizedGoalGetGoal,
} from '#/api/models/bytedance';
import { bytedanceAdvertisementApi } from '#/api/core';

const props = defineProps({
  formFields: {
    type: Array,
    default: () => [],
  },
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => [],
  },
  /** 投放商品配置（分配规则 + 各账户/统一商品），注入给 DpaProductButtonField 自带弹窗 */
  dpaProductConfig: {
    type: Object as () => DpaProductConfigData | null,
    default: null,
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleValuesChange: async (values: Record<string, any>) => {
    // const { landing_type, ad_type, external_action } = values;

    // // landing_type 或 ad_type 变了 → 重新请求优化目标，清空已选值
    // if (
    //   (landing_type && landing_type !== lastLandingType.value) ||
    //   (ad_type && ad_type !== lastAdType.value)
    // ) {
    //   lastLandingType.value = landing_type;
    //   lastAdType.value = ad_type;
    //   await loadOptimizedGoals(landing_type, ad_type);
    //   deepGoals.value = [];
    //   await formApi.setFieldValue('external_action', undefined);
    //   await formApi.setFieldValue('deep_external_action', undefined);
    //   injectGoalOptions();
    //   return;
    // }
    //
    // // external_action 变了 → 更新深度优化目标列表，清空已选值
    // if (external_action && external_action !== lastExternalAction.value) {
    //   lastExternalAction.value = external_action;
    //   updateDeepGoals(external_action);
    //   await formApi.setFieldValue('deep_external_action', undefined);
    //   injectGoalOptions();
    // }
  },
});

// ==================== 产品主图选择器（对齐 BytedancePromotionDrawer） ====================

/**
 * 产品主图素材选择器模态框
 * 仅选择图片、多选模式
 */
const [ProductImageModal, productImageModalApi] = useVbenModal({
  connectedComponent: MaterialSelector,
});

/** 当前已选的产品主图 image_ids，用于回显到素材选择器 */
const currentProductImageIds = ref<string[]>([]);

/**
 * 打开产品主图素材选择器
 * 注入 materialType='image' 限制只选图片，preSelectedIds 回显已选素材
 */
function openProductImageModal() {
  productImageModalApi.setData({
    materialType: 'image',
    preSelectedIds: currentProductImageIds.value,
  });
  productImageModalApi.open();
}

/**
 * 素材选择器确认回调：接收选中的图片素材，更新表单 v-model 绑定的 product_image_button 字段
 */
function onProductImageSelected(selectedMaterials: Array<{ id: string; name: string }>, _groupIndex?: number) {
  const imageIds = selectedMaterials.map((m) => String(m.id));
  currentProductImageIds.value = imageIds;
  // 通过 formApi 更新 product_image_button 字段，触发 v-model → ProductImageButtonField 自动展示已选数量
  formApi.setValues({ product_image_button: imageIds });
}

// ==================== 投放商品展示（配置入口在配置区 DpaProductConfigCard） ====================

/** 按分配规则计算生效的投放商品（用于项目内只读展示） */
function getEffectiveDpaProduct(): BytedanceDpaProductListItem | null {
  const cfg = props.dpaProductConfig;
  if (!cfg?.data || cfg.data.size === 0) return null;
  // 统一配置 → key '0'
  if (cfg.config.method !== 'PER_ACCOUNT') {
    return cfg.data.get('0')?.[0] || null;
  }
  // 按账户配置 → 取第一个有配置的账户商品
  for (const [, list] of cfg.data) {
    if (list?.[0]) return list[0];
  }
  return null;
}

/** 生效投放商品的展示文案 */
function getEffectiveDpaProductName(): string {
  const product = getEffectiveDpaProduct();
  if (!product) return '';
  return product.name || product.title || `商品ID:${product.product_id}`;
}

// 上次值记录（用于级联判断）
const lastLandingType = ref('');
const lastAdType = ref('');
const lastExternalAction = ref('');

// ==================== 优化目标远程数据 ====================

/** 优化目标列表（接口返回） */
const optimizedGoals = ref<BytedanceEventManagerOptimizedGoalGetGoal[]>([]);

/** 深度优化目标列表（从选中的优化目标的 deep_goals 中提取） */
const deepGoals = ref<NonNullable<BytedanceEventManagerOptimizedGoalGetGoal['deep_goals']>>([]);

/** 请求优化目标列表 */
async function loadOptimizedGoals(landingType: string, adType: string) {
  const advertiserIds = props.accountInfo.map((a) => a.localAdvertiserId);
  if (!advertiserIds.length || !landingType || !adType) {
    optimizedGoals.value = [];
    deepGoals.value = [];
    return;
  }
  optimizedGoals.value = await bytedanceAdvertisementApi.fetchOptimizedGoalList({
    advertiserId: advertiserIds,
    landing_type: landingType,
    ad_type: adType,
    asset_type: 'APP',
  });
}

/** 根据选中的优化目标更新深度优化目标列表 */
function updateDeepGoals(externalAction: string) {
  if (!externalAction) {
    deepGoals.value = [];
    return;
  }
  const matched = optimizedGoals.value.find((g) => g.external_action === externalAction);
  deepGoals.value = matched?.deep_goals || [];
}

/** 将优化目标/深度目标 options 注入到 schema */
function injectGoalOptions() {
  const externalOptions = optimizedGoals.value.map((g) => ({
    label: g.optimization_name,
    value: g.external_action,
  }));
  const deepOptions = deepGoals.value.map((g) => ({
    label: g.optimization_name,
    value: g.deep_external_action,
  }));

  const newSchema = (props.formFields as any[]).map((f: any) => {
    if (f.fieldName === 'external_action') {
      return {
        ...f,
        component: 'Select',
        // 远程选项为空时（如未配置账户）不强制必填，避免校验拦截导致其他改动（如投放身份）无法保存
        rules: externalOptions.length ? f.rules : undefined,
        componentProps: { options: externalOptions, placeholder: '请选择转化目标', allowClear: true, showSearch: true },
      };
    }
    if (f.fieldName === 'deep_external_action') {
      return {
        ...f,
        component: 'Select',
        componentProps: { options: deepOptions, placeholder: '请选择深度转化目标', allowClear: true, showSearch: true },
      };
    }
    return f;
  });
  formApi.setState({ schema: newSchema });
}

// ==================== Drawer 逻辑 ====================

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[35vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const project = drawerApi.getData() as StdProjectData;

      // 用 props.formFields 设置 schema
      formApi.setState({ schema: props.formFields });
      await nextTick();

      // 动态注入产品主图回调
      const schemaWithImage = (props.formFields as any[]).map((f: any) => {
        if (f.fieldName === 'product_image_button') {
          return { ...f, componentProps: { openProductImageModal } };
        }
        return f;
      });
      formApi.setState({ schema: schemaWithImage });
      await nextTick();

      // 平铺嵌套字段
      const flattenedData = {
        ...project,
        // 按分配规则计算投放商品展示值（配置入口在配置区卡片）
        dpa_product_display: getEffectiveDpaProductName(),
        // 产品主图：通过 v-model 的 product_image_button 字段管理（防御非数组值）
        product_image_button: Array.isArray(project.project_materials?.product_info?.image_ids)
          ? project.project_materials.product_info.image_ids
          : [],
        project_materials_product_info_titles:
          project.project_materials?.product_info?.titles,
        project_materials_product_info_selling_points:
          project.project_materials?.product_info?.selling_points,
        project_materials_call_to_action_buttons:
          project.project_materials?.call_to_action_buttons,
        yuntu_category_id: project.brand_info?.yuntu_category_id,
        cdp_brand_id: project.brand_info?.cdp_brand_id,
        cdp_brand_name: project.brand_info?.cdp_brand_name,
        project_materials_source: project.project_materials.source
      };

      // 过滤 falsy 值：只在值有效时才传入表单，让 schema defaultValue 生效
      const filteredData: Record<string, any> = {};
      for (const [key, value] of Object.entries(flattenedData)) {
        if (value) {
          filteredData[key] = value;
        }
      }
      // 移除嵌套对象字段
      const nestedKeys = [
        'project_materials', 'brand_info',
        'keywords', 'star_task_id_list', 'track_url_setting',
        '_dpaProductInfo',
      ];
      nestedKeys.forEach((k) => delete filteredData[k]);

      // 同步当前已选主图 ID，用于打开素材选择器时回显（防御非数组值）
      const rawImageIds = project.project_materials?.product_info?.image_ids;
      currentProductImageIds.value = Array.isArray(rawImageIds) ? rawImageIds.map(String) : [];

      await formApi.setValues(filteredData);

      // 请求优化目标列表
      await loadOptimizedGoals(filteredData.landing_type || 'APP', filteredData.ad_type || 'ALL');
      // 回显深度优化目标
      if (filteredData.external_action) {
        updateDeepGoals(filteredData.external_action);
      }
      injectGoalOptions();

      // 记录初始值，避免 onOpenChange 的 setValues 触发级联
      lastLandingType.value = filteredData.landing_type || 'APP';
      lastAdType.value = filteredData.ad_type || 'ALL';
      lastExternalAction.value = filteredData.external_action || '';
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();
    // @ts-ignore
    const project: StdProjectData = {
      ...currentValues,
      project_materials: {
        source: currentValues.project_materials_source,
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
          // 产品主图：v-model 的 product_image_button 字段即 image_ids
          image_ids: Array.isArray(currentValues.product_image_button)
            ? currentValues.product_image_button
            : [],
          selling_points: currentValues.project_materials_product_info_selling_points || [],
          local_material_image_ids: Array.isArray(currentValues.product_image_button)
            ? currentValues.product_image_button
            : []
        },
        anchor_related_type: currentValues.anchor_related_type || "OFF",
        anchor_material_list: [],
        component_material_list: [],
        external_url_material_list: [],
        web_url_material_list: [],
        open_url: currentValues.open_url || "",
        open_urls: [],
        ulink: currentValues.ulink_url || "",
        ulink_type: currentValues.ulink_url_type || "",
        mini_program_info: {
          app_id: "", start_path: "", params: "", url: "", urls: [], auto: []
        },
        playlet_series_url_list: [],
        original_video_title: "",
        dynamic_creative_switch: "",
        advanced_dc_settings: [],
        call_to_action_buttons: currentValues.project_materials_call_to_action_buttons || [],
        intelligent_generation: "OFF",
        params_type: "",
        external_url_field: "",
        external_url_params: "",
        open_url_type: "",
        open_url_field: "",
        open_url_params: ""
      },

      brand_info: {
        yuntu_category_id: 0,
        cdp_brand_id: 0,
        ecom_brand_id: 0,
        brand_name_id: 0,
        cdp_brand_name: "",
        sub_brand_names: [],
        sub_brand_name_ids: []
      },
      keywords: [] as any,
      star_task_id_list: [] as number[],
    };

    // 清理表单平铺字段
    [
      'product_image_button',
      'project_materials_product_info_titles',
      'project_materials_product_info_selling_points',
      'project_materials_call_to_action_buttons',
      'yuntu_category_id',
      'cdp_brand_id',
      'cdp_brand_name',
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
      <Form />
    </Drawer>

    <!-- 产品主图素材选择器 -->
    <ProductImageModal @update:material="onProductImageSelected" />
  </div>
</template>
